/**
 * Shared footer with legal links — displayed on all screens.
 */

import { navigate } from '../router.js';

/**
 * Return the footer HTML string.
 * Uses <a> tags for crawlable links to public pages.
 * @returns {string}
 */
export function footerHtml() {
  return `
    <nav class="app-footer flex items-center justify-center gap-4 pt-4 pb-2 text-xs text-stone-400">
      <a href="/impressum" class="hover:text-stone-600 transition-colors">Impressum</a>
      <span class="text-stone-300">&middot;</span>
      <a href="/datenschutz" class="hover:text-stone-600 transition-colors">Datenschutz</a>
      <span class="text-stone-300">&middot;</span>
      <a href="https://faithos.de" target="_blank" rel="noopener" class="hover:text-stone-600 transition-colors">FaithOS</a>
    </nav>
  `;
}

/**
 * Attach click listeners for footer navigation links inside a container.
 * Intercepts clicks for SPA navigation via pushState.
 * @param {HTMLElement} container
 */
export function attachFooterListeners(container) {
  container.querySelectorAll('.app-footer a[href^="/"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(link.getAttribute('href'));
    });
  });
}
