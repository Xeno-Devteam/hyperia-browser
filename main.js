const { app, BrowserWindow, Menu } = require('electron');
const fs = require('fs');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

const preloadPath = fs.existsSync(path.join(__dirname, 'preload.js'))
  ? path.join(__dirname, 'preload.js')
  : path.join(__dirname, 'dist-electron/preload.js');
const iconPath = fs.existsSync(path.join(__dirname, 'public', 'logo.svg'))
  ? path.join(__dirname, 'public', 'logo.svg')
  : path.join(__dirname, '../public/logo.svg');
const indexHtmlPath = fs.existsSync(path.join(__dirname, 'dist', 'index.html'))
  ? path.join(__dirname, 'dist', 'index.html')
  : path.join(__dirname, '../dist/index.html');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: false,
      webviewTag: true,
      preload: preloadPath
    },
    icon: iconPath,
    titleBarStyle: 'hiddenInset',
    show: false
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(indexHtmlPath);
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Security: Prevent new window creation
  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Only restrict main window navigation, allow webview for external sites
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    // Only prevent navigation for the main window, not for webviews
    if (contents === mainWindow.webContents) {
      const parsedUrl = new URL(navigationUrl);
      if (parsedUrl.origin !== 'http://localhost:5173' && parsedUrl.origin !== 'file://') {
        event.preventDefault();
      }
    }
    // Allow webviews (nested-frame) to navigate freely to external sites
  });
});