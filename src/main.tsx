import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import './index.css';

const storedTheme = localStorage.getItem('obsin_theme');
document.documentElement.setAttribute(
  'data-theme',
  storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : 'dark',
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js').catch((error: unknown) => {
      // Surface registration failures in dev; a broken SW silently kills
      // offline support and PWA installability.
      if (import.meta.env.DEV) console.error('[sw] registration failed', error);
    });
  });
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
