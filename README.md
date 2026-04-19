# Hyperia Browser

A clean, minimal browser with installable web-app support for Linux, Mac, Windows 11, iOS, and Android.

## Downloads

### Pre-built Binaries
Download the latest pre-built binaries:

- **Linux**: [Hyperia Browser-1.0.0.AppImage](dist-electron/Hyperia%20Browser-1.0.0.AppImage)
- **Windows 11**: Build with `npm run electron-pack-win` (generates .exe)
- **Mac**: Build with `npm run electron-pack-mac` (generates .app)
- **Android**: [Download APK](./Hyperia-Browser.apk)
- **iOS**: Build a native `.ipa` using Capacitor + Xcode (see below)

### Desktop Applications
You can run the app directly with the prebuilt Linux AppImage in this repo:

- Open `dist-electron/Hyperia Browser-1.0.0.AppImage` on Linux

If you want to build from source, use Electron:

```bash
# Install dependencies
npm install

# Build for your platform
npm run electron-pack-linux    # For Linux
npm run electron-pack-win      # For Windows
npm run electron-pack-mac      # For macOS
```

The built applications will be in the `dist-electron` directory.

### Run without commands
If you just want to try the browser without setup, open `demo.html` or `index.html` in your browser. This works immediately as a local demo, and external sites will open in a normal browser tab when not running in Electron.

### Mobile Applications
For mobile apps, you can use Capacitor or React Native. The web version works as a PWA on mobile devices.

### macOS and iOS Build Process
#### macOS `.app`
To make a native macOS `.app` bundle:

1. Run `npm install`.
2. Build the Electron app on macOS:
   ```bash
   npm run electron-pack-mac
   ```
3. The resulting `.app` will be placed in the `dist-electron/` output directory.

> Note: Building a macOS app usually requires a macOS build machine.

#### iOS `.ipa`
This project is currently a web app, so creating a native iOS `.ipa` requires wrapping it with Capacitor and using Xcode.

1. Install Capacitor:
   ```bash
   npm install @capacitor/core @capacitor/cli --save-dev
   ```
2. Initialize Capacitor in the repo:
   ```bash
   npx cap init HyperiaBrowser com.hyperia.browser
   ```
3. Add the iOS platform:
   ```bash
   npx cap add ios
   ```
4. Build the web app assets:
   ```bash
   npm run build
   ```
5. Sync the web build to iOS:
   ```bash
   npx cap sync ios
   ```
6. Open the Xcode project:
   ```bash
   npx cap open ios
   ```
7. In Xcode, archive the app and export an `.ipa`.

> Building an iOS `.ipa` requires macOS and Xcode, plus an Apple developer account for signing.

### Web Version
The browser works directly in modern web browsers and can be installed as a Progressive Web App (PWA).

### Publish as a Website
This repo is configured to publish as a static website using Vite:

1. Install dependencies:
   ```bash
   npm install
   ```
2. Build the site:
   ```bash
   npm run build
   ```
3. Serve the output from the `dist/` directory.

The app is PWA-ready with `manifest.webmanifest`, service worker registration, and a standalone install experience. If a website does not allow iframe embedding, use the external open button (↗) in the browser toolbar to open the page in a new tab.

## Security Features

- **Website Security Checks**: Before loading external websites, the browser performs basic security analysis
- **Risk Assessment**: Checks for suspicious domain patterns and known safe domains
- **User Warnings**: Displays warnings for potentially unsafe sites with options to continue or cancel
- **HTTPS Preference**: Encourages secure connections

## Building from Source

### 1. Direct download and open
- Download the repository as a ZIP.
- Extract it.
- Open `demo.html` in any modern browser.

This is the easiest no-setup option for Linux, Mac, Windows, Android, and iOS.

### 2. Run locally with Vite
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
3. Open the local URL displayed by Vite.

### 3. Build a static site
1. Build the app:
   ```bash
   npm run build
   ```
2. Preview the build:
   ```bash
   npm run preview
   ```

### 4. Install as a Progressive Web App
When hosted or served locally, the app supports browser install prompts:
- Windows 11: Install from Edge or Chrome via the app install button.
- Mac: Install from Safari/Chrome with "Add to Home Screen" or "Install App".
- Android: Install from Chrome via "Add to Home Screen".
- iOS: Open in Safari and use "Add to Home Screen".

> If you open `index.html` directly from the file system, use `demo.html` instead for immediate no-setup preview.

## Download options
- Clone the repo:
  ```bash
  git clone https://github.com/Xeno-Devteam/hyperia-browser.git
  ```
- Download the ZIP directly from GitHub.
- Open `demo.html` with a browser for a clean local preview.

## Alternate options
If you aren't able to download HyperiaBrowser normally,
We are live at 2 domains:
- [Netlify Domain](https://hyperia-browser.netlify.app/)
- [GitHub Pages Domain](https://xeno-devteam.github.io/hyperia-browser/)
  Please note that these are demos, and they won't work all the time.



## Project structure

- `index.html` — demo shell entry point
- `demo.html` — standalone no-build demo that can be opened directly
- `src/main.js` — app bootstrap and optional service worker registration
- `src/App.js` — browser UI demo logic
- `src/style.css` — minimal browser-style theme
- `public/manifest.webmanifest` — installable web app manifest
- `public/sw.js` — optional caching service worker
- `public/logo.svg` — install icon for the web app


### Notice
Some sites have special scripts, that block any other sites from implementing their site as a display.
We are aware of this, and any site that does use that special script will show "example.com refused to connect" in the display frame.
We will try and fix it soon, but until then, stay tuned at [My Bloxdhub](https://bloxdhub.com/@BredLeGoober)
