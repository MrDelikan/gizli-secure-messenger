# 📱 Gizli Mobile App Distribution Guide

## 🎯 Overview
This guide covers distributing the Gizli secure messaging app on Android, iOS, web platforms, and Telegram bot integration.

## 📋 Prerequisites
- Node.js 18+ installed
- Android Studio (for Android builds)
- Xcode (for iOS builds, macOS only)
- Apple Developer Account (for iOS App Store)
- Google Play Console Account (for Android Play Store)

## 🤖 Android Distribution

### 1. Build Android APK/AAB
```bash
# Build the web assets
npm run build

# Sync with Capacitor
npx cap sync android

# Open in Android Studio
npx cap open android
```

### 2. Generate Signed APK
In Android Studio:
1. **Build** → **Generate Signed Bundle/APK**
2. Choose **APK** for direct distribution or **AAB** for Play Store
3. Create/use existing keystore
4. Select **release** build variant
5. Build will be generated in `android/app/build/outputs/`

### 3. Direct APK Distribution
```bash
# After building in Android Studio, the APK will be at:
# android/app/build/outputs/apk/release/app-release.apk

# You can distribute this APK directly via:
# - Your website download link
# - Telegram bot file sharing
# - Email or cloud storage
```

### 4. Google Play Store
1. Upload AAB to Google Play Console
2. Complete store listing with screenshots
3. Set up content rating and pricing
4. Submit for review

## 🍎 iOS Distribution

### 1. Build iOS App
```bash
# Build web assets
npm run build

# Sync with Capacitor
npx cap sync ios

# Open in Xcode (macOS only)
npx cap open ios
```

### 2. Xcode Configuration
1. Set **Team** and **Bundle Identifier**
2. Configure **Signing & Capabilities**
3. Set deployment target (iOS 13.0+)
4. Archive for distribution

### 3. App Store Distribution
1. Archive in Xcode
2. Upload to App Store Connect
3. Complete app metadata
4. Submit for review

### 4. TestFlight Beta Distribution
1. Upload build to App Store Connect
2. Add beta testers
3. Share TestFlight link

## 🌐 Web Distribution

### 1. Build for Web
```bash
# Production build
npm run build

# Files will be in /dist folder
# Upload dist/ contents to your web server
```

### 2. PWA Installation
The app supports Progressive Web App installation:
- Users can install directly from browser
- Works offline with service worker
- Native app-like experience

### 3. Web Server Configuration
```nginx
# Nginx configuration for HTTPS and security headers
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    root /path/to/gizli/dist;
    index index.html;
    
    # Security headers
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' wss://your-domain.com;";
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 🤖 Telegram Bot Integration

### 1. Bot Setup
```javascript
// telegram-bot.js
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

const token = 'YOUR_BOT_TOKEN';
const bot = new TelegramBot(token, { polling: true });

// Handle /start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = `
🔒 *Gizli Secure Messenger*

Download the app for your platform:

📱 *Android*: /download_android
🍎 *iOS*: /download_ios  
🌐 *Web App*: https://your-domain.com
💻 *Desktop*: /download_desktop

Features:
✅ End-to-end encryption
✅ P2P communication
✅ No data collection
✅ Open source
    `;
    
    bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
});

// Handle Android download
bot.onText(/\/download_android/, (msg) => {
    const chatId = msg.chat.id;
    const apkPath = path.join(__dirname, 'releases', 'gizli-android.apk');
    
    if (fs.existsSync(apkPath)) {
        bot.sendDocument(chatId, apkPath, {
            caption: '📱 Gizli for Android\n\n⚠️ Enable "Install from unknown sources" in your Android settings before installing.'
        });
    } else {
        bot.sendMessage(chatId, '❌ Android APK not available. Please try again later.');
    }
});

// Handle iOS download
bot.onText(/\/download_ios/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `
🍎 *Gizli for iOS*

Choose your installation method:

📱 *App Store*: [Download from App Store](https://apps.apple.com/app/gizli)
🧪 *TestFlight Beta*: [Join Beta Testing](https://testflight.apple.com/join/YOUR_CODE)
🌐 *Web App*: [Open in Safari](https://your-domain.com) (Add to Home Screen)
    `, { parse_mode: 'Markdown' });
});

// Handle web app
bot.onText(/\/webapp/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, '🌐 Open Gizli Web App', {
        reply_markup: {
            inline_keyboard: [[
                { text: '🚀 Launch Web App', web_app: { url: 'https://your-domain.com' } }
            ]]
        }
    });
});
```

### 2. Bot Deployment
```bash
# Install dependencies
npm install node-telegram-bot-api

# Run the bot
node telegram-bot.js
```

### 3. File Distribution Setup
```bash
# Create releases directory
mkdir releases

# Copy APK after building
cp android/app/build/outputs/apk/release/app-release.apk releases/gizli-android.apk

# For iOS, provide App Store/TestFlight links instead of files
```

## 📦 Distribution Package Script

Create an automated distribution script:

```bash
#!/bin/bash
# distribute.sh

echo "🚀 Building Gizli for distribution..."

# Build web assets
npm run build

# Build Android
echo "📱 Building Android..."
npm run mobile:build
cd android
./gradlew assembleRelease
cd ..

# Copy APK to releases
mkdir -p releases
cp android/app/build/outputs/apk/release/app-release.apk releases/gizli-android-$(date +%Y%m%d).apk

# Build iOS (if on macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Building iOS..."
    npx cap sync ios
    echo "Open Xcode to complete iOS build: npx cap open ios"
fi

# Create web distribution package
echo "🌐 Creating web package..."
tar -czf releases/gizli-web-$(date +%Y%m%d).tar.gz dist/

echo "✅ Distribution packages created in releases/ folder"
echo "📱 Android APK: releases/gizli-android-$(date +%Y%m%d).apk"
echo "🌐 Web package: releases/gizli-web-$(date +%Y%m%d).tar.gz"
```

## 🔐 Security Considerations

### Code Signing
- **Android**: Use proper keystore for signing APKs
- **iOS**: Use valid Apple Developer certificates
- **Web**: Serve over HTTPS with valid SSL certificates

### Distribution Security
- Verify APK signatures before distribution
- Use secure channels for file distribution
- Implement update mechanisms with signature verification

### Privacy Compliance
- Include privacy policy
- Comply with GDPR/CCPA requirements
- Implement proper data handling

## 📊 Analytics and Updates

### Update Distribution
```javascript
// Check for updates in the app
const checkForUpdates = async () => {
    try {
        const response = await fetch('https://your-domain.com/api/version');
        const { version, downloadUrl } = await response.json();
        
        if (version > currentVersion) {
            // Notify user of update
            showUpdateNotification(downloadUrl);
        }
    } catch (error) {
        console.error('Update check failed:', error);
    }
};
```

### Distribution Analytics
- Track download counts
- Monitor installation success rates
- Collect crash reports (with user consent)

## 🚀 Quick Start Commands

```bash
# Complete distribution build
npm run distribute

# Android only
npm run build:android

# iOS only (macOS)
npm run build:ios

# Web only
npm run build:web

# Start Telegram bot
npm run telegram-bot
```

## 📞 Support and Documentation

- **User Guide**: Include in-app help and tutorials
- **Technical Support**: Set up support channels
- **Community**: Create user forums or Discord server
- **Updates**: Regular security and feature updates

---

*This distribution setup ensures Gizli can reach users across all major platforms while maintaining security and ease of installation.*
