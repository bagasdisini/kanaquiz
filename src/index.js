import React from 'react';
import ReactDOM from 'react-dom';
import './assets/stylesheets/bootstrap.min.css';
import App from './components/App/App';

if (process.env.NODE_ENV !== 'production' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister();
    });
  });

  if ('caches' in window) {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        caches.delete(cacheName);
      });
    });
  }
}

if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    const updateButton = document.querySelector("#app-update");

    const showUpdatePrompt = (waitingWorker) => {
      updateButton.classList.add("show");
      updateButton.onclick = () => {
        waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      };
    };

    let isRefreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (isRefreshing) {
        return;
      }

      isRefreshing = true;
      window.location.reload();
    });

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');

      if (registration.waiting) {
        showUpdatePrompt(registration.waiting);
      }

      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing;

        if (!installingWorker) {
          return;
        }

        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdatePrompt(installingWorker);
          }
        });
      });
    } catch (error) {
      console.error('Service worker registration failed', error);
    }
  });
}

let appEl = document.getElementById('app');
if (!appEl) // in case of old index.html in cache
  appEl = document.querySelector('.app');

ReactDOM.render(<App />, appEl);
