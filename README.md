# Legal Metrology Compliance Label Scanner (LM Scan)

A high-performance, production-ready AI scanner and audit system for packaged commodities in India, verifying mandatory declarations under the **Legal Metrology (Packaged Commodities) Rules, 2011** and **2022/2024 Amendments**.

---

## 🌟 Key Features

### 1. Statutory Compliance Verification
- **Rule 6(1)(a)**: Name & complete postal address of Manufacturer / Packer / Importer + PIN Code + Country of Origin.
- **Rule 6(1)(b)**: Generic or common name of the commodity (distinct from commercial brand name).
- **Rule 6(1)(c)**: Net quantity in standard SI metric units (`g`, `kg`, `ml`, `L`, `m`, `cm`, `N`/units). Flags illegal symbols such as `gms`, `kgs`, `ML`, `ltrs`.
- **Rule 6(1)(d)**: Month & Year of manufacture, packing, or import (MFD/PKD).
- **Rule 6(1)(e)**: Retail sale price: Maximum Retail Price with mandatory `(inclusive of all taxes)` / `(incl. of all taxes)`.
- **Rule 6(1)(e) Amendment / Rule 6(11)**: **Unit Sale Price (USP)** calculation and validation (e.g. `₹ / g`, `₹ / kg`, `₹ / item`).
- **Rule 6(1)(f)**: Consumer care & grievance contact details (name, telephone/helpline, email, postal address).
- **FSSAI & Standards**: 14-digit FSSAI License validation, Veg/Non-Veg emblem check, Batch/Lot number.
- **Section 36 Legal Penalties Reference**: Explains statutory fines under Legal Metrology Act, 2009 (up to ₹25,000 for 1st offence, ₹50,000 for 2nd offence, ₹1,00,000 / imprisonment for subsequent offences).

### 2. Dual-Engine Intelligence Architecture
- **Gemini Vision AI Engine**: Multimodal semantic OCR and regulatory reasoning when an API key is provided.
- **Built-in Offline Heuristic Engine**: Zero-dependency local engine running directly in Python, ensuring sub-second response times and 100% uptime with zero 502/500 gateway failures.

### 3. Live Camera & Image Preprocessing
- Real-time WebRTC camera viewfinder with target reticle, alignment grid, camera flipping, and torch/flashlight toggle.
- Client-side image compression and adaptive normalization to optimize network and compute efficiency.

### 4. Inspection Audit Reports & Analytics
- One-click **Print / Download Formal Legal Metrology Inspection Certificate (PDF-ready)**.
- **CSV & JSON Export** for batch audits and quality assurance logs.
- SQLite-backed search, status filtering, and compliance stats tracking.

---

## 🚀 How to Run

### Start the Server
```bash
python3 server.py
```

Open your browser and navigate to:
```
http://localhost:8080
```

---

## 📁 Project Structure

```
compliance-label-scanner/
├── server.py                   # High-throughput threaded HTTP REST API server
├── compliance_engine.py        # Legal Metrology rules parser & compliance scoring engine
├── db.py                       # SQLite database for scan persistence & analytics
├── static/                     # Web Application & PWA Assets
│   ├── index.html              # Material 3 Responsive SPA
│   ├── icon.png                # 192x192 App Icon
│   ├── icon-512.png            # 512x512 High-Res App Icon
│   ├── manifest.webmanifest    # PWA Manifest
│   ├── sw.js                   # Service Worker Offline Cache
│   ├── css/                    # Styles & Typography
│   └── js/                     # Controller, Camera HUD, Image Preprocessor, Reports
├── android/                    # Native Android Project (Kotlin + Java)
│   ├── build.gradle            # Top-level Gradle configuration
│   ├── settings.gradle         # Module definitions
│   └── app/                    # Android application module
│       ├── build.gradle        # Target SDK 34, AndroidX, Material 3
│       └── src/main/
│           ├── AndroidManifest.xml # Permissions (Camera, Internet)
│           ├── java/com/lmscan/compliance/
│           │   ├── MainActivity.kt   # Kotlin WebView & WebRTC Camera Controller
│           │   └── WebAppInterface.java # Java Native Bridge (Haptics, Toasts)
│           ├── res/            # Vector drawables, adaptive mipmap icons, styles
│           └── assets/         # Bundled offline web application
├── ios/                        # Native iOS Project (Swift)
│   ├── LMScan.xcodeproj        # Xcode Project Configuration
│   └── LMScan/
│       ├── AppDelegate.swift   # Swift Application Lifecycle
│       ├── SceneDelegate.swift # Swift Scene Management
│       ├── ViewController.swift# Swift WKWebView Controller & Native Bridge
│       ├── Info.plist          # Camera & Photo Library Privacy Permissions
│       ├── Assets.xcassets     # iOS App Icons
│       └── www/                # Bundled offline web application
├── Dockerfile                  # Production container configuration with HEALTHCHECK
├── render.yaml                 # One-click Render.com cloud deployment
├── capacitor.config.json       # Cross-platform hybrid bridge configuration
└── APP_STORE_PUBLISHING_GUIDE.md # Google Play Store & Apple App Store Publishing Guide
```

---

## 📱 Mobile Native Builds

### Android (Google Play Store)
1. Open the `android/` directory in **Android Studio**.
2. Sync Gradle dependencies.
3. Select **Build > Generate Signed Bundle / APK > Android App Bundle (.aab)** for Google Play Console submission.

### iOS (Apple App Store)
1. Open `ios/LMScan.xcodeproj` in **Xcode** on macOS.
2. Select your development Team in **Signing & Capabilities**.
3. Select any iOS Simulator or connected iPhone device and click **Run** (`Cmd + R`).
4. Select **Product > Archive** to publish to App Store Connect / TestFlight.

---

## 🐙 Push to GitHub Repository

To upload this project to your GitHub repository:

```bash
# 1. Add your GitHub repository remote URL
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPOSITORY_NAME>.git

# 2. Rename branch to main (if needed)
git branch -M main

# 3. Push all code to GitHub
git push -u origin main
```

