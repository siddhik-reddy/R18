// Devloper : SIDDHIK REDDY 
// Its Free to use for all R18 Reg_JNTUH 
// Fork for more updates

const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const JSSoup = require('jssoup').default;
const fs = require('fs');
const path = require('path');

// Import your existing classes and constants
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

const JNTUH_URLS = {
    HOME_IP: 'http://202.63.105.184/results/jsp/home.jsp',
    RESULT_IP: 'http://202.63.105.184/results/resultAction',
    HOME_DOMAIN: 'http://results.jntuh.ac.in/jsp/home.jsp',
    RESULT_DOMAIN: 'http://results.jntuh.ac.in/resultAction'
};

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

const GRADE_POINTS = {
    'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'D': 4, 'F': 0, 'AB': 0, 'MP': 0
};

let examCodes = {};

// Bot configuration
const BOT_CONFIG = {
    adminNumbers: ['919876543210@c.us'], // Add admin WhatsApp numbers here
    maxRequestsPerHour: 10,
    allowedUsers: [], // Empty = allow all users, or add specific numbers
    rateLimitData: new Map() // Store rate limiting data
};

// Initialize WhatsApp client
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "jntuh-results-bot"
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

// User session management
const userSessions = new Map();

// Rate limiting function
function checkRateLimit(phoneNumber) {
    const now = Date.now();
    const userKey = phoneNumber;
    
    if (!BOT_CONFIG.rateLimitData.has(userKey)) {
        BOT_CONFIG.rateLimitData.set(userKey, { requests: [], lastReset: now });
        return true;
    }
    
    const userData = BOT_CONFIG.rateLimitData.get(userKey);
    
    // Reset counter every hour
    if (now - userData.lastReset > 3600000) {
        userData.requests = [];
        userData.lastReset = now;
    }
    
    // Remove requests older than 1 hour
    userData.requests = userData.requests.filter(time => now - time < 3600000);
    
    if (userData.requests.length >= BOT_CONFIG.maxRequestsPerHour) {
        return false;
    }
    
    userData.requests.push(now);
    return true;
}

// Utility functions (same as your existing code)
function ensureDataDir() {
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
    }
    return dataDir;
}

async function initExamCodes() {
    const dataDir = ensureDataDir();
    const codesFile = path.join(dataDir, 'codes.json');
    
    try {
        if (fs.existsSync(codesFile)) {
            examCodes = JSON.parse(fs.readFileSync(codesFile, 'utf8'));
            console.log('✅ Loaded exam codes from cache');
            return;
        }
    } catch (error) {
        console.warn('⚠️  Error reading cached codes:', error.message);
    }
    
    console.log('🌐 Using fallback exam codes...');
    examCodes = { ...FALLBACK_EXAM_CODES };
}

function parseSubjects(response) {
    try {
        if (response.data.includes('No Student Record Found') || 
            response.data.includes('Invalid') ||
            response.data.includes('error') ||
            response.data.includes('Error')) {
            return null;
        }
        
        if (response.data.length < 1500) {
            return null;
        }
        
        const soup = new JSSoup(response.data);
        const tables = soup.findAll("table");
        
        if (!tables || tables.length < 2) {
            return null;
        }
        
        const subjects = [];
        const subjectTable = tables[1];
        const trs = subjectTable.findAll("tr");
        
        if (!trs || trs.length < 2) {
            return null;
        }
        
        trs.forEach((tr, index) => {
            if (index === 0) return;
            
            const tds = tr.findAll("td");
            if (tds && tds.length >= 7) {
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
            return null;
        }
        
        const infoTable = tables[0];
        const infoTrs = infoTable.findAll("tr");
        const infoTds = infoTrs[0].findAll("td");
        
        const requestData = response.config.data;
        const examCodeMatch = requestData.match(/examCode=([0-9]{4})/);
        const examCode = examCodeMatch ? parseInt(examCodeMatch[1]) : null;
        
        return {
            name: infoTds[3].text.trim(),
            htno: infoTds[1].text.trim(),
            subjects: subjects,
            examCode: examCode
        };
        
    } catch (error) {
        return null;
    }
}

async function getSingleResult(htno, examCode = 1495) {
    const config = {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        },
        timeout: 15000
    };
    
    const postData = {
        "degree": "btech",
        "etype": "r17",
        "result": "null",
        "grad": "null",
        "examCode": examCode.toString(),
        "type": "intgrade",
        "htno": htno
    };
    
    const urlsToTry = [
        { url: JNTUH_URLS.RESULT_IP, name: 'IP-based URL' },
        { url: JNTUH_URLS.RESULT_DOMAIN, name: 'domain-based URL' }
    ];
    
    for (let { url } of urlsToTry) {
        try {
            const response = await axios.post(url, postData, config);
            
            if (!response.data || response.data.length < 500) continue;
            if (response.data.includes('No Student Record Found') || 
                response.data.includes('Invalid')) continue;
            
            const result = parseSubjects(response);
            if (result && result.subjects && result.subjects.length > 0) {
                return result;
            }
        } catch (error) {
            continue;
        }
    }
    
    throw new Error('No results found');
}

async function getAllResults(htno) {
    const config = {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        },
        timeout: 15000
    };
    
    const promises = [];
    
    for (let semester in examCodes) {
        for (let code of examCodes[semester]) {
            promises.push(
                axios.post(JNTUH_URLS.RESULT_IP, {
                    "degree": "btech",
                    "etype": "r17",
                    "result": "null",
                    "grad": "null",
                    "examCode": code,
                    "type": "intgrade",
                    "htno": htno
                }, config).catch(() => null)
            );
        }
    }
    
    const batchSize = 6;
    const results = [];
    
    for (let i = 0; i < promises.length; i += batchSize) {
        const batch = promises.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch);
        results.push(...batchResults);
        
        if (i + batchSize < promises.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    
    const validResults = results.filter(result => {
        if (!result || !result.data) return false;
        if (result.data.length < 1500) return false;
        if (result.data.includes('No Student Record Found') ||
            result.data.includes('Invalid') ||
            result.data.includes('error')) return false;
        return true;
    });
    
    const parsedResults = [];
    const seenCodes = new Set();
    
    for (let result of validResults) {
        const parsed = parseSubjects(result);
        if (parsed && parsed.examCode && !seenCodes.has(parsed.examCode) && parsed.subjects.length > 0) {
            parsedResults.push(parsed);
            seenCodes.add(parsed.examCode);
        }
    }
    
    parsedResults.sort((a, b) => a.examCode - b.examCode);
    
    if (parsedResults.length === 0) {
        throw new Error('No valid results found');
    }
    
    return parsedResults;
}

// CGPA and backlog functions
function calculateCGPA(subjects) {
    let totalGradePoints = 0;
    let totalCredits = 0;
    
    for (let subject of subjects) {
        const grade = subject.grade.toUpperCase();
        const credits = parseFloat(subject.credits);
        
        if (GRADE_POINTS.hasOwnProperty(grade) && !isNaN(credits)) {
            totalGradePoints += GRADE_POINTS[grade] * credits;
            totalCredits += credits;
        }
    }
    
    return totalCredits > 0 ? (totalGradePoints / totalCredits) : 0;
}

function findBacklogs(subjects) {
    return subjects.filter(subject => {
        const grade = subject.grade.toUpperCase();
        return grade === 'F' || grade === 'AB' || grade === 'MP';
    });
}

function getSemesterName(examCode) {
    for (let semester in examCodes) {
        if (examCodes[semester].includes(examCode.toString())) {
            return semester;
        }
    }
    return 'Unknown';
}

// Find current backlogs (only from latest available results)
function findCurrentBacklogs(allResults) {
    if (!allResults || allResults.length === 0) return [];
    
    // Create a map of all subjects and their latest results
    const subjectMap = new Map();
    
    // Process results in chronological order (sorted by exam code)
    const sortedResults = [...allResults].sort((a, b) => a.examCode - b.examCode);
    
    sortedResults.forEach(result => {
        result.subjects.forEach(subject => {
            const subjectCode = subject.subjectCode;
            const grade = subject.grade.toUpperCase();
            
            // Update the subject with the latest result
            subjectMap.set(subjectCode, {
                ...subject,
                examCode: result.examCode,
                semester: getSemesterName(result.examCode)
            });
        });
    });
    
    // Find subjects that are still failed in their latest attempt
    const currentBacklogs = [];
    for (let [subjectCode, subject] of subjectMap) {
        const grade = subject.grade.toUpperCase();
        if (grade === 'F' || grade === 'AB' || grade === 'MP') {
            currentBacklogs.push(subject);
        }
    }
    
    return currentBacklogs;
}

// WhatsApp message formatting functions
function formatAllResults(results) {
    if (!results || results.length === 0) {
        return '❌ No results found for this hall ticket number.';
    }
    
    const studentInfo = results[0];
    let totalCredits = 0;
    let totalGradePoints = 0;
    
    // Find current backlogs (not historical)
    const currentBacklogs = findCurrentBacklogs(results);
    
    let message = `🎓 *JNTUH Complete Results*\n\n`;
    message += `👤 *Name:* ${studentInfo.name}\n`;
    message += `🎫 *Hall Ticket:* ${studentInfo.htno}\n`;
    message += `📊 *Total Semesters:* ${results.length}\n\n`;
    
    message += `📈 *Semester Wise CGPA:*\n`;
    message += `${'─'.repeat(25)}\n`;
    
    results.forEach(result => {
        const semesterName = getSemesterName(result.examCode);
        const cgpa = calculateCGPA(result.subjects);
        
        // Calculate for overall CGPA
        result.subjects.forEach(subject => {
            const grade = subject.grade.toUpperCase();
            const credits = parseFloat(subject.credits);
            
            if (GRADE_POINTS.hasOwnProperty(grade) && !isNaN(credits)) {
                totalGradePoints += GRADE_POINTS[grade] * credits;
                totalCredits += credits;
            }
        });
        
        message += `📚 *${semesterName}:* ${cgpa.toFixed(2)}\n`;
    });
    
    const overallCGPA = totalCredits > 0 ? (totalGradePoints / totalCredits) : 0;
    
    message += `\n📊 *OVERALL STATISTICS:*\n`;
    message += `🎯 *Overall CGPA:* ${overallCGPA.toFixed(2)}\n`;
    message += `📚 *Current Backlogs:* ${currentBacklogs.length}\n`;
    message += `🏆 *Academic Status:* ${currentBacklogs.length === 0 ? '✅ CLEAR' : '🔴 BACKLOGS PENDING'}\n`;
    
    if (currentBacklogs.length > 0) {
        message += `\n🔴 *Current Backlog Details:*\n`;
        currentBacklogs.forEach(subject => {
            message += `• ${subject.subjectCode} - ${subject.subjectName} (${subject.grade})\n`;
        });
        message += `\n💡 *Note:* These are subjects you still need to clear.`;
    } else {
        message += `\n🎉 *Congratulations!* All subjects cleared successfully.`;
    }
    
    return message;
}

function formatAllResults(results) {
    if (!results || results.length === 0) {
        return '❌ No results found for this hall ticket number.';
    }
    
    const studentInfo = results[0];
    let totalCredits = 0;
    let totalGradePoints = 0;
    
    // Find current backlogs (only subjects that are still pending)
    const currentBacklogs = findCurrentBacklogs(results);
    
    let message = `🎓 *JNTUH Complete Results*\n\n`;
    message += `👤 *Name:* ${studentInfo.name}\n`;
    message += `🎫 *Hall Ticket:* ${studentInfo.htno}\n`;
    message += `📊 *Total Semesters:* ${results.length}\n\n`;
    
    message += `📈 *Semester Wise CGPA:*\n`;
    message += `${'─'.repeat(25)}\n`;
    
    results.forEach(result => {
        const semesterName = getSemesterName(result.examCode);
        const cgpa = calculateCGPA(result.subjects);
        
        // Calculate for overall CGPA
        result.subjects.forEach(subject => {
            const grade = subject.grade.toUpperCase();
            const credits = parseFloat(subject.credits);
            
            if (GRADE_POINTS.hasOwnProperty(grade) && !isNaN(credits)) {
                totalGradePoints += GRADE_POINTS[grade] * credits;
                totalCredits += credits;
            }
        });
        
        message += `📚 *${semesterName}:* ${cgpa.toFixed(2)}\n`;
    });
    
    const overallCGPA = totalCredits > 0 ? (totalGradePoints / totalCredits) : 0;
    
    message += `\n📊 *OVERALL STATISTICS:*\n`;
    message += `🎯 *Overall CGPA:* ${overallCGPA.toFixed(2)}\n`;
    message += `📚 *Current Backlogs:* ${currentBacklogs.length}\n`;
    message += `🏆 *Academic Status:* ${currentBacklogs.length === 0 ? '✅ ALL CLEAR' : '🔴 BACKLOGS PENDING'}\n`;
    
    if (currentBacklogs.length > 0) {
        message += `\n🔴 *Pending Backlogs:*\n`;
        currentBacklogs.forEach(subject => {
            message += `• ${subject.subjectCode} - ${subject.subjectName} (${subject.grade})\n`;
        });
        message += `\n💡 *Note:* These subjects still need to be cleared.`;
    } else {
        message += `\n🎉 *Congratulations!* All subjects cleared successfully.`;
    }
    
    return message;
}

// Bot command handlers
async function handleResultCommand(msg, htno) {
    const phoneNumber = msg.from;
    
    // Rate limiting check
    if (!checkRateLimit(phoneNumber)) {
        await msg.reply('⏰ Rate limit exceeded. You can make only 10 requests per hour. Please try again later.');
        return;
    }
    
    try {
        await msg.reply('🔍 Fetching your complete results... Please wait.');
        
        // Always fetch all results to get complete picture
        const results = await getAllResults(htno);
        const formattedResult = formatAllResults(results);
        
        // Split message if too long (WhatsApp limit ~4000 chars)
        if (formattedResult.length > 3500) {
            const parts = splitLongMessage(formattedResult);
            for (let part of parts) {
                await msg.reply(part);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Delay between messages
            }
        } else {
            await msg.reply(formattedResult);
        }
        
    } catch (error) {
        console.error('Error fetching results:', error);
        await msg.reply(`❌ Failed to fetch results: ${error.message}\n\n💡 *Tips:*\n• Check your hall ticket number\n• JNTUH website might be down\n• Try again in a few minutes`);
    }
}

function splitLongMessage(message, maxLength = 3500) {
    const parts = [];
    let currentPart = '';
    const lines = message.split('\n');
    
    for (let line of lines) {
        if ((currentPart + line + '\n').length > maxLength && currentPart.length > 0) {
            parts.push(currentPart.trim());
            currentPart = line + '\n';
        } else {
            currentPart += line + '\n';
        }
    }
    
    if (currentPart.trim().length > 0) {
        parts.push(currentPart.trim());
    }
    
    return parts;
}

function getHelpMessage() {
    return `🤖 *JNTUH Results Bot*

📝 *How to use:*
• Simply send your hall ticket number
• Bot will fetch your complete academic results

📋 *Example:*
• 18071A0501

⚡ *What you'll get:*
• Overall CGPA
• Semester-wise CGPA
• Current pending backlogs (if any)
• Complete academic status

⏰ *Limit:* 10 requests per hour

Made with ❤️ for JNTUH students`;
}

function getBotStats() {
    const totalUsers = BOT_CONFIG.rateLimitData.size;
    const totalRequests = Array.from(BOT_CONFIG.rateLimitData.values())
        .reduce((sum, user) => sum + user.requests.length, 0);
    
    return `📊 *Bot Statistics*

👥 *Total Users:* ${totalUsers}
📈 *Requests Today:* ${totalRequests}
🔧 *Exam Codes:* ${Object.keys(examCodes).length} semesters
⚡ *Status:* Online

🛠️ *System Info:*
• Rate Limit: ${BOT_CONFIG.maxRequestsPerHour}/hour per user
• Cache: ${fs.existsSync(path.join(__dirname, 'data', 'codes.json')) ? 'Active' : 'None'}`;
}

// WhatsApp event handlers
client.on('qr', (qr) => {
    console.log('🔗 Scan this QR code with WhatsApp:');
    qrcode.generate(qr, { small: true });
    console.log('\n📱 Open WhatsApp > Settings > Linked Devices > Link a Device');
});

client.on('ready', () => {
    console.log('✅ WhatsApp Bot is ready!');
    console.log('📱 Bot is now listening for messages...');
});

client.on('authenticated', () => {
    console.log('✅ WhatsApp authenticated successfully');
});

client.on('auth_failure', () => {
    console.error('❌ WhatsApp authentication failed');
});

client.on('disconnected', (reason) => {
    console.log('📱 WhatsApp disconnected:', reason);
});

client.on('message_create', async (msg) => {
    // Ignore status messages and messages from self
    if (msg.from === 'status@broadcast' || msg.fromMe) return;
    
    const messageBody = msg.body.trim().toLowerCase();
    const phoneNumber = msg.from;
    
    // Log incoming message
    console.log(`📨 Message from ${phoneNumber}: ${msg.body}`);
    
    try {
        // Help command
        if (messageBody === 'help' || messageBody === '/help') {
            await msg.reply(getHelpMessage());
            return;
        }
        
        // Stats command (admin only)
        if (messageBody === 'stats' || messageBody === '/stats') {
            if (BOT_CONFIG.adminNumbers.includes(phoneNumber)) {
                await msg.reply(getBotStats());
            } else {
                await msg.reply('❌ Access denied. Admin only command.');
            }
            return;
        }
        
        // Check if message is a hall ticket number
        const cleanedMessage = msg.body.trim().toUpperCase();
        if (isValidHallTicket(cleanedMessage)) {
            await handleResultCommand(msg, cleanedMessage);
            return;
        }
        
        // Default help response for unrecognized commands
        if (messageBody.length > 3) { // Ignore very short messages
            await msg.reply(`🤖 Hi! I'm the JNTUH Results Bot.\n\n` +
                           `📝 *How to use:*\n` +
                           `Simply send me your hall ticket number and I'll fetch your complete academic results.\n\n` +
                           `📋 *Example:*\n` +
                           `18071A0501\n\n` +
                           `🎯 *What you'll get:*\n` +
                           `• Overall CGPA\n` +
                           `• Semester-wise CGPA\n` +
                           `• Current backlogs (if any)\n` +
                           `• Academic status\n\n` +
                           `Type "help" for more information.`);
        }
        
    } catch (error) {
        console.error('Error handling message:', error);
        await msg.reply('❌ Sorry, something went wrong. Please try again later.');
    }
});

// Utility function to validate hall ticket format
function isValidHallTicket(htno) {
    // JNTUH hall ticket format: typically 2 digits + 3 chars + 1 digit + 4 digits
    // Examples: 18071A0501, 19071A0123, etc.
    const htnoPattern = /^[0-9]{2}[0-9A-Z]{3}[A-Z][0-9]{4}$/;
    return htnoPattern.test(htno) && htno.length === 10;
}

// Error handling for the client
client.on('error', (error) => {
    console.error('❌ WhatsApp client error:', error);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down bot gracefully...');
    try {
        await client.destroy();
    } catch (error) {
        console.error('Error during shutdown:', error);
    }
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down bot gracefully...');
    try {
        await client.destroy();
    } catch (error) {
        console.error('Error during shutdown:', error);
    }
    process.exit(0);
});

// Initialize and start the bot
async function startBot() {
    try {
        console.log('🚀 Starting JNTUH WhatsApp Results Bot...');
        
        // Initialize exam codes
        await initExamCodes();
        
        console.log('📱 Initializing WhatsApp client...');
        
        // Initialize WhatsApp client
        await client.initialize();
        
    } catch (error) {
        console.error('❌ Failed to start bot:', error.message);
        process.exit(1);
    }
}

// Start the bot
startBot();
