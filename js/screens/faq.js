/**
 * FAQ screen — important information about confession.
 * FAQ data is loaded from data/faq.json (shared with build-time HTML generation).
 */

import { navigate } from '../router.js';
import { icons } from '../components/icons.js';
import { footerHtml, attachFooterListeners } from '../components/footer.js';
import { headerActionsHtml, attachHeaderActions } from '../components/header-actions.js';
import { updateMeta } from '../meta.js';

/** @type {Array<{question: string, answer: string}>|null} */
let faqItems = null;

/** Load FAQ data (cached after first load). */
async function loadFaqData() {
  if (faqItems) return faqItems;
  const response = await fetch('/data/faq.json');
  faqItems = await response.json();
  return faqItems;
}

export async function render(container) {
  updateMeta({
    title: 'Häufige Fragen zur Beichte — beichtbar',
    description: 'Alles über die katholische Beichte: Ablauf, Vorbereitung, häufige Fragen. Was muss ich beichten? Wie oft? Was ist, wenn ich mich schäme?',
    path: '/faq',
  });

  const items = await loadFaqData();

  container.innerHTML = `
    <div class="screen-enter min-h-screen flex flex-col px-5 py-6">

      <header class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <a href="/" id="btn-back" class="p-2 -ml-2 text-stone-400 hover:text-stone-600"
                  aria-label="Zurück">
            ${icons.arrowLeft}
          </a>
          <h1 class="text-xl font-bold text-stone-800">Rund um die Beichte</h1>
        </div>
        ${headerActionsHtml()}
      </header>

      <p class="text-stone-600 text-sm mb-6 leading-relaxed">
        Alles, was Du über die Beichte wissen musst — ehrlich, praktisch und ohne Angst.
      </p>

      <main class="space-y-3">
        ${items.map((item, i) => `
          <details class="group bg-white rounded-xl border border-stone-200 overflow-hidden">
            <summary class="flex items-center justify-between px-4 py-3 cursor-pointer
                           hover:bg-stone-50 transition-colors">
              <span class="font-medium text-stone-800 text-sm pr-4">${item.question}</span>
              <span class="text-stone-400 shrink-0 transition-transform group-open:rotate-180">
                ${icons.chevronDown}
              </span>
            </summary>
            <div class="px-4 pb-4 pt-1">
              <p class="text-sm text-stone-600 leading-relaxed whitespace-pre-line">${item.answer.trim()}</p>
            </div>
          </details>
        `).join('')}
      </main>

      <footer class="mt-8 pt-4 border-t border-stone-200 text-center">
        <button id="btn-start-examination"
                class="w-full py-3 rounded-xl bg-purple-700 text-white font-semibold
                       hover:bg-purple-800 active:bg-purple-900 transition-colors">
          Gewissenserforschung starten
        </button>
      </footer>

      ${footerHtml()}

    </div>
  `;

  container.querySelector('#btn-back').addEventListener('click', (e) => {
    e.preventDefault();
    navigate('/welcome');
  });
  container.querySelector('#btn-start-examination').addEventListener('click', () => navigate('/welcome'));
  attachHeaderActions(container);
  attachFooterListeners(container);
}
