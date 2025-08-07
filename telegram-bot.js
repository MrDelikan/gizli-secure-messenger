/**
 * Gizli Telegram Distribution Bot
 * Handles app distribution through Telegram
 */

import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Bot configuration
const token = process.env.TELEGRAM_BOT_TOKEN || "8456833961:AAGPXfbb7Un662iUNLE_8nFBACGJAKkoL3w";
const webAppUrl = process.env.WEB_APP_URL || "https://gizli.se";

console.log('🔧 Bot token:', token ? `${token.substring(0, 10)}...` : 'Not found');
console.log('🌐 Web app URL:', webAppUrl);

const bot = new TelegramBot(token, { 
    polling: {
        interval: 300,
        autoStart: true,
        params: {
            timeout: 10
        }
    }
});

// File paths
const RELEASES_DIR = path.join(__dirname, 'releases');
const ANDROID_APK = path.join(RELEASES_DIR, 'gizli-android.apk');
const STATS_FILE = path.join(__dirname, 'download-stats.json');

// Ensure releases directory exists
if (!fs.existsSync(RELEASES_DIR)) {
    fs.mkdirSync(RELEASES_DIR, { recursive: true });
}

// Download statistics
let downloadStats = {};
try {
    if (fs.existsSync(STATS_FILE)) {
        downloadStats = JSON.parse(fs.readFileSync(STATS_FILE, 'utf8'));
    }
} catch (error) {
    console.error('Error loading stats:', error);
    downloadStats = { android: 0, ios: 0, web: 0 };
}

function saveStats() {
    try {
        fs.writeFileSync(STATS_FILE, JSON.stringify(downloadStats, null, 2));
    } catch (error) {
        console.error('Error saving stats:', error);
    }
}

function incrementDownload(platform) {
    downloadStats[platform] = (downloadStats[platform] || 0) + 1;
    saveStats();
}

// Bot commands
bot.onText(/\/start/, (msg) => {
    console.log('📨 Received /start command from:', msg.from.first_name, 'Chat ID:', msg.chat.id);
    const chatId = msg.chat.id;
    const userName = msg.from.first_name || 'User';
    
    const welcomeMessage = `
🔒 *Welcome to Gizli Secure Messenger, ${userName}!*

Gizli is a secure, end-to-end encrypted messaging app that prioritizes your privacy.

📱 *Download Options:*
• /android - Download Android APK
• /ios - Get iOS installation options
• /web - Open web application
• /info - Learn about Gizli's features

🔐 *Security Features:*
✅ End-to-end encryption
✅ Peer-to-peer communication
✅ No data collection
✅ Open source code
✅ Self-destructing messages
✅ Anonymous connections

Type /help for more commands.
    `;
    
    bot.sendMessage(chatId, welcomeMessage, { 
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '📱 Android', callback_data: 'download_android' },
                    { text: '🍎 iOS', callback_data: 'download_ios' }
                ],
                [
                    { text: '🌐 Web App', callback_data: 'open_webapp' },
                    { text: 'ℹ️ Info', callback_data: 'show_info' }
                ]
            ]
        }
    }).then(() => {
        console.log('✅ Welcome message sent successfully to', userName);
    }).catch((error) => {
        console.error('❌ Failed to send welcome message:', error.message);
        console.error('Full error:', error);
    });
});

bot.onText(/\/android/, (msg) => {
    handleAndroidDownload(msg.chat.id);
});

bot.onText(/\/ios/, (msg) => {
    handleiOSDownload(msg.chat.id);
});

bot.onText(/\/web/, (msg) => {
    handleWebApp(msg.chat.id);
});

bot.onText(/\/info/, (msg) => {
    handleInfo(msg.chat.id);
});

bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const helpMessage = `
🤖 *Gizli Bot Commands:*

📱 *Download Commands:*
/android - Download Android APK
/ios - iOS installation options
/web - Open web application

ℹ️ *Information:*
/info - App features and security
/stats - Download statistics
/version - Current app version
/support - Get help and support

🔧 *Utility:*
/verify - Verify APK authenticity
/changelog - Recent updates
/feedback - Send feedback

Type any command to get started!
    `;
    
    bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

bot.onText(/\/stats/, (msg) => {
    const chatId = msg.chat.id;
    const statsMessage = `
📊 *Download Statistics:*

📱 Android: ${downloadStats.android || 0} downloads
🍎 iOS: ${downloadStats.ios || 0} requests
🌐 Web: ${downloadStats.web || 0} opens

Total: ${(downloadStats.android || 0) + (downloadStats.ios || 0) + (downloadStats.web || 0)} interactions
    `;
    
    bot.sendMessage(chatId, statsMessage, { parse_mode: 'Markdown' });
});

bot.onText(/\/version/, (msg) => {
    const chatId = msg.chat.id;
    let version = '1.0.0';
    
    try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        version = packageJson.version;
    } catch (error) {
        console.error('Error reading version:', error);
    }
    
    bot.sendMessage(chatId, `🔖 Current version: *${version}*`, { parse_mode: 'Markdown' });
});

bot.onText(/\/verify/, (msg) => {
    const chatId = msg.chat.id;
    
    if (!fs.existsSync(ANDROID_APK)) {
        bot.sendMessage(chatId, '❌ No APK file available for verification.');
        return;
    }
    
    try {
        const fileBuffer = fs.readFileSync(ANDROID_APK);
        const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
        const size = fs.statSync(ANDROID_APK).size;
        
        const verifyMessage = `
🔐 *APK Verification:*

📁 File: gizli-android.apk
📏 Size: ${(size / 1024 / 1024).toFixed(2)} MB
🔑 SHA256: \`${hash}\`

✅ This hash can be used to verify the authenticity of the downloaded APK.
        `;
        
        bot.sendMessage(chatId, verifyMessage, { parse_mode: 'Markdown' });
    } catch (error) {
        bot.sendMessage(chatId, '❌ Error generating verification hash.');
    }
});

// Callback query handlers
bot.on('callback_query', (callbackQuery) => {
    const message = callbackQuery.message;
    const data = callbackQuery.data;
    const chatId = message.chat.id;
    
    switch (data) {
        case 'download_android':
            handleAndroidDownload(chatId);
            break;
        case 'download_ios':
            handleiOSDownload(chatId);
            break;
        case 'open_webapp':
            handleWebApp(chatId);
            break;
        case 'show_info':
            handleInfo(chatId);
            break;
    }
    
    bot.answerCallbackQuery(callbackQuery.id);
});

function handleAndroidDownload(chatId) {
    if (fs.existsSync(ANDROID_APK)) {
        incrementDownload('android');
        
        bot.sendMessage(chatId, '📱 *Sending Android APK...*', { parse_mode: 'Markdown' });
        
        bot.sendDocument(chatId, ANDROID_APK, {
            caption: `
📱 *Gizli for Android*

⚠️ *Installation Instructions:*
1. Enable "Install from unknown sources" in Android Settings
2. Open the downloaded APK file
3. Follow installation prompts
4. Launch Gizli and generate your keys

🔐 This APK is signed and verified. Use /verify to check the hash.
            `,
            parse_mode: 'Markdown'
        }).catch((error) => {
            console.error('Error sending APK:', error);
            bot.sendMessage(chatId, '❌ Error sending APK file. Please try again later.');
        });
    } else {
        bot.sendMessage(chatId, `
❌ *Android APK not available*

The APK is currently being built or not available. Please:
• Try again in a few minutes
• Use the web version: ${webAppUrl}
• Contact support if the issue persists
        `, { parse_mode: 'Markdown' });
    }
}

function handleiOSDownload(chatId) {
    incrementDownload('ios');
    
    const iosMessage = `
🍎 *Gizli for iOS*

Choose your installation method:

📱 *App Store* (Recommended)
Coming soon to the App Store

🧪 *TestFlight Beta*
Join our beta testing program
[Request Beta Access](https://forms.gle/your-form-link)

🌐 *Web App* (Available Now)
1. Open Safari on your iPhone/iPad
2. Visit: ${webAppUrl}
3. Tap the Share button
4. Select "Add to Home Screen"
5. Enjoy native-like experience!

💡 The web app works offline and provides the same security features as native apps.
    `;
    
    bot.sendMessage(chatId, iosMessage, { 
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{ text: '🚀 Open Web App', url: webAppUrl }],
                [{ text: '🧪 Request Beta Access', url: 'https://forms.gle/your-form-link' }]
            ]
        }
    });
}

function handleWebApp(chatId) {
    incrementDownload('web');
    
    bot.sendMessage(chatId, `
🌐 *Gizli Web Application*

Access Gizli directly in your browser with full functionality:

🔗 *Web App URL:* ${webAppUrl}

✨ *Features:*
• No installation required
• Works on all devices
• Offline capability
• Same security as mobile apps
• Progressive Web App (PWA)

📱 *Mobile Tip:* Add to home screen for app-like experience!
    `, { 
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{ text: '🚀 Launch Gizli Web App', url: webAppUrl }]
            ]
        }
    });
}

function handleInfo(chatId) {
    const infoMessage = `
🔒 *About Gizli Secure Messenger*

Gizli is a cutting-edge secure messaging application designed for maximum privacy and security.

🛡️ *Security Features:*
• End-to-end encryption using ChaCha20-Poly1305
• Perfect Forward Secrecy
• No central servers store your messages
• Peer-to-peer communication
• Self-destructing messages
• Anonymous connections

🌟 *Key Features:*
• Real-time encrypted messaging
• File sharing with encryption
• Voice calls (coming soon)
• Group chats
• Developer console for advanced users
• Cross-platform compatibility

🔓 *Open Source:*
• Fully open source code
• Auditable security implementation
• Community-driven development
• No hidden backdoors

🚫 *Privacy First:*
• No data collection
• No user tracking
• No ads or monetization
• Your data stays on your device

📱 *Platforms:*
• Android (APK available)
• iOS (Web App + TestFlight)
• Web browsers (PWA)
• Desktop (coming soon)

🔗 *Links:*
• Source Code: https://github.com/your-repo
• Documentation: https://docs.your-domain.com
• Security Audit: Available on request
    `;
    
    bot.sendMessage(chatId, infoMessage, { parse_mode: 'Markdown' });
}

// Error handling
bot.on('error', (error) => {
    console.error('❌ Telegram Bot Error:', error.message);
    console.error('Full error:', error);
});

bot.on('polling_error', (error) => {
    console.error('❌ Polling Error:', error.message);
    console.error('Full error:', error);
});

// Test bot connection
bot.getMe().then((botInfo) => {
    console.log('✅ Bot connected successfully!');
    console.log('🤖 Bot info:', botInfo.first_name, '@' + botInfo.username);
}).catch((error) => {
    console.error('❌ Failed to connect to bot:', error.message);
});

// Startup message
console.log('🤖 Gizli Telegram Bot started successfully!');
console.log('📱 Ready to distribute Gizli apps...');

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down Telegram bot...');
    bot.stopPolling();
    process.exit(0);
});

export default bot;
