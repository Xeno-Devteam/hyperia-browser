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
};

const createElement = (tag, props = {}, children = []) => {
  const el = document.createElement(tag);
  Object.entries(props).forEach(([key, value]) => {
    if (key === 'className') el.className = value;
    else if (key.startsWith('on') && typeof value === 'function') el.addEventListener(key.slice(2).toLowerCase(), value);
    else el.setAttribute(key, value);
  });
  children.forEach((child) => el.append(child));
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

const navigate = (route) => {
  const cleanRoute = route.replace(/^https?:\/\//i, '').replace(/\/$/, '');
  const pageKey = cleanRoute || 'hyperia.local';
  if (state.history[state.index] !== pageKey) {
    state.history = state.history.slice(0, state.index + 1);
    state.history.push(pageKey);
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

let addressInput;
let contentTitle;
let contentSubtitle;
let contentBody;
let backButton;
let forwardButton;
let refreshButton;

const renderApp = () => {
  const page = getCurrentPage();

  updateAddressBar(addressInput);
  contentTitle.textContent = page.title;
  contentSubtitle.textContent = page.subtitle;
  contentBody.textContent = page.body;

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
      createElement('button', { className: 'icon-button', type: 'button', onClick: () => navigate('hyperia.local') }, ['Home']),
    ]),
  ]);

  const toolbar = createElement('div', { className: 'toolbar' });
  backButton = createElement('button', { className: 'tool-button', type: 'button', onClick: goBack }, ['◀']);
  forwardButton = createElement('button', { className: 'tool-button', type: 'button', onClick: goForward }, ['▶']);
  refreshButton = createElement('button', { className: 'tool-button', type: 'button', onClick: () => renderApp() }, ['⟳']);
  addressInput = createElement('input', { className: 'address-input', type: 'text', placeholder: 'https://hyperia.local', value: 'https://hyperia.local' });

  addressInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      navigate(addressInput.value.trim());
    }
  });

  toolbar.append(backButton, forwardButton, refreshButton, addressInput);

  const tabs = createElement('div', { className: 'tabs' }, [
    createElement('button', { className: 'tab active', type: 'button', onClick: () => navigate('hyperia.local') }, ['Demo']),
    createElement('button', { className: 'tab', type: 'button', onClick: () => navigate('hyperia.local/about') }, ['About']),
    createElement('button', { className: 'tab', type: 'button', onClick: () => navigate('hyperia.local/focus') }, ['Focus']),
    createElement('button', { className: 'tab add', type: 'button', onClick: () => navigate('hyperia.local') }, ['+']),
  ]);

  const content = createElement('div', { className: 'browser-content' }, [
    createElement('div', { className: 'content-card' }, [
      (contentTitle = createElement('h1', { className: 'content-title' })),
      (contentSubtitle = createElement('p', { className: 'content-subtitle' })),
      (contentBody = createElement('p', { className: 'content-body' })),
    ]),
  ]);

  app.append(titleBar, toolbar, tabs, content);
  root.innerHTML = '';
  root.append(app);
  renderApp();
};
