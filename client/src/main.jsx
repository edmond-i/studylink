import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { detectAndApplyTheme } from './theme';

// apply theme before React mounts so initial paint matches preference
if (typeof window !== 'undefined') {
  try {
    detectAndApplyTheme();
  } catch (e) {}
}

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((reg) => console.log('ServiceWorker registered', reg))
      .catch((err) => console.error('ServiceWorker registration failed', err));
  });
}

if (!import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
