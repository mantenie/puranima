/**
 * Shared footer with legal links — displayed on all screens.
 */

import { navigate } from '../router.js';

/**
 * Return the footer HTML string.
 * @returns {string}
 */
export function footerHtml() {
  return `
    <nav class="app-footer flex items-center justify-center gap-4 pt-4 pb-2 text-xs text-stone-400">
      <button data-nav="/impressum" class="hover:text-stone-600 transition-colors">Impressum</button>
      <span class="text-stone-300">&middot;</span>
      <button data-nav="/datenschutz" class="hover:text-stone-600 transition-colors">Datenschutz</button>
      <span class="text-stone-300">&middot;</span>
      <a href="https://faithos.de" target="_blank" rel="noopener" class="hover:text-stone-600 transition-colors">FaithOS</a>
    </nav>
  `;
}

/**
 * Attach click listeners for footer navigation buttons inside a container.
 * @param {HTMLElement} container
 */
export function attachFooterListeners(container) {
  container.querySelectorAll('.app-footer [data-nav]').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.nav));
  });
}
