# 🚀 Gizli Deployment Guide

## Quick Start Options

### 1. 📱 PWA (Progressive Web App) - **RECOMMENDED**
Your app is **already PWA-ready**! Users can install it directly from their browser:

#### Installation for Users:
- **Android (Chrome/Edge)**: Visit your hosted URL → Menu → "Add to Home screen"
- **iOS (Safari)**: Visit your hosted URL → Share → "Add to Home Screen"

#### Current Status: ✅ READY
- Service Worker: ✅ Configured
- Web Manifest: ✅ Configured  
- Offline Support: ✅ Working
- Push Notifications: ✅ Ready

---

### 2. 📦 Native Mobile Apps (Android/iOS)

#### Android Development Setup
```bash
# 1. Build and open Android Studio
npm run mobile:android

# 2. In Android Studio:
# - Connect your Android device
# - Enable USB Debugging
# - Click "Run" to install on device
```

#### iOS Development Setup (macOS only)
```bash
# 1. Add iOS platform
npx cap add ios

# 2. Build and open Xcode
npm run mobile:ios

# 3. In Xcode:
# - Select your team/signing certificate
# - Connect your iOS device
# - Click "Run" to install on device
```

---

## 🌐 Production Hosting Options

### Option A: Static Hosting (Simple)
**Best for**: Testing, small deployments

**Platforms**: Netlify, Vercel, GitHub Pages
```bash
# Build for production
npm run build

# Deploy the 'dist' folder to your chosen platform
```

### Option B: Full Stack Hosting (Complete)
**Best for**: Production use with signaling server

**Platforms**: Railway, Render, Heroku, DigitalOcean

1. **Deploy Backend** (server/index.ts)
2. **Deploy Frontend** (dist folder)
3. **Update environment variables**

---

## 🔧 Environment Configuration

### Development
```bash
# Start both servers locally
npm start

# Frontend: http://localhost:5173
# Backend: http://localhost:3001
```

### Production
Update your environment variables:
```env
VITE_SIGNALING_SERVER_URL=https://your-backend-domain.com
PORT=3001
```

---

## 📱 Mobile App Store Deployment

### Google Play Store (Android)
```bash
# 1. Build release version
npm run build
npx cap sync android

# 2. Open Android Studio
npx cap open android

# 3. In Android Studio:
# - Build → Generate Signed Bundle/APK
# - Choose "Android App Bundle"
# - Upload to Google Play Console
```

**Important**: Google Play may have restrictions on encryption apps. Consider:
- Educational/research purpose emphasis
- Open source nature highlighting
- Compliance documentation

### Apple App Store (iOS)
```bash
# 1. Build release version (macOS only)
npm run build
npx cap sync ios

# 2. Open Xcode
npx cap open ios

# 3. In Xcode:
# - Select your team
# - Archive the app
# - Upload to App Store Connect
```

**Important**: App Store may reject strong encryption apps. Consider:
- Export compliance documentation
- Educational purpose emphasis
- Terms of service clarity

---

## 🔒 Security Considerations for Deployment

### 1. HTTPS Only
- **Required** for PWA and WebRTC
- Use certificates from Let's Encrypt or your hosting provider

### 2. Content Security Policy
Add to your index.html:
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  connect-src 'self' wss: ws:;
  media-src 'self' blob:;
">
```

### 3. Environment Variables
Never expose sensitive keys:
```bash
# .env (not committed to git)
VITE_APP_VERSION=1.0.0
VITE_SIGNALING_SERVER_URL=https://your-server.com
```

### 4. Server Security
Your signaling server includes:
- ✅ Helmet.js for security headers
- ✅ CORS configuration
- ✅ Rate limiting ready

---

## 🚀 Automated Deployment Scripts

### GitHub Actions (CI/CD)
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy Gizli
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '18'
    - run: npm install
    - run: npm run build
    - run: npm run mobile:deploy:android
```

### Quick Deploy Commands
```bash
# PWA deployment
npm run build
# Upload 'dist' folder to your hosting service

# Android APK
npm run mobile:deploy:android
# Find APK in: android/app/build/outputs/apk/

# iOS Archive
npm run mobile:deploy:ios
# Open Xcode and archive for App Store
```

---

## 📊 Current Project Status

### ✅ Completed
- [x] End-to-end encryption (ChaCha20-Poly1305)
- [x] Perfect Forward Secrecy (X25519 + Signal Protocol)
- [x] P2P networking (WebRTC)
- [x] Mobile-responsive UI
- [x] PWA configuration
- [x] Capacitor setup for native apps
- [x] Production build optimization

### 🎯 Ready for Deployment
- [x] **PWA**: Install directly from browser
- [x] **Android**: Open in Android Studio and run
- [x] **iOS**: Open in Xcode and run (macOS only)
- [x] **Web**: Deploy dist folder to any static host

---

## 🛠️ Troubleshooting

### Common Issues

#### "Module not found" errors
```bash
npm install
npm run build
```

#### PWA not installing
- Ensure HTTPS
- Check service worker registration
- Verify manifest.json

#### Android build fails
- Install Android Studio
- Accept SDK licenses: `sdkmanager --licenses`
- Check Java version: `java -version`

#### iOS build fails (macOS only)
- Install Xcode from App Store
- Install Xcode Command Line Tools
- Check Apple Developer account

### Getting Help
1. Check the browser console for errors
2. Verify network connectivity
3. Test on localhost first
4. Check MOBILE_DEPLOYMENT.md for detailed instructions

---

## 🎉 Next Steps

1. **Test locally**: Your app is running at http://localhost:5173
2. **Try PWA**: Install it from your browser
3. **Test mobile**: Use the mobile:android or mobile:ios commands
4. **Deploy**: Choose your hosting platform and follow the guide above

**Your Gizli app is ready for the world!** 🔐📱
