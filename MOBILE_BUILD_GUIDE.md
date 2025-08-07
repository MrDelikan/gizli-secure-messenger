# Mobile App Installation Files Generation Guide

## Prerequisites for Building Mobile Apps

### For Android APK Generation:
1. **Install Java Development Kit (JDK) 17 or higher**
   - Download from: https://adoptium.net/
   - Set JAVA_HOME environment variable
   - Add Java to your PATH

2. **Install Android Studio**
   - Download from: https://developer.android.com/studio
   - Install Android SDK and build tools
   - Accept SDK licenses

### For iOS IPA Generation:
1. **Install Xcode** (macOS only)
   - Download from Mac App Store
   - Install Xcode Command Line Tools
2. **Apple Developer Account** (for distribution)

## Quick Build Commands (After Prerequisites)

### Android APK:
```bash
# Build the web app
npm run build

# Sync with Capacitor
npx cap sync android

# Build APK
cd android
./gradlew assembleDebug
```
**Output:** `android/app/build/outputs/apk/debug/app-debug.apk`

### iOS IPA:
```bash
# Build the web app
npm run build

# Sync with Capacitor
npx cap sync ios

# Open in Xcode
npx cap open ios
```
Then build in Xcode for App Store or Ad Hoc distribution.

## Alternative: Cloud Build Services

### 1. Capacitor Cloud (Ionic)
```bash
npm install -g @ionic/cli
ionic capacitor build android --platform=android
ionic capacitor build ios --platform=ios
```

### 2. EAS Build (Expo)
```bash
npm install -g @expo/cli
eas build --platform android
eas build --platform ios
```

## Current Project Status
✅ Web app built successfully in `dist/` folder
✅ Capacitor configured for Android/iOS
✅ Android project synced and ready
⚠️ Need Java JDK for Android compilation
⚠️ Need Xcode for iOS compilation

## Manual Installation Options

### Option 1: PWA Installation
Users can install directly from browser:
1. Visit: `https://your-domain.com`
2. Click "Add to Home Screen" (mobile browsers)
3. App installs as Progressive Web App

### Option 2: Local Development Server
For testing purposes:
```bash
npm start
# Then open on mobile browser and "Add to Home Screen"
```

## Files Generated
- `dist/` - Production web build
- `android/app/build/outputs/apk/` - Android APK (after build)
- `ios/build/` - iOS IPA (after Xcode build)

## App Store Distribution
1. **Google Play Store**: Upload APK/AAB file
2. **Apple App Store**: Upload IPA through Xcode or Application Loader
3. **Direct Distribution**: Share APK file directly (Android only)

## Security Notes
- All builds include end-to-end encryption
- Keys generated locally on each device
- No server-side key storage
- Perfect forward secrecy enabled

## Troubleshooting
- **Java not found**: Install JDK and set JAVA_HOME
- **Android SDK not found**: Install Android Studio
- **iOS build fails**: Ensure Xcode and signing certificates
- **Large bundle size**: Normal for crypto libraries
