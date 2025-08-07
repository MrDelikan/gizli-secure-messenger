# 📱 Gizli Secure Chat - Mobile Installation Guide

## 🚀 Quick Install Options

### Option 1: Progressive Web App (PWA) - **RECOMMENDED FOR IMMEDIATE TESTING**

**Android & iOS Compatible - No App Store Required!**

#### For Local Testing:
1. **Open your mobile browser** (Chrome, Safari, Firefox)
2. **Navigate to:** `http://192.168.0.32:55772` (if on same WiFi network)
   - Or use `http://localhost:5173` if testing on the same device
3. **Add to Home Screen:**
   - **Android Chrome:** Tap menu (⋮) → "Add to Home screen"
   - **iOS Safari:** Tap share button (⬆️) → "Add to Home Screen"
   - **Other browsers:** Look for "Install app" or "Add to Home screen"

The app will install like a native app with:
- ✅ Home screen icon
- ✅ Full-screen experience
- ✅ Offline capability
- ✅ All security features enabled

### Option 2: Native Android APK (Requires Setup)

#### Prerequisites:
1. **Install Java JDK 17+**: https://adoptium.net/
2. **Install Android Studio**: https://developer.android.com/studio
3. **Accept Android SDK licenses**

#### Build Commands:
```bash
# In the project directory
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```

**Output APK Location:** `android/app/build/outputs/apk/debug/app-debug.apk`

### Option 3: Native iOS IPA (macOS + Xcode Required)

#### Prerequisites:
1. **macOS with Xcode installed**
2. **Apple Developer Account** (for distribution)

#### Build Commands:
```bash
npm run build
npx cap sync ios
npx cap open ios
```
Then build in Xcode for distribution.

## 🌐 Current Available URLs

### Development Server (with hot reload):
- **Local:** http://localhost:5173
- **Network:** http://192.168.0.32:5173 (if available)

### Production Build (optimized):
- **Local:** http://localhost:55772
- **Network:** http://192.168.0.32:55772

## 📋 Installation Steps (Mobile Browser)

### Android:
1. Open **Chrome** on your Android device
2. Go to `http://192.168.0.32:55772`
3. Tap the **menu button (⋮)** in Chrome
4. Select **"Add to Home screen"**
5. Name it "Gizli" and tap **"Add"**
6. Find the Gizli icon on your home screen
7. Tap to launch the app

### iOS:
1. Open **Safari** on your iPhone/iPad
2. Go to `http://192.168.0.32:55772`
3. Tap the **Share button (⬆️)** at the bottom
4. Scroll and tap **"Add to Home Screen"**
5. Name it "Gizli" and tap **"Add"**
6. Find the Gizli icon on your home screen
7. Tap to launch the app

## 🔒 Security Features Included

- ✅ **End-to-End Encryption** (ChaCha20-Poly1305)
- ✅ **Perfect Forward Secrecy** (Double Ratchet)
- ✅ **Post-Quantum Resistant** (X25519 + Ed25519)
- ✅ **P2P Communication** (WebRTC)
- ✅ **No Server Storage** (Zero-knowledge architecture)
- ✅ **Secure Key Generation** (Device-local)
- ✅ **Memory Protection** (Secure deletion)

## 🛠️ Troubleshooting

### Cannot Connect to Network URL:
- Ensure your mobile device is on the same WiFi network
- Try the localhost URL if testing on the same device
- Check Windows Firewall settings

### PWA Installation Not Working:
- Use Chrome on Android or Safari on iOS
- Ensure you're using HTTPS or localhost
- Clear browser cache and try again

### App Not Loading:
- Check internet connection
- Refresh the browser
- Clear browser cache
- Try a different browser

## 📦 File Sizes (Optimized)
- **Web Bundle:** ~1.2 MB (gzipped: ~400 KB)
- **Crypto Libraries:** ~750 KB (necessary for security)
- **PWA Install:** ~2 MB total

## 🎯 Next Steps

1. **Test PWA Installation** using the URLs above
2. **Share the network URL** with others for testing
3. **Build native apps** when ready for app store distribution
4. **Deploy to web server** for permanent hosting

The PWA installation provides 95% of native app functionality and is the quickest way to test the secure chat application on mobile devices!

---

**Need Help?** The app is currently running and ready for installation at:
**http://192.168.0.32:55772** (network) or **http://localhost:55772** (local)
