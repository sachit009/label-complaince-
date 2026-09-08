# Google Play Store & Apple App Store Publishing Guide for LM Scan

This guide outlines how to package and release **LM Scan** to the **Google Play Store (Android)** and **Apple App Store (iOS)**.

---

## 📱 Architecture Overview

LM Scan is built as a **Progressive Web App (PWA) + Capacitor Hybrid Native App**:
1. **PWA Mode**: Instantly installable directly from Safari / Chrome without app store approval.
2. **Google Play Store (Android)**: Packaged via **Capacitor** or **Bubblewrap (TWA)** into an `.aab` (Android App Bundle).
3. **Apple App Store (iOS)**: Packaged via **Capacitor iOS** into an `.ipa` archive built with Xcode.

---

## 🤖 1. Publishing to Google Play Store (Android)

### Option A: Using Capacitor (Recommended)

1. **Install Capacitor CLI**:
   ```bash
   npm install -g @capacitor/cli @capacitor/core @capacitor/android
   ```

2. **Initialize & Add Android Platform**:
   ```bash
   cd /Users/sachit/.gemini/antigravity/scratch/compliance-label-scanner
   npx cap add android
   npx cap sync
   ```

3. **Open in Android Studio**:
   ```bash
   npx cap open android
   ```

4. **Add Permissions in `AndroidManifest.xml`**:
   ```xml
   <uses-permission android:name="android.permission.CAMERA" />
   <uses-permission android:name="android.permission.INTERNET" />
   <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
   <uses-feature android:name="android.hardware.camera" android:required="false" />
   <uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />
   ```

5. **Generate Signed Android App Bundle (`.aab`)**:
   - In Android Studio: Go to **Build** $\rightarrow$ **Generate Signed Bundle / APK**.
   - Choose **Android App Bundle**, select your Keystore, and build for Release.
   - Upload the resulting `.aab` file to the [Google Play Console](https://play.google.com/console).

---

## 🍏 2. Publishing to Apple App Store (iOS)

### Option A: Using Capacitor iOS

1. **Add iOS Platform**:
   ```bash
   npm install -g @capacitor/ios
   npx cap add ios
   npx cap sync
   ```

2. **Open in Xcode**:
   ```bash
   npx cap open ios
   ```

3. **Configure Permissions in `Info.plist`**:
   Add camera & photo library privacy descriptions:
   ```xml
   <key>NSCameraUsageDescription</key>
   <string>LM Scan needs camera access to photograph and inspect packaged commodity compliance labels.</string>
   <key>NSPhotoLibraryUsageDescription</key>
   <string>LM Scan needs access to your photo library to select packaging labels for compliance analysis.</string>
   ```

4. **Archive & Upload to App Store Connect**:
   - In Xcode: Select **Product** $\rightarrow$ **Archive**.
   - Click **Distribute App** $\rightarrow$ select **App Store Connect**.
   - Submit for App Review on [App Store Connect](https://appstoreconnect.apple.com).

---

## ☁️ 3. Deploying the Backend to a Free Global HTTPS URL

To allow anyone on any phone to scan labels without a local Wi-Fi requirement:

### 1-Click Deploy on Render (Free)
1. Push this directory to a GitHub repository.
2. Go to [Render.com](https://render.com) $\rightarrow$ **New Web Service** $\rightarrow$ connect your repository.
3. Render will auto-detect `render.yaml` / `Dockerfile` and give you a global URL:
   `https://lm-scan.onrender.com`
4. Update `server.url` in `capacitor.config.json` with your live domain:
   ```json
   "server": {
     "url": "https://lm-scan.onrender.com",
     "cleartext": false
   }
   ```
