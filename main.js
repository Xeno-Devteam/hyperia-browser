const { app, BrowserWindow, Menu, ipcMain, webContents } = require('electron');
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
let tabs = new Map(); // tabId -> { webContentsId, url, title, favicon }
let activeTabId = null;
let tabCounter = 0;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
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
    // Create initial tab
    createTab('https://hyperia.local');
  });

  // Security: Prevent new window creation
  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });
}

function createTab(url = 'https://hyperia.local') {
  const tabId = `tab-${++tabCounter}`;
  const webview = mainWindow.webContents;

  // For now, we'll simulate tabs by managing URLs
  // In a full implementation, you'd create separate webContents for each tab
  tabs.set(tabId, {
    id: tabId,
    url: url,
    title: 'Loading...',
    favicon: null,
    canGoBack: false,
    canGoForward: false
  });

  activeTabId = tabId;
  mainWindow.webContents.send('tab-created', tabs.get(tabId));
  return tabId;
}

function closeTab(tabId) {
  if (tabs.has(tabId)) {
    tabs.delete(tabId);
    if (activeTabId === tabId) {
      // Switch to another tab or create new one
      const remainingTabs = Array.from(tabs.keys());
      if (remainingTabs.length > 0) {
        activeTabId = remainingTabs[0];
      } else {
        createTab();
      }
    }
    mainWindow.webContents.send('tab-closed', tabId);
  }
}

function switchTab(tabId) {
  if (tabs.has(tabId)) {
    activeTabId = tabId;
    mainWindow.webContents.send('tab-switched', tabs.get(tabId));
  }
}

function updateTab(tabId, data) {
  if (tabs.has(tabId)) {
    const tab = tabs.get(tabId);
    Object.assign(tab, data);
    mainWindow.webContents.send('tab-update', tab);
  }
}

function navigateTab(tabId, url) {
  if (tabs.has(tabId)) {
    const tab = tabs.get(tabId);
    tab.url = url;
    tab.title = 'Loading...';
    tab.favicon = null;
    mainWindow.webContents.send('tab-update', tab);
  }
}

// IPC handlers
ipcMain.handle('create-tab', async (event, url) => {
  return createTab(url);
});

ipcMain.handle('close-tab', async (event, tabId) => {
  closeTab(tabId);
});

ipcMain.handle('switch-tab', async (event, tabId) => {
  switchTab(tabId);
});

ipcMain.handle('update-tab', async (event, tabId, data) => {
  updateTab(tabId, data);
});

ipcMain.handle('navigate-tab', async (event, tabId, url) => {
  navigateTab(tabId, url);
});

ipcMain.handle('go-back', async (event, tabId) => {
  // In a real implementation, this would call webContents.goBack()
  console.log('Go back for tab:', tabId);
});

ipcMain.handle('go-forward', async (event, tabId) => {
  // In a real implementation, this would call webContents.goForward()
  console.log('Go forward for tab:', tabId);
});

ipcMain.handle('reload', async (event, tabId) => {
  // In a real implementation, this would call webContents.reload()
  console.log('Reload tab:', tabId);
});

ipcMain.handle('check-security', async (event, url) => {
  // Basic security check implementation
  try {
    const domain = new URL(url).hostname;
    const suspiciousPatterns = [
      /fake/i, /phish/i, /malware/i, /virus/i, /hack/i,
      /free-money/i, /win-prize/i, /urgent/i, /account-suspended/i
    ];

    const isSuspicious = suspiciousPatterns.some(pattern => domain.match(pattern));
    const safeDomains = [
      'google.com', 'github.com', 'stackoverflow.com', 'wikipedia.org',
      'mozilla.org', 'apple.com', 'microsoft.com', 'amazon.com'
    ];
    const isKnownSafe = safeDomains.some(safe => domain.includes(safe));

    return {
      isSafe: !isSuspicious && (isKnownSafe || url.startsWith('https://')),
      riskLevel: isSuspicious ? 'high' : isKnownSafe ? 'low' : 'medium',
      warnings: isSuspicious ? ['Domain contains suspicious keywords'] : []
    };
  } catch (error) {
    return { isSafe: false, riskLevel: 'unknown', warnings: ['Unable to analyze URL'] };
  }
});

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