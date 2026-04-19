// Preload script - runs before any web content loads
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Tab management
  createTab: (url) => ipcRenderer.invoke('create-tab', url),
  closeTab: (tabId) => ipcRenderer.invoke('close-tab', tabId),
  switchTab: (tabId) => ipcRenderer.invoke('switch-tab', tabId),
  updateTab: (tabId, data) => ipcRenderer.invoke('update-tab', tabId, data),

  // Webview events
  onTabUpdate: (callback) => ipcRenderer.on('tab-update', callback),
  onTabCreated: (callback) => ipcRenderer.on('tab-created', callback),
  onTabClosed: (callback) => ipcRenderer.on('tab-closed', callback),

  // Navigation
  navigateTab: (tabId, url) => ipcRenderer.invoke('navigate-tab', tabId, url),
  goBack: (tabId) => ipcRenderer.invoke('go-back', tabId),
  goForward: (tabId) => ipcRenderer.invoke('go-forward', tabId),
  reload: (tabId) => ipcRenderer.invoke('reload', tabId),

  // Security check
  checkSecurity: (url) => ipcRenderer.invoke('check-security', url),

  // Remove listeners
  removeAllListeners: (event) => ipcRenderer.removeAllListeners(event)
});

console.log('Preload script loaded');
