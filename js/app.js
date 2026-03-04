/**
 * Main entry point — bootstraps the app.
 * Initializes storage, loads catalog, registers routes.
 */

import { storage } from './storage.js';
import { registerRoute, startRouter, navigate, getCurrentRoute } from './router.js';
import { loadCatalog } from './questions.js';
import { render as renderWelcome } from './screens/welcome.js';
import { render as renderPreparation } from './screens/preparation.js';
import { render as renderExamination } from './screens/examination.js';
import { render as renderSummary } from './screens/summary.js';
import { render as renderCompletion } from './screens/completion.js';
import { render as renderImpressum } from './screens/impressum.js';
import { render as renderDatenschutz } from './screens/datenschutz.js';
import { render as renderFaq } from './screens/faq.js';
import { render as renderPinSetup } from './screens/pin-setup.js';
import { showPinLock } from './screens/pin-lock.js';

async function init() {
  // Show loading state
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="min-h-screen flex items-center justify-center">
      <p class="text-stone-400 text-sm">Lädt...</p>
    </div>
  `;

  // Initialize storage and load catalog in parallel
  await Promise.all([
    storage.init(),
    loadCatalog(),
  ]);

  // If PIN is set, block until correct PIN is entered
  const pinHash = await storage.get('pinHash');
  if (pinHash) {
    await showPinLock(app, pinHash);
  }

  // Register routes
  registerRoute('/welcome', renderWelcome);
  registerRoute('/preparation', renderPreparation);
  registerRoute('/examination', renderExamination);
  registerRoute('/summary', renderSummary);
  registerRoute('/completion', renderCompletion);
  registerRoute('/impressum', renderImpressum);
  registerRoute('/datenschutz', renderDatenschutz);
  registerRoute('/faq', renderFaq);
  registerRoute('/pin-setup', renderPinSetup);

  // Start the router (must happen before any navigate calls)
  startRouter();

  // If no route is set, determine the correct starting screen
  const currentRoute = getCurrentRoute();
  if (currentRoute === '/welcome' && !window.location.hash) {
    const lifeState = await storage.get('lifeState');
    const sessionTimestamp = await storage.get('sessionTimestamp');
    if (lifeState && sessionTimestamp) {
      navigate('/examination');
    }
  }
}

// Prevent pinch-to-zoom (supplement to viewport meta tag)
document.addEventListener('touchmove', (e) => {
  if (e.touches.length > 1) e.preventDefault();
}, { passive: false });

// Register Service Worker for offline capability
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(err => {
    console.warn('Service Worker registration failed:', err);
  });
}

// Bootstrap
init().catch(err => {
  console.error('App initialization failed:', err);
  document.getElementById('app').innerHTML = `
    <div class="min-h-screen flex items-center justify-center p-6 text-center">
      <div>
        <p class="text-stone-800 font-medium mb-2">Die App konnte nicht geladen werden.</p>
        <p class="text-stone-500 text-sm">Bitte lade die Seite neu.</p>
      </div>
    </div>
  `;
});
