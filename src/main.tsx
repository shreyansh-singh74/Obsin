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

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
