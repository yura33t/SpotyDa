
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const hideLoader = () => {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => loader.remove(), 500);
  }
};

const startApp = () => {
  const container = document.getElementById('root');

  if (container) {
    try {
      const root = createRoot(container);
      root.render(
        <React.StrictMode>
          <App onReady={hideLoader} />
        </React.StrictMode>
      );
    } catch (err) {
      console.error("Rendering failed:", err);
      hideLoader();
    }
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
