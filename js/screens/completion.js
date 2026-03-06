/**
 * Completion screen — shown after data deletion.
 * Displays thanksgiving prayer, option to restart, and donation hint.
 */

import { navigate } from '../router.js';
import { getPrayers } from '../questions.js';
import { escapeHtml } from '../utils.js';

/**
 * Render the completion screen.
 * @param {HTMLElement} container
 */
export async function render(container) {
  const prayers = getPrayers();

  container.innerHTML = `
    <div class="screen-enter min-h-screen flex flex-col items-center justify-center px-6 py-8">

      <!-- Dove / Peace symbol -->
      <div class="text-5xl mb-6 opacity-80" aria-hidden="true">&#x1f54a;</div>

      <h1 class="text-2xl font-bold text-stone-800 mb-2 text-center">Gott segne Dich</h1>
      <p class="text-stone-500 text-center mb-8">
        Deine Beichte ist ein Geschenk der Gnade.
      </p>

      <!-- Thanksgiving Prayer -->
      <section class="max-w-sm text-center mb-10">
        <p class="text-xs font-semibold uppercase tracking-widest text-purple-700 mb-2">
          ${escapeHtml(prayers.thanksgiving.title)}
        </p>
        <p class="text-sm text-stone-600 leading-relaxed italic">
          ${escapeHtml(prayers.thanksgiving.text)}
        </p>
      </section>

      <!-- Restart Button -->
      <button id="btn-restart"
              class="px-10 py-4 rounded-xl bg-purple-700 text-white font-bold text-lg
                     hover:bg-purple-800 active:bg-purple-900 transition-colors mb-6">
        Neue Gewissenserforschung
      </button>

      <!-- Donation Hint -->
      <div class="max-w-sm bg-purple-50 border border-purple-200 rounded-2xl p-4 text-center">
        <p class="text-sm font-medium text-stone-700 mb-1">
          beichtbar ist kostenlos und werbefrei.
        </p>
        <p class="text-xs text-stone-500 leading-relaxed">
          Wenn Dir die App geholfen hat, freuen wir uns über eine kleine Spende
          zur Deckung der Serverkosten.
        </p>
      </div>

    </div>
  `;

  container.querySelector('#btn-restart').addEventListener('click', () => {
    // After panic button, all data is cleared. Go to welcome for fresh start.
    navigate('/welcome');
  });
}
