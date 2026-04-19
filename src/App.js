// Basic security check - in a real implementation, this would use a service like Google Safe Browsing
const checkWebsiteSecurity = async (url) => {
  try {
    // For demo purposes, we'll do basic checks
    const domain = new URL(url).hostname;

    // Check for known suspicious patterns
    const suspiciousPatterns = [
      /fake/i, /phish/i, /malware/i, /virus/i, /hack/i,
      /free-money/i, /win-prize/i, /urgent/i, /account-suspended/i
    ];

    const isSuspicious = suspiciousPatterns.some(pattern => domain.match(pattern));

    // Check if it's a known safe domain (very basic list)
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
};

const pages = {
  'hyperia.local': {
    title: 'Hyperia Browser',
    subtitle: 'A clean, controlled browser demo experience.',
    body: 'This demo shows a minimal browser shell with responsive controls, quick navigation, and a calm interface designed for speed and focus.',
  },
  'hyperia.local/about': {
    title: 'About the Demo',
    subtitle: 'Fast and minimal browser UI.',
    body: 'The interface is intentionally kept simple: a title bar, toolbar, address entry, tabs, and content area. Everything is styled for clarity and fast scanning.',
  },
  'hyperia.local/focus': {
    title: 'Focus Mode',
    subtitle: 'Controlled browsing made clean.',
    body: 'Clean design means fewer distractions. The content area is a stable canvas with measured spacing, subtle transitions, and easy-to-scan typography.',
  },
};

const state = {
  history: ['hyperia.local'],
  index: 0,
  iframeMode: false,
};

const isElectron = typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes('electron');

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

const getCurrentPage = () => pages[state.history[state.index]] || {
  title: 'Page not found',
  subtitle: 'Use the address bar for a controlled demo route.',
  body: 'Try typing hyperia.local, hyperia.local/about, or hyperia.local/focus.',
};

const updateAddressBar = (input) => {
  input.value = `https://${state.history[state.index]}`;
};

const navigate = async (route) => {
  const cleanRoute = route.replace(/^https?:\/\//i, '').replace(/\/$/, '');
  const fullUrl = cleanRoute.startsWith('http') ? cleanRoute : `https://${cleanRoute}`;

  // For demo pages, use the old logic
  if (fullUrl.includes('hyperia.local')) {
    const pageKey = cleanRoute || 'hyperia.local';
    if (state.history[state.index] !== pageKey) {
      state.history = state.history.slice(0, state.index + 1);
      state.history.push(pageKey);
      state.index = state.history.length - 1;
    }
    renderApp();
    return;
  }

  // Security check for real websites
  const securityResult = await checkWebsiteSecurity(fullUrl);
  if (!securityResult.isSafe) {
    const proceed = confirm(`This website may be unsafe (${securityResult.riskLevel} risk).\n\nWarnings: ${securityResult.warnings.join(', ')}\n\nPlease be careful with what you do on this site, and do not enter any personal information (like bank info, ID, etc.) on this site.\n\nDo you want to continue?`);
    if (!proceed) return;
  }

  // For real websites, load in iframe
  // Update history
  if (state.history[state.index] !== fullUrl) {
    state.history = state.history.slice(0, state.index + 1);
    state.history.push(fullUrl);
    state.index = state.history.length - 1;
  }
  renderApp();
};

const goBack = () => {
  if (state.index > 0) {
    state.index -= 1;
    renderApp();
  }
};

const goForward = () => {
  if (state.index < state.history.length - 1) {
    state.index += 1;
    renderApp();
  }
};

const openCurrentExternally = () => {
  const currentUrl = state.history[state.index];
  if (!currentUrl.includes('hyperia.local')) {
    window.open(currentUrl, '_blank', 'noopener,noreferrer');
  }
};

let addressInput;
let contentTitle;
let contentSubtitle;
let contentBody;
let backButton;
let forwardButton;
let refreshButton;
let externalButton;
let contentIframe;
let contentContainer;
let iframeFallback;

const renderApp = () => {
  const currentUrl = state.history[state.index];
  updateAddressBar(addressInput);

  if (currentUrl.includes('hyperia.local')) {
    // Show demo content
    const page = getCurrentPage();
    contentTitle.textContent = page.title;
    contentSubtitle.textContent = page.subtitle;
    contentBody.textContent = page.body;
    contentContainer.style.display = 'block';
    if (contentIframe) contentIframe.style.display = 'none';
    if (iframeFallback) iframeFallback.style.display = 'none';
    if (externalButton) externalButton.disabled = true;
  } else {
    // Show embedded content for real websites
    if (contentIframe) {
      contentIframe.src = currentUrl;
      contentIframe.style.display = 'block';
    }
    contentContainer.style.display = 'none';
    if (iframeFallback) iframeFallback.style.display = 'none';
    if (externalButton) externalButton.disabled = false;
  }

  backButton.disabled = state.index === 0;
  forwardButton.disabled = state.index >= state.history.length - 1;
};

export const renderBrowser = (root) => {
  const app = createElement('div', { className: 'browser-shell' });

  const titleBar = createElement('div', { className: 'title-bar' }, [
    createElement('div', { className: 'window-controls' }, [
      createElement('span', { className: 'control red' }),
      createElement('span', { className: 'control yellow' }),
      createElement('span', { className: 'control green' }),
    ]),
    createElement('div', { className: 'window-title' }, [document.createTextNode('Hyperia Browser Demo')]),
    createElement('div', { className: 'window-actions' }, [
      createElement('button', { className: 'icon-button', type: 'button', onClick: () => navigate('hyperia.local') }, [
        createElement('span', { innerHTML: '<?xml version="1.0" encoding="utf-8"?><!-- License: MIT. Made by michaelampr: https://github.com/michaelampr/jam --><svg fill="#000000" width="16px" height="16px" viewBox="-2 -2 24 24" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin" class="jam jam-home"><path d="M18 18V7.132l-8-4.8-8 4.8V18h4v-2.75a4 4 0 1 1 8 0V18h4zm-6 2v-4.75a2 2 0 1 0-4 0V20H2a2 2 0 0 1-2-2V7.132a2 2 0 0 1 .971-1.715l8-4.8a2 2 0 0 1 2.058 0l8 4.8A2 2 0 0 1 20 7.132V18a2 2 0 0 1-2 2h-6z"/></svg>' })
      ]),
    ]),
  ]);

  const toolbar = createElement('div', { className: 'toolbar' });
  backButton = createElement('button', { className: 'tool-button', type: 'button', onClick: goBack }, ['◀']);
  forwardButton = createElement('button', { className: 'tool-button', type: 'button', onClick: goForward }, ['▶']);
  refreshButton = createElement('button', { className: 'tool-button', type: 'button', onClick: () => renderApp() }, ['⟳']);
  externalButton = createElement('button', { className: 'tool-button', type: 'button', onClick: openCurrentExternally }, ['↗']);
  addressInput = createElement('input', { className: 'address-input', type: 'text', placeholder: 'https://hyperia.local', value: 'https://hyperia.local' });

  addressInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      navigate(addressInput.value.trim());
    }
  });

  toolbar.append(backButton, forwardButton, refreshButton, externalButton, addressInput);

  const tabs = createElement('div', { className: 'tabs' }, [
    createElement('button', { className: 'tab active', type: 'button', onClick: () => navigate('hyperia.local') }, ['Demo']),
    createElement('button', { className: 'tab', type: 'button', onClick: () => navigate('hyperia.local/about') }, ['About']),
    createElement('button', { className: 'tab', type: 'button', onClick: () => navigate('hyperia.local/focus') }, ['Focus']),
    createElement('button', { className: 'tab add', type: 'button', onClick: () => navigate('hyperia.local') }, ['+']),
  ]);

  const contentIframeTag = isElectron ? 'webview' : 'iframe';
  const content = createElement('div', { className: 'browser-content' }, [
    (contentContainer = createElement('div', { className: 'content-card' }, [
      (contentTitle = createElement('h1', { className: 'content-title' })),
      (contentSubtitle = createElement('p', { className: 'content-subtitle' })),
      (contentBody = createElement('p', { className: 'content-body' })),
    ])),
    (contentIframe = createElement(contentIframeTag, {
      className: 'browser-iframe',
      style: 'display: none; width: 100%; border: none;',
      allow: 'fullscreen',
      ...(isElectron ? { webpreferences: 'webSecurity=no' } : {})
    })),
    (iframeFallback = createElement('div', { className: 'iframe-fallback' }, [
      createElement('small', { className: 'iframe-fallback-text' }, ['If the page doesn\'t load, try the ↗ button to open externally.'])
    ]))
  ]);

  const warningBanner = createElement('div', { className: 'beta-warning' }, [
    createElement('p', { className: 'beta-warning-text' }, ['*Project still in beta v.1.0. If you find a bug, please go to the GitHub page (https://github.com/Xeno-Devteam/hyperia-browser), go to Issues, and create a new issue explaining the error, and we will try our best to fix it.'])
  ]);

  app.append(titleBar, toolbar, tabs, content, warningBanner);
  root.innerHTML = '';
  root.append(app);

  if (contentIframe && iframeFallback) {
    if (isElectron) {
      contentIframe.addEventListener('dom-ready', () => {
        iframeFallback.style.display = 'none';
      });
      contentIframe.addEventListener('did-fail-load', () => {
        iframeFallback.style.display = 'block';
      });
    } else {
      contentIframe.addEventListener('load', () => {
        iframeFallback.style.display = 'none';
      });
      contentIframe.addEventListener('error', () => {
        iframeFallback.style.display = 'block';
      });
    }
  }

  renderApp();
};
