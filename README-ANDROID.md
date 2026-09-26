# 📱 HISAB KITAB - Android APK & AAB Build Guide

This project includes the complete source code and native Android project configurations to build both:
1. **APK (`.apk`)**: For direct installation on any Android smartphone/tablet.
2. **AAB (`.aab`)**: Android App Bundle for publishing to Google Play Store.

---

## ⚡ Method 1: Instant 1-Click Install on Android (No Building Required)
HISAB KITAB is a full Progressive Web App (PWA) with a Web App Manifest and Service Worker:
1. Open the app link on Google Chrome on your Android phone.
2. Tap the **"Install App"** prompt at the bottom, or tap the three dots **(⋮)** in Chrome and select **"Install app"** (or **"Add to Home Screen"**).
3. Android will automatically package and install a genuine **WebAPK** with the HK emblem on your home screen. It runs offline, in full-screen mode, without the browser address bar.

---

## 🛠️ Method 2: Build APK & AAB with Android Studio (Recommended)

### Prerequisites:
- [Android Studio](https://developer.android.com/studio) installed.
- Node.js (v18+)

### Step-by-Step:
1. Build the web distribution:
   ```bash
   npm install
   npm run build
   ```
2. Copy `dist/` contents to Android assets:
   ```bash
   mkdir -p android/app/src/main/assets
   cp -r dist/* android/app/src/main/assets/
   ```
3. Open the `android` folder in **Android Studio**:
   - File -> Open -> Select the `android` directory in this project.
4. **To Build APK**:
   - In Android Studio menu: **Build** -> **Build Bundle(s) / APK(s)** -> **Build APK(s)**.
   - Or in terminal:
     ```bash
     cd android
     ./gradlew assembleRelease
     ```
   - Your APK file is ready at: `android/app/build/outputs/apk/release/app-release.apk`
5. **To Build AAB (for Google Play Store)**:
   - In Android Studio menu: **Build** -> **Generate Signed Bundle / APK** -> **Android App Bundle**.
   - Or in terminal:
     ```bash
     cd android
     ./gradlew bundleRelease
     ```
   - Your AAB bundle is ready at: `android/app/build/outputs/bundle/release/app-release.aab`

---

## 🚀 Method 3: 1-Click Cloud APK & AAB Generator (PWABuilder)
1. Go to [PWABuilder.com](https://www.pwabuilder.com/).
2. Enter your live app URL.
3. Click **"Package for Stores"** -> Select **Android**.
4. Click **"Generate Package"**.
5. It will immediately download:
   - Signed / Unsigned APK for direct phone install.
   - Ready-to-publish Google Play Store `.aab` package!

---

## 📦 Method 4: Capacitor CLI (Alternative)
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Hisab Kitab" "com.hisabkitab.billing" --web-dir dist
npm run build
npx cap add android
npx cap sync
npx cap open android
```
