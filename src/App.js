// Browser state
const state = {
  tabs: [],
  activeTabId: null,
  history: new Map(), // tabId -> history array
  historyIndex: new Map() // tabId -> current index
};

const isElectron = typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes('electron');
const isMobileBrowser = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

// DOM elements
let addressInput;
let backButton;
let forwardButton;
let refreshButton;
let newTabButton;
let tabsContainer;
let contentContainer;
let webviewContainer;

const createElement = (tag, props = {}, children = []) => {
  const el = document.createElement(tag);
  Object.entries(props).forEach(([key, value]) => {
    if (key === 'className') el.className = value;
    else if (key === 'innerHTML') el.innerHTML = value;
    else if (key.startsWith('on') && typeof value === 'function') el.addEventListener(key.slice(2).toLowerCase(), value);
    else el.setAttribute(key, value);
  });
  children.forEach((child) => {
    if (typeof child === 'string') el.appendChild(document.createTextNode(child));
    else if (child) el.appendChild(child);
  });
  return el;
};

// Tab management
const createTabElement = (tab) => {
  const tabEl = createElement('div', {
    className: `tab ${tab.id === state.activeTabId ? 'active' : ''}`,
    'data-tab-id': tab.id
  });

  const favicon = createElement('img', {
    className: 'tab-favicon',
    src: tab.favicon || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSIjOWNhM2FmIi8+Cjwvc3ZnPgo=',
    alt: ''
  });

  const title = createElement('span', { className: 'tab-title' }, [tab.title || 'New Tab']);
  const closeBtn = createElement('button', {
    className: 'tab-close',
    type: 'button',
    onclick: (e) => {
      e.stopPropagation();
      closeTab(tab.id);
    }
  }, ['×']);

  tabEl.append(favicon, title, closeBtn);

  tabEl.addEventListener('click', () => switchToTab(tab.id));

  return tabEl;
};

const updateTabElement = (tab) => {
  const tabEl = document.querySelector(`[data-tab-id="${tab.id}"]`);
  if (tabEl) {
    const favicon = tabEl.querySelector('.tab-favicon');
    const title = tabEl.querySelector('.tab-title');

    if (favicon && tab.favicon) {
      favicon.src = tab.favicon;
    }
    if (title) {
      title.textContent = tab.title || 'New Tab';
    }

    tabEl.classList.toggle('active', tab.id === state.activeTabId);
  }
};

const addTab = (tab) => {
  state.tabs.push(tab);
  const tabEl = createTabElement(tab);
  tabsContainer.insertBefore(tabEl, newTabButton);
};

const removeTab = (tabId) => {
  state.tabs = state.tabs.filter(tab => tab.id !== tabId);
  const tabEl = document.querySelector(`[data-tab-id="${tabId}"]`);
  if (tabEl) {
    tabEl.remove();
  }
};

const switchToTab = (tabId) => {
  if (isElectron && window.electronAPI) {
    window.electronAPI.switchTab(tabId);
  } else {
    // Fallback for non-Electron environments
    state.activeTabId = tabId;
    renderTabs();
    renderContent();
  }
};

const closeTab = (tabId) => {
  if (isElectron && window.electronAPI) {
    window.electronAPI.closeTab(tabId);
  } else {
    // Fallback
    removeTab(tabId);
    if (state.tabs.length === 0) {
      createNewTab();
    } else if (state.activeTabId === tabId) {
      switchToTab(state.tabs[0].id);
    }
  }
};

const createNewTab = (url = 'https://hyperia.local') => {
  if (isElectron && window.electronAPI) {
    window.electronAPI.createTab(url);
  } else {
    // Fallback for non-Electron
    const tabId = `tab-${Date.now()}`;
    const tab = {
      id: tabId,
      url: url,
      title: 'New Tab',
      favicon: null
    };
    addTab(tab);
    switchToTab(tabId);
  }
};

// Navigation
const navigate = async (url) => {
  const cleanUrl = url.replace(/^https?:\/\//i, '').replace(/\/$/, '');
  const fullUrl = cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`;

  if (isElectron && window.electronAPI) {
    // Security check
    const securityResult = await window.electronAPI.checkSecurity(fullUrl);
    if (!securityResult.isSafe) {
      const proceed = confirm(`This website may be unsafe (${securityResult.riskLevel} risk).\n\nWarnings: ${securityResult.warnings.join(', ')}\n\nDo you want to continue?`);
      if (!proceed) return;
    }

    window.electronAPI.navigateTab(state.activeTabId, fullUrl);
  } else {
    // Fallback - just update the current tab
    const tab = state.tabs.find(t => t.id === state.activeTabId);
    if (tab) {
      tab.url = fullUrl;
      tab.title = 'Loading...';
      renderTabs();
      renderContent();
    }
  }
};

const goBack = () => {
  if (isElectron && window.electronAPI) {
    window.electronAPI.goBack(state.activeTabId);
  }
};

const goForward = () => {
  if (isElectron && window.electronAPI) {
    window.electronAPI.goForward(state.activeTabId);
  }
};

const reload = () => {
  if (isElectron && window.electronAPI) {
    window.electronAPI.reload(state.activeTabId);
  } else {
    renderContent();
  }
};

// Rendering
const renderTabs = () => {
  // Clear existing tabs except the new tab button
  const existingTabs = tabsContainer.querySelectorAll('.tab:not(.add)');
  existingTabs.forEach(tab => tab.remove());

  // Add current tabs
  state.tabs.forEach(tab => {
    const tabEl = createTabElement(tab);
    tabsContainer.insertBefore(tabEl, newTabButton);
  });
};

const renderContent = () => {
  const activeTab = state.tabs.find(tab => tab.id === state.activeTabId);
  if (!activeTab) return;

  // Update address bar
  if (addressInput) {
    addressInput.value = activeTab.url;
  }

  // Update navigation buttons
  if (backButton) backButton.disabled = !activeTab.canGoBack;
  if (forwardButton) forwardButton.disabled = !activeTab.canGoForward;

  // Clear content
  contentContainer.innerHTML = '';
  webviewContainer.innerHTML = '';

  if (activeTab.url.includes('hyperia.local')) {
    // Show demo content
    const page = getDemoPage(activeTab.url);
    const contentCard = createElement('div', { className: 'content-card' }, [
      createElement('h1', { className: 'content-title' }, [page.title]),
      createElement('p', { className: 'content-subtitle' }, [page.subtitle]),
      createElement('p', { className: 'content-body' }, [page.body])
    ]);
    contentContainer.append(contentCard);
  } else {
    // Show webview for external sites
    if (isElectron) {
      const webview = createElement('webview', {
        className: 'browser-webview',
        src: activeTab.url,
        allow: 'fullscreen *',
        webpreferences: 'contextIsolation=yes, nodeIntegration=no'
      });

      webview.addEventListener('dom-ready', () => {
        // Get title and favicon
        webview.executeJavaScript(`
          ({
            title: document.title,
            favicon: Array.from(document.querySelectorAll('link[rel*="icon"]'))
              .find(link => link.href)?.href || null
          })
        `).then(data => {
          if (isElectron && window.electronAPI) {
            window.electronAPI.updateTab(activeTab.id, {
              title: data.title,
              favicon: data.favicon
            });
          }
        }).catch(console.error);
      });

      webviewContainer.append(webview);
    } else {
      // Fallback for non-Electron
      const iframe = createElement('iframe', {
        className: 'browser-iframe',
        src: activeTab.url,
        allow: 'fullscreen *',
        sandbox: 'allow-same-origin allow-top-navigation allow-scripts allow-forms allow-popups allow-modals allow-presentation allow-pointer-lock'
      });
      webviewContainer.append(iframe);
    }
  }
};

const getDemoPage = (url) => {
  const pages = {
    'https://hyperia.local': {
      title: 'Hyperia Browser',
      subtitle: 'A clean, controlled browser demo experience.',
      body: 'This demo shows a minimal browser shell with responsive controls, quick navigation, and a calm interface designed for speed and focus.',
    },
    'https://hyperia.local/about': {
      title: 'About the Demo',
      subtitle: 'Fast and minimal browser UI.',
      body: 'The interface is intentionally kept simple: a title bar, toolbar, address entry, tabs, and content area. Everything is styled for clarity and fast scanning.',
    },
    'https://hyperia.local/focus': {
      title: 'Focus Mode',
      subtitle: 'Controlled browsing made clean.',
      body: 'Clean design means fewer distractions. The content area is a stable canvas with measured spacing, subtle transitions, and easy-to-scan typography.',
    },
  };

  return pages[url] || pages['https://hyperia.local'];
};

// Event listeners
const setupEventListeners = () => {
  if (isElectron && window.electronAPI) {
    window.electronAPI.onTabCreated((event, tab) => {
      addTab(tab);
      switchToTab(tab.id);
    });

    window.electronAPI.onTabClosed((event, tabId) => {
      removeTab(tabId);
    });

    window.electronAPI.onTabUpdate((event, tab) => {
      updateTabElement(tab);
      if (tab.id === state.activeTabId) {
        renderContent();
      }
    });
  } else {
    // For non-Electron environments, initialize with a demo tab
    console.log('Running in browser mode - limited functionality');
  }
};

export const renderBrowser = (root) => {
  const app = createElement('div', { className: 'browser-shell' });

  // Title bar
  const titleBar = createElement('div', { className: 'title-bar' }, [
    createElement('div', { className: 'window-controls' }, [
      createElement('span', { className: 'control red' }),
      createElement('span', { className: 'control yellow' }),
      createElement('span', { className: 'control green' }),
    ]),
    createElement('div', { className: 'window-title' }, [document.createTextNode('Hyperia Browser')]),
    createElement('div', { className: 'window-actions' }, [
      createElement('button', { className: 'icon-button', type: 'button', onClick: () => navigate('https://hyperia.local') }, [
        createElement('span', { innerHTML: '<?xml version="1.0" encoding="utf-8"?><!-- License: MIT. Made by michaelampr: https://github.com/michaelampr/jam --><svg fill="#000000" width="16px" height="16px" viewBox="-2 -2 24 24" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin" class="jam jam-home"><path d="M18 18V7.132l-8-4.8-8 4.8V18h4v-2.75a4 4 0 1 1 8 0V18h4zm-6 2v-4.75a2 2 0 1 0-4 0V20H2a2 2 0 0 1-2-2V7.132a2 2 0 0 1 .971-1.715l8-4.8a2 2 0 0 1 2.058 0l8 4.8A2 2 0 0 1 20 7.132V18a2 2 0 0 1-2 2h-6z"/></svg>' })
      ]),
    ]),
  ]);

  // Toolbar
  const toolbar = createElement('div', { className: 'toolbar' });
  backButton = createElement('button', { className: 'tool-button', type: 'button', onClick: goBack }, ['◀']);
  forwardButton = createElement('button', { className: 'tool-button', type: 'button', onClick: goForward }, ['▶']);
  refreshButton = createElement('button', { className: 'tool-button', type: 'button', onClick: reload }, ['⟳']);
  addressInput = createElement('input', { className: 'address-input', type: 'text', placeholder: 'https://hyperia.local' });

  addressInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      navigate(addressInput.value.trim());
    }
  });

  toolbar.append(backButton, forwardButton, refreshButton, addressInput);

  // Tabs
  tabsContainer = createElement('div', { className: 'tabs' });
  newTabButton = createElement('button', { className: 'tab add', type: 'button', onClick: () => createNewTab() }, ['+']);
  tabsContainer.append(newTabButton);

  // Content
  const browserContent = createElement('div', { className: 'browser-content' });
  contentContainer = createElement('div', { className: 'content-container' });
  webviewContainer = createElement('div', { className: 'webview-container' });
  browserContent.append(contentContainer, webviewContainer);

  // Beta warning
  const warningBanner = createElement('div', { className: 'beta-warning' }, [
    createElement('p', { className: 'beta-warning-text' }, ['*Project still in beta v.1.0. If you find a bug, please go to the GitHub page (https://github.com/Xeno-Devteam/hyperia-browser), go to Issues, and create a new issue explaining the error, and we will try our best to fix it.'])
  ]);

  app.append(titleBar, toolbar, tabsContainer, browserContent, warningBanner);
  root.innerHTML = '';
  root.append(app);

  setupEventListeners();

  // Initialize with a tab if none exist
  if (state.tabs.length === 0) {
    createNewTab();
  } else {
    renderTabs();
    renderContent();
  }
};
