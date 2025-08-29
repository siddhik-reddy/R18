const express = require('express');
const axios = require('axios');
const JSSoup = require('jssoup').default;
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Serve static files
app.use(express.static('public'));

// Subject class
class Subject {
    constructor(subjectCode, subjectName, internal, external, total, grade, credits) {
        this.subjectCode = subjectCode;
        this.subjectName = subjectName;
        this.internal = internal;
        this.external = external;
        this.total = total;
        this.grade = grade;
        this.credits = credits;
    }
}

// Global variables
let examCodes = {};
const JNTUH_URLS = {
    // Primary URLs (IP-based - more reliable)
    HOME_IP: 'http://202.63.105.184/results/jsp/home.jsp',
    RESULT_IP: 'http://202.63.105.184/results/resultAction',
    
    // Fallback URLs (domain-based)
    HOME_DOMAIN: 'http://results.jntuh.ac.in/jsp/home.jsp',
    RESULT_DOMAIN: 'http://results.jntuh.ac.in/resultAction'
};

// Fallback exam codes (commonly used JNTUH R18 exam codes)
const FALLBACK_EXAM_CODES = {
    "1-1": ["1323", "1356", "1389", "1422", "1455", "1488"],
    "1-2": ["1324", "1357", "1390", "1423", "1456", "1489"],
    "2-1": ["1325", "1358", "1391", "1424", "1457", "1490"],
    "2-2": ["1326", "1359", "1392", "1425", "1458", "1491"],
    "3-1": ["1327", "1360", "1393", "1426", "1459", "1492"],
    "3-2": ["1328", "1361", "1394", "1427", "1460", "1493"],
    "4-1": ["1329", "1362", "1395", "1428", "1461", "1494"],
    "4-2": ["1330", "1363", "1396", "1429", "1462", "1495"]
};

// Grade point mapping
const GRADE_POINTS = {
    'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'D': 4, 'F': 0, 'Ab': 0
};

// Utility function to ensure data directory exists
function ensureDataDir() {
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
    }
    return dataDir;
}

// Calculate CGPA
function calculateCGPA(subjects) {
    let totalCredits = 0;
    let totalGradePoints = 0;
    
    subjects.forEach(subject => {
        const credits = parseFloat(subject.credits) || 0;
        const gradePoint = GRADE_POINTS[subject.grade.toUpperCase()] || 0;
        
        totalCredits += credits;
        totalGradePoints += gradePoint * credits;
    });
    
    return totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : '0.00';
}

// Calculate overall CGPA
function calculateOverallCGPA(allResults) {
    let totalCredits = 0;
    let totalGradePoints = 0;
    
    allResults.forEach(semesterResult => {
        semesterResult.subjects.forEach(subject => {
            const credits = parseFloat(subject.credits) || 0;
            const gradePoint = GRADE_POINTS[subject.grade.toUpperCase()] || 0;
            
            totalCredits += credits;
            totalGradePoints += gradePoint * credits;
        });
    });
    
    return totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : '0.00';
}

// Get grade distribution
function getGradeDistribution(subjects) {
    const distribution = {};
    subjects.forEach(subject => {
        const grade = subject.grade.toUpperCase();
        distribution[grade] = (distribution[grade] || 0) + 1;
    });
    return distribution;
}

// Load or fetch exam codes
async function initExamCodes() {
    const dataDir = ensureDataDir();
    const codesFile = path.join(dataDir, 'codes.json');
    
    try {
        if (fs.existsSync(codesFile)) {
            examCodes = JSON.parse(fs.readFileSync(codesFile, 'utf8'));
            console.log('✅ Loaded exam codes from cache');
            console.log(`📊 Found ${Object.keys(examCodes).length} semesters with codes`);
            return;
        }
    } catch (error) {
        console.warn('⚠️  Error reading cached codes:', error.message);
    }
    
    // Try to fetch from JNTUH website
    console.log('🌐 Attempting to fetch exam codes from JNTUH website...');
    try {
        await fetchExamCodes();
        console.log('✅ Successfully fetched exam codes from JNTUH');
    } catch (error) {
        console.warn('⚠️  Failed to fetch from JNTUH website:', error.message);
        console.log('🔄 Using fallback exam codes...');
        
        // Use fallback codes
        examCodes = { ...FALLBACK_EXAM_CODES };
        
        // Save fallback codes to cache
        try {
            fs.writeFileSync(codesFile, JSON.stringify(examCodes, null, 2));
            console.log('💾 Saved fallback exam codes to cache');
        } catch (saveError) {
            console.warn('⚠️  Could not save fallback codes:', saveError.message);
        }
    }
}

// Fetch exam codes from JNTUH website with fallback URLs
async function fetchExamCodes() {
    const axiosConfig = {
        timeout: 10000, // 10 second timeout
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    };
    
    // Try both IP and domain URLs
    const urlsToTry = [
        { url: JNTUH_URLS.HOME_IP, name: 'IP-based URL' },
        { url: JNTUH_URLS.HOME_DOMAIN, name: 'domain-based URL' }
    ];
    
    for (let { url, name } of urlsToTry) {
        try {
            console.log(`🌐 Trying ${name}: ${url}`);
            const response = await axios.get(url, axiosConfig);
            
            const soup = new JSSoup(response.data);
            const tables = soup.findAll('table');
            
            if (!tables || tables.length === 0) {
                console.warn(`⚠️  No tables found on ${name}`);
                continue;
            }
            
            const trs = tables[0].findAll('tr');
            
            const codesDictionary = {
                "1-1": [], "1-2": [], "2-1": [], "2-2": [],
                "3-1": [], "3-2": [], "4-1": [], "4-2": []
            };
            
            const stringDictionary = {
                " I Year I ": "1-1", " I Year II": "1-2",
                " II Year I ": "2-1", " II Year II": "2-2",
                " III Year I ": "3-1", " III Year II": "3-2",
                " IV Year I ": "4-1", " IV Year II": "4-2"
            };
            
            let codesFound = 0;
            trs.forEach(tr => {
                try {
                    const tds = tr.findAll('td');
                    if (tds && tds.length > 0) {
                        const td = tds[0];
                        const links = td.findAll('a');
                        if (links && links.length > 0 && td.text.includes('R18')) {
                            const link = links[0].attrs.href;
                            const codePos = link.search('examCode=');
                            if (codePos !== -1) {
                                const code = link.substring(codePos + 9, codePos + 13);
                                for (let key in stringDictionary) {
                                    if (td.text.includes(key)) {
                                        codesDictionary[stringDictionary[key]].push(code);
                                        codesFound++;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                } catch (err) {
                    // Skip invalid rows
                }
            });
            
            // Remove duplicates
            for (let key in codesDictionary) {
                codesDictionary[key] = [...new Set(codesDictionary[key])];
            }
            
            // Merge with fallback codes to ensure comprehensive coverage
            for (let semester in FALLBACK_EXAM_CODES) {
                const existingCodes = new Set(codesDictionary[semester]);
                FALLBACK_EXAM_CODES[semester].forEach(code => {
                    if (!existingCodes.has(code)) {
                        codesDictionary[semester].push(code);
                    }
                });
            }
            
            examCodes = codesDictionary;
            
            // Save to file
            const dataDir = ensureDataDir();
            const codesFile = path.join(dataDir, 'codes.json');
            fs.writeFileSync(codesFile, JSON.stringify(codesDictionary, null, 2));
            
            console.log(`✅ Successfully fetched ${codesFound} exam codes using ${name}`);
            return; // Success - exit function
            
        } catch (error) {
            console.warn(`⚠️  Failed to fetch from ${name}:`, error.message);
            continue; // Try next URL
        }
    }
    
    // If we get here, all URLs failed
    throw new Error('Failed to fetch exam codes from all available URLs');
}

// Enhanced parseSubjects function with better error handling
function parseSubjects(response) {
    try {
        // Log response details for debugging
        console.log('📄 Response status:', response.status);
        console.log('📏 Response data length:', response.data.length);
        
        // Check if response contains error indicators
        if (response.data.includes('No Student Record Found') || 
            response.data.includes('Invalid') ||
            response.data.includes('error') ||
            response.data.includes('Error')) {
            console.log('❌ Response contains error message');
            return null;
        }
        
        // Check for minimum response size (valid results are usually > 2000 characters)
        if (response.data.length < 1500) {
            console.log('⚠️ Response too short, likely an error page');
            return null;
        }
        
        const soup = new JSSoup(response.data);
        const tables = soup.findAll("table");
        
        console.log('📊 Found tables:', tables ? tables.length : 0);
        
        if (!tables || tables.length < 2) {
            console.log('❌ Invalid response format - insufficient tables');
            
            // Try to extract any error message from the response
            const bodyText = soup.text || '';
            if (bodyText.includes('No Student Record Found')) {
                throw new Error('No Student Record Found');
            } else if (bodyText.includes('Invalid')) {
                throw new Error('Invalid Hall Ticket Number or Exam Code');
            } else {
                throw new Error('Invalid response format - expected result tables not found');
            }
        }
        
        const subjects = [];
        
        // Validate that the second table has subject data
        const subjectTable = tables[1];
        const trs = subjectTable.findAll("tr");
        
        if (!trs || trs.length < 2) {
            console.log('❌ Subject table has insufficient rows');
            throw new Error('No subject data found in response');
        }
        
        // Parse subjects (skip header row)
        trs.forEach((tr, index) => {
            if (index === 0) return; // Skip header row
            
            const tds = tr.findAll("td");
            if (tds && tds.length >= 7) {
                // Validate that we have actual subject data
                const subjectCode = tds[0].text.trim();
                const subjectName = tds[1].text.trim();
                
                if (subjectCode && subjectName) {
                    subjects.push(new Subject(
                        subjectCode,
                        subjectName,
                        tds[2].text.trim(),
                        tds[3].text.trim(),
                        tds[4].text.trim(),
                        tds[5].text.trim(),
                        tds[6].text.trim()
                    ));
                }
            }
        });
        
        if (subjects.length === 0) {
            console.log('❌ No valid subjects found');
            throw new Error('No valid subject data found');
        }
        
        // Parse student info from first table
        const infoTable = tables[0];
        const infoTrs = infoTable.findAll("tr");
        
        if (!infoTrs || infoTrs.length === 0) {
            throw new Error('Student information not found');
        }
        
        const infoTds = infoTrs[0].findAll("td");
        
        if (!infoTds || infoTds.length < 4) {
            throw new Error('Invalid student information format');
        }
        
        // Extract exam code from request data
        const requestData = response.config.data;
        const examCodeMatch = requestData.match(/examCode=([0-9]{4})/);
        const examCode = examCodeMatch ? parseInt(examCodeMatch[1]) : null;
        
        // Calculate CGPA for this semester
        const semesterCGPA = calculateCGPA(subjects);
        
        // Get grade distribution
        const gradeDistribution = getGradeDistribution(subjects);
        
        const result = {
            name: infoTds[3].text.trim(),
            htno: infoTds[1].text.trim(),
            subjects: subjects,
            examCode: examCode,
            cgpa: semesterCGPA,
            gradeDistribution: gradeDistribution
        };
        
        console.log(`✅ Successfully parsed ${subjects.length} subjects for ${result.htno} with CGPA: ${semesterCGPA}`);
        return result;
        
    } catch (error) {
        console.error('❌ Error parsing subjects:', error.message);
        return null;
    }
}

// Enhanced getAllResults function with better batch processing
async function getAllResults(htno) {
    const config = {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        },
        timeout: 15000 // 15 second timeout
    };
    
    // Determine which URL to use (prefer IP-based)
    let resultUrl = JNTUH_URLS.RESULT_IP;
    
    try {
        const promises = [];
        let totalRequests = 0;
        
        // Create promises for all exam codes
        for (let semester in examCodes) {
            for (let code of examCodes[semester]) {
                // Regular results
                promises.push(
                    axios.post(resultUrl, {
                        "degree": "btech",
                        "etype": "r17",
                        "result": "null",
                        "grad": "null",
                        "examCode": code,
                        "type": "intgrade",
                        "htno": htno
                    }, config).catch(err => {
                        // If IP fails, try domain URL as fallback
                        if (resultUrl === JNTUH_URLS.RESULT_IP) {
                            return axios.post(JNTUH_URLS.RESULT_DOMAIN, {
                                "degree": "btech",
                                "etype": "r17",
                                "result": "null",
                                "grad": "null",
                                "examCode": code,
                                "type": "intgrade",
                                "htno": htno
                            }, config).catch(() => null);
                        }
                        return null;
                    })
                );
                
                // Revaluation results
                promises.push(
                    axios.post(resultUrl, {
                        "degree": "btech",
                        "etype": "r17",
                        "result": "gradercrv",
                        "grad": "null",
                        "examCode": code,
                        "type": "rcrvintgrade",
                        "htno": htno
                    }, config).catch(err => {
                        // If IP fails, try domain URL as fallback
                        if (resultUrl === JNTUH_URLS.RESULT_IP) {
                            return axios.post(JNTUH_URLS.RESULT_DOMAIN, {
                                "degree": "btech",
                                "etype": "r17",
                                "result": "gradercrv",
                                "grad": "null",
                                "examCode": code,
                                "type": "rcrvintgrade",
                                "htno": htno
                            }, config).catch(() => null);
                        }
                        return null;
                    })
                );
                totalRequests += 2;
            }
        }
        
        console.log(`🔍 Fetching ${totalRequests} results for ${htno} using ${resultUrl.includes('202.63') ? 'IP-based' : 'domain-based'} URL...`);
        
        // Process requests in smaller batches to avoid overwhelming the server
        const batchSize = 6;
        const results = [];
        
        for (let i = 0; i < promises.length; i += batchSize) {
            const batch = promises.slice(i, i + batchSize);
            console.log(`📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(promises.length/batchSize)}`);
            
            const batchResults = await Promise.all(batch);
            results.push(...batchResults);
            
            // Delay between batches to be respectful to the server
            if (i + batchSize < promises.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        // Enhanced result filtering
        const validResults = results.filter(result => {
            if (!result || !result.data) return false;
            
            // Check response length
            if (result.data.length < 1500) return false;
            
            // Check for error indicators
            if (result.data.includes('No Student Record Found') ||
                result.data.includes('Invalid') ||
                result.data.includes('error')) return false;
            
            // Check for specific error response length
            if (result.headers && result.headers['content-length'] === '3774') return false;
            
            return true;
        });
        
        console.log(`✅ Found ${validResults.length} valid responses out of ${totalRequests} requests`);
        
        // Parse and deduplicate results with better error handling
        const parsedResults = [];
        const seenCodes = new Set();
        let parseErrors = 0;
        
        for (let result of validResults) {
            const parsed = parseSubjects(result);
            if (parsed && parsed.examCode && !seenCodes.has(parsed.examCode) && parsed.subjects.length > 0) {
                parsedResults.push(parsed);
                seenCodes.add(parsed.examCode);
            } else if (!parsed) {
                parseErrors++;
            }
        }
        
        if (parseErrors > 0) {
            console.log(`⚠️ ${parseErrors} responses could not be parsed`);
        }
        
        // Sort by exam code
        parsedResults.sort((a, b) => a.examCode - b.examCode);
        
        // Calculate overall CGPA
        const overallCGPA = calculateOverallCGPA(parsedResults);
        
        console.log(`🎯 Successfully parsed ${parsedResults.length} unique results for ${htno} with overall CGPA: ${overallCGPA}`);
        
        if (parsedResults.length === 0) {
            throw new Error('No valid results found. This could mean:\n1. Hall ticket number is incorrect\n2. No results are available for this student\n3. JNTUH website is experiencing issues');
        }
        
        return {
            results: parsedResults,
            overallCGPA: overallCGPA,
            totalSemesters: parsedResults.length
        };
        
    } catch (error) {
        console.error('❌ Error fetching all results:', error.message);
        throw new Error(`Failed to fetch results: ${error.message}`);
    }
}

// API Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint for all results
app.post('/api/results', async (req, res) => {
    try {
        const { htno } = req.body;
        if (!htno) {
            return res.status(400).json({ error: 'Hall ticket number is required' });
        }
        
        const results = await getAllResults(htno);
        res.json(results);
    } catch (error) {
        console.error('Error in results API:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
});

// Refresh exam codes endpoint
app.post('/api/refresh-codes', async (req, res) => {
    try {
        await fetchExamCodes();
        res.json({ message: 'Exam codes refreshed successfully', codes: examCodes });
    } catch (error) {
        console.error('Error refreshing exam codes:', error);
        res.status(500).json({ error: 'Failed to refresh exam codes' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Initialize and start server
async function startServer() {
    try {
        console.log('🚀 Initializing JNTUH Results Portal...');
        await initExamCodes();
        
        // Count total exam codes
        let totalCodes = 0;
        for (let semester in examCodes) {
            totalCodes += examCodes[semester].length;
        }
        
        app.listen(port, () => {
            console.log(`\n🎉 JNTUH Results Portal started successfully!`);
            console.log(`🌐 Server running at: http://localhost:${port}`);
            console.log(`📊 Loaded exam codes: ${totalCodes} codes across ${Object.keys(examCodes).length} semesters`);
            
            // Log exam codes summary
            console.log('\n📋 Exam Codes Summary:');
            for (let semester in examCodes) {
                if (examCodes[semester].length > 0) {
                    console.log(`   📘 ${semester}: ${examCodes[semester].length} codes - [${examCodes[semester].slice(0, 3).join(', ')}${examCodes[semester].length > 3 ? '...' : ''}]`);
                }
            }
            
            console.log('\n🔗 Open http://localhost:' + port + ' in your browser to get started!');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        
        // Try to start with just fallback codes
        console.log('\n🔄 Attempting to start with fallback codes only...');
        examCodes = { ...FALLBACK_EXAM_CODES };
        
        app.listen(port, () => {
            console.log(`\n⚠️  JNTUH Results Portal started in fallback mode!`);
            console.log(`🌐 Server running at: http://localhost:${port}`);
            console.log(`📊 Using fallback exam codes: ${Object.keys(examCodes).length} semesters`);
            console.log('\n🔗 Open http://localhost:' + port + ' in your browser to get started!');
            console.log('\n💡 Note: Some recent exam codes might not be available. Try refreshing codes later.');
        });
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\nShutting down gracefully...');
    process.exit(0);
});

// Start the server
startServer();
