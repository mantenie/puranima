/**
 * Shared header action icons (Home + Lock) for all screens.
 * Provides instant app-lock and home navigation from anywhere.
 */

import { navigate } from '../router.js';
import { icons } from './icons.js';
import { lockApp } from '../screens/pin-lock.js';
import { storage } from '../storage.js';

/**
 * Generate HTML for header action buttons (right side).
 * @param {{ showHome?: boolean, showLock?: boolean, dark?: boolean }} opts
 */
export function headerActionsHtml({ showHome = true, showLock = true, dark = false } = {}) {
  const color = dark ? 'text-stone-400 hover:text-stone-200' : 'text-stone-400 hover:text-stone-600';
  return `
    <div class="flex items-center gap-1">
      ${showHome ? `
        <button data-action="home" class="p-2 ${color} transition-colors" aria-label="Startseite">
          ${icons.home}
        </button>
      ` : ''}
      ${showLock ? `
        <button data-action="lock" class="p-2 ${color} transition-colors" aria-label="App sperren">
          ${icons.lock}
        </button>
      ` : ''}
    </div>
  `;
}

/**
 * Attach event listeners for header action buttons.
 * @param {HTMLElement} container
 */
export function attachHeaderActions(container) {
  const homeBtn = container.querySelector('[data-action="home"]');
  if (homeBtn) {
    homeBtn.addEventListener('click', () => navigate('/welcome'));
  }

  const lockBtn = container.querySelector('[data-action="lock"]');
  if (lockBtn) {
    lockBtn.addEventListener('click', async () => {
      const pinHash = await storage.get('pinHash');
      if (pinHash) {
        await lockApp();
      } else {
        navigate('/pin-setup');
      }
    });
  }
}
