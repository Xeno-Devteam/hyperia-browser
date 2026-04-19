import { renderBrowser } from './App.js';

const root = document.querySelector('#app');
if (root) {
  renderBrowser(root);
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service worker registration is optional.
    });
  });
}
