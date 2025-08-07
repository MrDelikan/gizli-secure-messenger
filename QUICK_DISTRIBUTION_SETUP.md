# 🚀 Quick Distribution Setup Guide

## 📋 Prerequisites Checklist

### Required Software
- [ ] Node.js 18+ installed
- [ ] Android Studio (for Android builds)
- [ ] Xcode (for iOS builds, macOS only)
- [ ] Git (for version control)

### Required Accounts
- [ ] Telegram Bot Token (from @BotFather)
- [ ] Domain name and SSL certificate
- [ ] Google Play Console (for Play Store)
- [ ] Apple Developer Account (for App Store)

## ⚡ Quick Start (5 minutes)

### 1. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit with your values
nano .env
```

### 2. Install Dependencies
```bash
# Install all dependencies
npm install

# Install Telegram bot dependency (if not already installed)
npm install node-telegram-bot-api
```

### 3. Build All Platforms
```bash
# One command to build everything
npm run distribute
```

### 4. Start Telegram Bot
```bash
# Set your bot token in .env first
export TELEGRAM_BOT_TOKEN="your_bot_token_here"
export WEB_APP_URL="https://your-domain.com"

# Start the bot
npm run telegram-bot
```

## 📱 Platform-Specific Setup

### Android Distribution
```bash
# Build Android APK
npm run build:android

# Copy to releases folder
npm run copy-apk

# Verify APK integrity
npm run verify-apk
```

### iOS Distribution
```bash
# Build iOS (macOS only)
npm run build:ios

# Open in Xcode to complete
npx cap open ios
```

### Web Distribution
```bash
# Build web assets
npm run build:web

# Package for deployment
npm run package-web
```

## 🤖 Telegram Bot Setup

### 1. Create Bot
1. Message @BotFather on Telegram
2. Send `/newbot`
3. Follow instructions to get token
4. Add token to `.env` file

### 2. Configure Bot
```bash
# Edit telegram-bot.js if needed
nano telegram-bot.js

# Update these variables:
# - token (from .env)
# - webAppUrl (your domain)
# - RELEASES_DIR (releases folder)
```

### 3. Test Bot
```bash
# Start bot
npm run telegram-bot

# Test commands:
# /start - Welcome message
# /android - Download APK
# /ios - iOS options
# /web - Web app
```

## 🌐 Web Server Setup

### 1. Nginx Configuration
```bash
# Copy nginx config
sudo cp web-server-config.nginx /etc/nginx/sites-available/gizli

# Update domain and SSL paths
sudo nano /etc/nginx/sites-available/gizli

# Enable site
sudo ln -s /etc/nginx/sites-available/gizli /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### 2. Deploy Web Files
```bash
# Extract web package to server
sudo mkdir -p /var/www/gizli
sudo tar -xzf releases/gizli-web-*.tar.gz -C /var/www/gizli/
sudo chown -R www-data:www-data /var/www/gizli
```

### 3. Start Signaling Server
```bash
# Install PM2 for process management
npm install -g pm2

# Start server
pm2 start server/index.ts --name gizli-server

# Save PM2 configuration
pm2 save
pm2 startup
```

## 📊 Distribution Checklist

### Pre-Distribution
- [ ] Test app on Android device
- [ ] Test web app in multiple browsers
- [ ] Verify all security headers
- [ ] Check SSL certificate validity
- [ ] Test Telegram bot commands
- [ ] Verify APK signature

### Distribution Channels
- [ ] Upload APK to website
- [ ] Configure Telegram bot with files
- [ ] Submit to Google Play Store
- [ ] Submit to Apple App Store
- [ ] Create GitHub release
- [ ] Update documentation

### Post-Distribution
- [ ] Monitor download statistics
- [ ] Check for user feedback
- [ ] Monitor server logs
- [ ] Update security patches
- [ ] Plan next version features

## 🔧 Troubleshooting

### Common Issues

**Android Build Fails**
```bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
npm run build:android
```

**Telegram Bot Not Responding**
```bash
# Check token and permissions
echo $TELEGRAM_BOT_TOKEN
# Restart bot
pkill -f telegram-bot.js
npm run telegram-bot
```

**Web App Not Loading**
```bash
# Check nginx logs
sudo tail -f /var/log/nginx/gizli_error.log

# Check server status
pm2 status
pm2 logs gizli-server
```

**SSL Certificate Issues**
```bash
# Test SSL
openssl s_client -connect your-domain.com:443

# Renew Let's Encrypt
sudo certbot renew
```

## 📈 Monitoring & Analytics

### Server Monitoring
```bash
# Check server status
pm2 monit

# View logs
pm2 logs gizli-server

# Check nginx status
sudo systemctl status nginx
```

### Download Statistics
```bash
# View bot statistics
cat download-stats.json

# Check web server access logs
sudo tail -f /var/log/nginx/gizli_access.log
```

## 🔄 Updates & Maintenance

### Regular Updates
```bash
# Update dependencies
npm update

# Rebuild and redeploy
npm run distribute

# Update server
pm2 restart gizli-server

# Update web files
sudo tar -xzf releases/gizli-web-*.tar.gz -C /var/www/gizli/
```

### Security Updates
- Monitor for dependency vulnerabilities
- Update SSL certificates before expiry
- Review and update security headers
- Monitor server logs for suspicious activity

## 📞 Support Resources

- **Documentation**: See MOBILE_APP_DISTRIBUTION.md
- **Security**: See SECURITY_AUDIT.md
- **Deployment**: See DEPLOYMENT_GUIDE.md
- **Issues**: Create GitHub issues for bugs
- **Community**: Set up Discord/Telegram support group

---

*This setup enables distribution across all platforms with minimal configuration. Customize as needed for your specific requirements.*
