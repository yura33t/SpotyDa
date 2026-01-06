
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const startApp = () => {
  const container = document.getElementById('root');
  const loader = document.getElementById('loader');
  
  if (container) {
    try {
      const root = createRoot(container);
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
      
      // Скрываем лоадер после начала рендеринга
      if (loader) {
        setTimeout(() => {
          loader.style.opacity = '0';
          setTimeout(() => loader.remove(), 500);
        }, 300);
      }
    } catch (err) {
      console.error("Rendering failed:", err);
    }
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
