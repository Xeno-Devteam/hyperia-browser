# Hyperia Browser

A clean, minimal browser demo with installable web-app support for Linux, Mac, Windows 11, iOS, and Android.

## Ways to use it

### 1. Direct download and open
- Download the repository as a ZIP.
- Extract it.
- Open `demo.html` in any modern browser.

This is the easiest no-setup option for Linux, Mac, and Windows.

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

### 4. Use as an installable web app
When hosted or served locally, the app supports browser install prompts:
- Windows 11: Install from Edge or Chrome via the app install button.
- Mac: Install from Safari/Chrome with "Add to Home Screen" or "Install App".
- Android: Install from Chrome via "Add to Home Screen".
- iOS: Open in Safari and use "Add to Home Screen".

## Download options
- Clone the repo:
  ```bash
  git clone https://github.com/Xeno-Devteam/hyperia-browser.git
  ```
- Download the ZIP directly from GitHub.
- Open `demo.html` with a browser for a clean local preview.

## Project structure

- `index.html` — demo shell entry point
- `demo.html` — standalone no-build demo that can be opened directly
- `src/main.js` — app bootstrap and optional service worker registration
- `src/App.js` — browser UI demo logic
- `src/style.css` — minimal browser-style theme
- `public/manifest.webmanifest` — installable web app manifest
- `public/sw.js` — optional caching service worker
- `public/icon.svg` — install icon for the web app
