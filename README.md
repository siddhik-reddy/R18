<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JNTUH Results Bot - README</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #24292f;
            background-color: #ffffff;
            padding: 0;
            margin: 0;
        }

        .container {
            max-width: 1012px;
            margin: 0 auto;
            padding: 32px;
        }

        .header {
            text-align: center;
            margin-bottom: 48px;
            padding: 40px 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
        }

        .header h1 {
            font-size: 3.5em;
            font-weight: 700;
            margin-bottom: 12px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .header p {
            font-size: 1.25em;
            opacity: 0.95;
            font-weight: 300;
        }

        .badges {
            display: flex;
            gap: 8px;
            justify-content: center;
            margin-top: 20px;
            flex-wrap: wrap;
        }

        .badge {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: 600;
            text-decoration: none;
            transition: transform 0.2s ease;
        }

        .badge:hover {
            transform: translateY(-1px);
        }

        .badge-tech {
            background: #f1f8ff;
            color: #0969da;
            border: 1px solid #d0d7de;
        }

        .badge-version {
            background: #28a745;
            color: white;
        }

        .badge-license {
            background: #6f42c1;
            color: white;
        }

        h1 {
            font-size: 2.5em;
            font-weight: 700;
            margin: 32px 0 16px 0;
            color: #1f2328;
            border-bottom: 2px solid #d1d9e0;
            padding-bottom: 8px;
        }

        h2 {
            font-size: 1.8em;
            font-weight: 600;
            margin: 28px 0 16px 0;
            color: #1f2328;
            position: relative;
        }

        h2:before {
            content: '';
            position: absolute;
            left: -24px;
            top: 50%;
            transform: translateY(-50%);
            width: 4px;
            height: 20px;
            background: #667eea;
            border-radius: 2px;
        }

        h3 {
            font-size: 1.4em;
            font-weight: 600;
            margin: 20px 0 12px 0;
            color: #1f2328;
        }

        p {
            margin: 12px 0;
            line-height: 1.7;
        }

        ul, ol {
            margin: 12px 0;
            padding-left: 24px;
        }

        li {
            margin: 6px 0;
            line-height: 1.6;
        }

        code {
            background: #f6f8fa;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
            font-size: 0.9em;
            color: #d73a49;
            border: 1px solid #e1e4e8;
        }

        pre {
            background: #f6f8fa;
            border: 1px solid #e1e4e8;
            border-radius: 8px;
            padding: 16px;
            margin: 16px 0;
            overflow-x: auto;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
        }

        pre code {
            background: none;
            padding: 0;
            border: none;
            color: #24292f;
        }

        .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            margin: 24px 0;
        }

        .feature-card {
            background: #f8f9fa;
            border: 1px solid #e1e4e8;
            border-radius: 8px;
            padding: 20px;
            transition: all 0.3s ease;
        }

        .feature-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        }

        .feature-card h4 {
            color: #667eea;
            font-size: 1.2em;
            margin-bottom: 8px;
            font-weight: 600;
        }

        .tech-stack {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin: 20px 0;
        }

        .tech-item {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 500;
            font-size: 0.9em;
            box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }

        .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-left: 4px solid #f39c12;
            padding: 16px;
            border-radius: 4px;
            margin: 16px 0;
        }

        .info {
            background: #d1ecf1;
            border: 1px solid #bee5eb;
            border-left: 4px solid #17a2b8;
            padding: 16px;
            border-radius: 4px;
            margin: 16px 0;
        }

        .success {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            border-left: 4px solid #28a745;
            padding: 16px;
            border-radius: 4px;
            margin: 16px 0;
        }

        .command-example {
            background: #0d1117;
            color: #f0f6fc;
            padding: 16px;
            border-radius: 8px;
            margin: 12px 0;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
            border: 1px solid #30363d;
        }

        .file-tree {
            background: #f6f8fa;
            border: 1px solid #e1e4e8;
            border-radius: 8px;
            padding: 16px;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
            font-size: 0.9em;
        }

        .screenshot {
            border: 1px solid #e1e4e8;
            border-radius: 8px;
            margin: 16px 0;
            overflow: hidden;
            box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        }

        .toc {
            background: #f8f9fa;
            border: 1px solid #e1e4e8;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
        }

        .toc h3 {
            margin-top: 0;
            color: #667eea;
        }

        .toc ul {
            list-style: none;
            padding-left: 0;
        }

        .toc li {
            margin: 8px 0;
        }

        .toc a {
            color: #0969da;
            text-decoration: none;
            padding: 4px 8px;
            border-radius: 4px;
            transition: background 0.2s ease;
        }

        .toc a:hover {
            background: #dbeafe;
        }

        .button {
            display: inline-block;
            padding: 12px 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
        }

        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        @media (max-width: 768px) {
            .container {
                padding: 16px;
            }
            
            .header h1 {
                font-size: 2.5em;
            }
            
            .feature-grid {
                grid-template-columns: 1fr;
            }
            
            .tech-stack {
                justify-content: center;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>JNTUH Results Bot</h1>
            <p>WhatsApp Bot for JNTUH Academic Results with CGPA & Backlog Tracking</p>
            <div class="badges">
                <span class="badge badge-tech">Node.js</span>
                <span class="badge badge-tech">WhatsApp Web.js</span>
                <span class="badge badge-version">v2.0</span>
                <span class="badge badge-license">MIT</span>
            </div>
        </div>

        <div class="toc">
            <h3>📋 Table of Contents</h3>
            <ul>
                <li><a href="#overview">Overview</a></li>
                <li><a href="#features">Features</a></li>
                <li><a href="#installation">Installation</a></li>
                <li><a href="#configuration">Configuration</a></li>
                <li><a href="#usage">Usage</a></li>
                <li><a href="#bot-commands">Bot Commands</a></li>
                <li><a href="#project-structure">Project Structure</a></li>
                <li><a href="#api-endpoints">API Endpoints</a></li>
                <li><a href="#troubleshooting">Troubleshooting</a></li>
            </ul>
        </div>

        <h2 id="overview">🎓 Overview</h2>
        <p>A comprehensive WhatsApp bot and web application for fetching JNTUH (Jawaharlal Nehru Technological University Hyderabad) academic results. The bot provides instant access to semester results, CGPA calculations, and current backlog status through WhatsApp.</p>

        <div class="info">
            <strong>Key Highlights:</strong>
            <ul>
                <li>Intelligent backlog detection - only shows currently pending subjects</li>
                <li>Accurate CGPA calculation with credit weightage</li>
                <li>Real-time results fetching from JNTUH servers</li>
                <li>WhatsApp integration for easy access</li>
                <li>Rate limiting and admin controls</li>
            </ul>
        </div>

        <h2 id="features">✨ Features</h2>
        <div class="feature-grid">
            <div class="feature-card">
                <h4>📱 WhatsApp Integration</h4>
                <p>Send hall ticket numbers directly through WhatsApp and get formatted results instantly.</p>
            </div>
            <div class="feature-card">
                <h4>📊 Smart CGPA Calculation</h4>
                <p>Accurate semester-wise and overall CGPA calculation considering credit hours and grade points.</p>
            </div>
            <div class="feature-card">
                <h4>🎯 Current Backlog Detection</h4>
                <p>Intelligent tracking of pending subjects - excludes subjects that were later cleared.</p>
            </div>
            <div class="feature-card">
                <h4>⚡ Real-time Results</h4>
                <p>Fetches latest results directly from JNTUH servers with fallback mechanisms.</p>
            </div>
            <div class="feature-card">
                <h4>🛡️ Rate Limiting</h4>
                <p>Built-in rate limiting to prevent abuse and ensure fair usage.</p>
            </div>
            <div class="feature-card">
                <h4>🌐 Web Interface</h4>
                <p>Beautiful responsive web interface as an alternative to WhatsApp.</p>
            </div>
        </div>

        <h2 id="installation">🚀 Installation</h2>

        <h3>Prerequisites</h3>
        <ul>
            <li>Node.js (v14 or higher)</li>
            <li>npm or yarn</li>
            <li>Chrome/Chromium browser (for WhatsApp Web.js)</li>
        </ul>

        <h3>Clone Repository</h3>
        <div class="command-example">
git clone https://github.com/yourusername/jntuh-results-bot.git
cd jntuh-results-bot
        </div>

        <h3>Install Dependencies</h3>
        <div class="command-example">
npm install
        </div>

        <div class="tech-stack">
            <span class="tech-item">whatsapp-web.js</span>
            <span class="tech-item">express</span>
            <span class="tech-item">axios</span>
            <span class="tech-item">jssoup</span>
            <span class="tech-item">qrcode-terminal</span>
        </div>

        <h2 id="configuration">⚙️ Configuration</h2>

        <h3>Bot Configuration</h3>
        <p>Edit the <code>BOT_CONFIG</code> object in the WhatsApp bot file:</p>

        <pre><code>const BOT_CONFIG = {
    adminNumbers: ['919876543210@c.us'], // Your WhatsApp number
    maxRequestsPerHour: 10,              // Rate limit per user
    allowedUsers: [],                    // Empty = allow all users
    rateLimitData: new Map()
};
</code></pre>

        <div class="warning">
            <strong>Important:</strong> Replace the admin number with your actual WhatsApp number in international format (country code + number + @c.us).
        </div>

        <h3>Environment Variables</h3>
        <p>Create a <code>.env</code> file for web server configuration:</p>

        <pre><code>PORT=5000
NODE_ENV=production
</code></pre>

        <h2 id="usage">🎮 Usage</h2>

        <h3>Starting the WhatsApp Bot</h3>
        <div class="command-example">
node whatsapp-bot.js
        </div>

        <p>After running the command:</p>
        <ol>
            <li>A QR code will appear in your terminal</li>
            <li>Open WhatsApp on your phone</li>
            <li>Go to Settings → Linked Devices → Link a Device</li>
            <li>Scan the QR code</li>
            <li>Bot is now ready to receive messages!</li>
        </ol>

        <h3>Starting the Web Server</h3>
        <div class="command-example">
node app.js
        </div>

        <p>Access the web interface at <code>http://localhost:5000</code></p>

        <h3>Terminal Mode</h3>
        <div class="command-example">
node terminal.js
# Or with command line arguments:
node terminal.js 18071A0501
        </div>

        <h2 id="bot-commands">🤖 Bot Commands</h2>

        <div class="success">
            <h4>For Students:</h4>
            <ul>
                <li><strong>Send Hall Ticket:</strong> Simply send your hall ticket number (e.g., <code>18071A0501</code>)</li>
                <li><strong>Help:</strong> Type <code>help</code> for command information</li>
            </ul>
        </div>

        <div class="info">
            <h4>For Admins:</h4>
            <ul>
                <li><strong>Statistics:</strong> Type <code>stats</code> to view bot usage statistics</li>
            </ul>
        </div>

        <h3>Example Interactions</h3>

        <h4>User Input:</h4>
        <div class="command-example">
18071A0501
        </div>

        <h4>Bot Response:</h4>
        <pre><code>🎓 JNTUH Complete Results

👤 Name: JOHN DOE
🎫 Hall Ticket: 18071A0501
📊 Total Semesters: 6

📈 Semester Wise CGPA:
─────────────────────────
📚 1-1: 7.80
📚 1-2: 8.20
📚 2-1: 6.50
📚 2-2: 7.95
📚 3-1: 8.10
📚 3-2: 8.45

📊 OVERALL STATISTICS:
🎯 Overall CGPA: 7.85
📚 Current Backlogs: 0
🏆 Academic Status: ✅ ALL CLEAR

🎉 Congratulations! All subjects cleared successfully.
</code></pre>

        <h2 id="project-structure">📁 Project Structure</h2>

        <div class="file-tree">
jntuh-results-bot/
├── app.js                 # Express web server
├── whatsapp-bot.js        # WhatsApp bot implementation
├── terminal.js            # Terminal interface
├── package.json           # Dependencies
├── README.md             # This file
├── data/                 # Auto-generated data directory
│   └── codes.json        # Cached exam codes
└── .whatsapp_auth/       # WhatsApp authentication data
    └── ...               # Auto-generated session files
        </div>

        <h2 id="api-endpoints">🔌 API Endpoints</h2>

        <h3>Web Server Endpoints</h3>

        <div style="background: #f6f8fa; border: 1px solid #e1e4e8; border-radius: 8px; overflow: hidden; margin: 16px 0;">
            <div style="background: #24292f; color: #f0f6fc; padding: 12px 16px; font-weight: 600;">
                GET /
            </div>
            <div style="padding: 16px;">
                <p>Serves the main web interface for manual result checking.</p>
            </div>
        </div>

        <div style="background: #f6f8fa; border: 1px solid #e1e4e8; border-radius: 8px; overflow: hidden; margin: 16px 0;">
            <div style="background: #24292f; color: #f0f6fc; padding: 12px 16px; font-weight: 600;">
                POST /api/single
            </div>
            <div style="padding: 16px;">
                <p>Fetch single semester result</p>
                <pre><code>{
  "htno": "18071A0501"
}</code></pre>
            </div>
        </div>

        <div style="background: #f6f8fa; border: 1px solid #e1e4e8; border-radius: 8px; overflow: hidden; margin: 16px 0;">
            <div style="background: #24292f; color: #f0f6fc; padding: 12px 16px; font-weight: 600;">
                POST /api/all
            </div>
            <div style="padding: 16px;">
                <p>Fetch all available results</p>
                <pre><code>{
  "htno": "18071A0501"
}</code></pre>
            </div>
        </div>

        <div style="background: #f6f8fa; border: 1px solid #e1e4e8; border-radius: 8px; overflow: hidden; margin: 16px 0;">
            <div style="background: #24292f; color: #f0f6fc; padding: 12px 16px; font-weight: 600;">
                POST /api/refresh-codes
            </div>
            <div style="padding: 16px;">
                <p>Refresh exam codes from JNTUH website</p>
            </div>
        </div>

        <h2 id="troubleshooting">🔧 Troubleshooting</h2>

        <h3>Common Issues</h3>

        <div class="warning">
            <h4>WhatsApp Authentication Failed</h4>
            <ul>
                <li>Delete <code>.whatsapp_auth</code> folder and restart</li>
                <li>Ensure Chrome/Chromium is installed</li>
                <li>Check internet connectivity</li>
            </ul>
        </div>

        <div class="warning">
            <h4>No Results Found</h4>
            <ul>
                <li>Verify hall ticket number format (10 characters)</li>
                <li>JNTUH servers might be down - try again later</li>
                <li>Some older results might not be available</li>
            </ul>
        </div>

        <div class="warning">
            <h4>Bot Not Responding</h4>
            <ul>
                <li>Check if WhatsApp session is still active</li>
                <li>Restart the bot if session expired</li>
                <li>Verify the hall ticket format</li>
            </ul>
        </div>

        <h3>Debug Mode</h3>
        <p>Enable detailed logging by setting the environment variable:</p>
        <div class="command-example">
DEBUG=* node whatsapp-bot.js
        </div>

        <h3>Manual Exam Code Refresh</h3>
        <p>If exam codes are outdated, refresh them manually:</p>
        <div class="command-example">
# Delete cached codes
rm data/codes.json

# Restart bot to fetch fresh codes
node whatsapp-bot.js
        </div>

        <h2>🔒 Security Features</h2>
        <ul>
            <li><strong>Rate Limiting:</strong> 10 requests per hour per user</li>
            <li><strong>Admin Controls:</strong> Restricted access to bot statistics</li>
            <li><strong>Input Validation:</strong> Hall ticket format validation</li>
            <li><strong>Error Handling:</strong> Graceful error responses</li>
        </ul>

        <h2>📈 How Backlog Detection Works</h2>
        <div class="info">
            <p>The bot uses intelligent backlog detection:</p>
            <ol>
                <li><strong>Historical Tracking:</strong> Tracks all subject attempts across semesters</li>
                <li><strong>Latest Result Priority:</strong> Uses the most recent result for each subject</li>
                <li><strong>Smart Status:</strong> Only considers subjects as backlogs if they failed in their latest attempt</li>
                <li><strong>Cleared Recognition:</strong> If a student failed a subject but later passed it, it's not counted as a backlog</li>
            </ol>
        </div>

        <h2>🎯 CGPA Calculation</h2>
        <p>The bot calculates CGPA using the standard JNTUH grading system:</p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; margin: 20px 0;">
            <div style="background: #28a745; color: white; padding: 8px; border-radius: 4px; text-align: center; font-weight: 600;">O = 10</div>
            <div style="background: #17a2b8; color: white; padding: 8px; border-radius: 4px; text-align: center; font-weight: 600;">A+ = 9</div>
            <div style="background: #007bff; color: white; padding: 8px; border-radius: 4px; text-align: center; font-weight: 600;">A = 8</div>
            <div style="background: #6f42c1; color: white; padding: 8px; border-radius: 4px; text-align: center; font-weight: 600;">B+ = 7</div>
            <div style="background: #fd7e14; color: white; padding: 8px; border-radius: 4px; text-align: center; font-weight: 600;">B = 6</div>
            <div style="background: #ffc107; color: black; padding: 8px; border-radius: 4px; text-align: center; font-weight: 600;">C = 5</div>
            <div style="background: #dc3545; color: white; padding: 8px; border-radius: 4px; text-align: center; font-weight: 600;">D = 4</div>
            <div style="background: #6c757d; color: white; padding: 8px; border-radius: 4px; text-align: center; font-weight: 600;">F = 0</div>
        </div>

        <p><strong>Formula:</strong> CGPA = Σ(Grade Points × Credits) / Σ(Credits)</p>

        <h2>🚀 Quick Start</h2>
        <div class="command-example">
# Install dependencies
npm install

# Start WhatsApp bot
node whatsapp-bot.js

# In another terminal, start web server (optional)
node app.js
        </div>

        <h2>📱 Bot Usage Examples</h2>

        <h3>Simple Hall Ticket Query</h3>
        <div style="background: #25d366; color: white; padding: 12px; border-radius: 8px; margin: 8px 0; font-family: monospace;">
            User: 18071A0501
        </div>
        <div style="background: #e3f2fd; padding: 12px; border-radius: 8px; margin: 8px 0; font-family: monospace; font-size: 0.9em;">
            Bot: 🔍 Fetching your complete results... Please wait.
        </div>

        <h3>Help Command</h3>
        <div style="background: #25d366; color: white; padding: 12px; border-radius: 8px; margin: 8px 0; font-family: monospace;">
            User: help
        </div>
        <div style="background: #e3f2fd; padding: 12px; border-radius: 8px; margin: 8px 0; font-family: monospace; font-size: 0.9em;">
            Bot: 🤖 JNTUH Results Bot<br><br>
            📝 How to use:<br>
            • Simply send your hall ticket number<br>
            ...
        </div>

        <h2>⚠️ Important Notes</h2>
        <div class="warning">
            <ul>
                <li><strong>JNTUH Server Dependency:</strong> Results are fetched directly from JNTUH servers, so availability depends on their uptime</li>
                <li><strong>Rate Limits:</strong> Each user is limited to 10 requests per hour to prevent server overload</li>
                <li><strong>Data Privacy:</strong> No results are stored permanently - all data is processed in real-time</li>
                <li><strong>Authentication:</strong> WhatsApp session needs to be maintained - scan QR code if disconnected</li>
            </ul>
        </div>

        <h2>📊 Monitoring</h2>
        <p>Admin users can monitor bot usage by sending <code>stats</code> command, which shows:</p>
        <ul>
            <li>Total unique users</li>
            <li>Requests processed today</li>
            <li>System status</li>
            <li>Cache information</li>
        </ul>

        <h2>🤝 Contributing</h2>
        <p>Contributions are welcome! Please feel free to submit pull requests or open issues for:</p>
        <ul>
            <li>Bug fixes</li>
            <li>Feature enhancements</li>
            <li>Documentation improvements</li>
            <li>Performance optimizations</li>
        </ul>

        <h2>📄 License</h2>
        <p>This project is licensed under the MIT License. See LICENSE file for details.</p>

        <h2>🙏 Acknowledgments</h2>
        <ul>
            <li>JNTUH for providing the results API</li>
            <li>WhatsApp Web.js community for the excellent library</li>
            <li>All JNTUH students who use this bot</li>
        </ul>

        <div style="text-align: center; margin: 40px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
            <p style="font-size: 1.1em; color: #667eea; font-weight: 600;">Made with ❤️ for JNTUH Students</p>
            <p style="margin-top: 8px; color: #6c757d;">Helping students access their results quickly and efficiently</p>
        </div>
    </div>
</body>
</html>
