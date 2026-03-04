/**
 * Summary screen — the "Spickzettel" (cheat sheet) for the confessional.
 * Dark mode, large text, categorized list with prayers.
 */

import { storage } from '../storage.js';
import { navigate } from '../router.js';
import { getFilteredQuestions, getCategories, getPrayers } from '../questions.js';
import { icons } from '../components/icons.js';
import { escapeHtml } from '../utils.js';
import { headerActionsHtml, attachHeaderActions } from '../components/header-actions.js';

/**
 * Render the summary screen.
 * @param {HTMLElement} container
 */
export async function render(container) {
  const lifeState = await storage.get('lifeState');
  if (!lifeState) { navigate('/welcome'); return; }

  const answers = await storage.get('answers') || {};
  const questions = getFilteredQuestions(lifeState);
  const categories = getCategories();
  const prayers = getPrayers();

  // Separate "yes" and "unsure" answers
  const yesQuestions = questions.filter(q => answers[q.id] === 'yes');
  const unsureQuestions = questions.filter(q => answers[q.id] === 'unsure');

  // Group "yes" questions by category
  const groupedYes = {};
  for (const q of yesQuestions) {
    if (!groupedYes[q.category]) groupedYes[q.category] = [];
    groupedYes[q.category].push(q);
  }

  const hasAnswers = yesQuestions.length > 0 || unsureQuestions.length > 0;

  container.innerHTML = `
    <div class="screen-enter min-h-screen bg-slate-950 text-stone-100 dark-scroll">

      <!-- Header -->
      <header class="flex items-center justify-between px-5 py-4 sticky top-0 bg-slate-950/95 backdrop-blur-sm z-10">
        <button id="btn-back" class="p-2 -ml-2 text-stone-400 hover:text-stone-200"
                aria-label="Zurück zur Erforschung">
          ${icons.arrowLeft}
        </button>
        <h1 class="text-base font-semibold text-stone-200">Dein Spickzettel</h1>
        ${headerActionsHtml({ dark: true })}
      </header>

      <main class="px-5 pb-8">

        <!-- Opening Prayer -->
        <section class="text-center mb-8 pt-2">
          <p class="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-2">
            ${escapeHtml(prayers.opening.title)}
          </p>
          <p class="text-sm text-stone-400 leading-relaxed italic max-w-sm mx-auto">
            ${escapeHtml(prayers.opening.text)}
          </p>
        </section>

        ${!hasAnswers ? `
          <!-- Empty state -->
          <div class="text-center py-12">
            <p class="text-stone-500 text-lg">Keine Punkte markiert.</p>
            <p class="text-stone-600 text-sm mt-2">
              Gehe zurück und beantworte die Fragen mit "Ja" oder "Unsicher".
            </p>
          </div>
        ` : ''}

        <!-- Marked Questions by Category -->
        ${categories
          .filter(cat => groupedYes[cat.id])
          .map(cat => `
            <section class="mb-6">
              <h2 class="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-2 pb-1 border-b border-slate-800">
                ${escapeHtml(cat.label)}
              </h2>
              <ul class="space-y-2">
                ${groupedYes[cat.id].map(q => `
                  <li class="flex gap-2 items-start">
                    <span class="text-amber-500 mt-0.5 shrink-0">&bull;</span>
                    <span class="text-lg leading-snug">${escapeHtml(stripTrailingQuestion(q.question))}</span>
                  </li>
                `).join('')}
              </ul>
            </section>
          `).join('')}

        <!-- Unsure Questions -->
        ${unsureQuestions.length > 0 ? `
          <section class="mb-8 mt-8">
            <h2 class="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-2 pb-1 border-b border-slate-800">
              Unsicher / Zum Nachdenken
            </h2>
            <ul class="space-y-2">
              ${unsureQuestions.map(q => `
                <li class="flex gap-2 items-start">
                  <span class="text-stone-600 mt-0.5 shrink-0">?</span>
                  <span class="text-base text-stone-400 leading-snug">${escapeHtml(stripTrailingQuestion(q.question))}</span>
                </li>
              `).join('')}
            </ul>
          </section>
        ` : ''}

        <!-- Contrition Prayer -->
        <section class="text-center mt-10 mb-10">
          <p class="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-2">
            ${escapeHtml(prayers.contrition.title)}
          </p>
          <p class="text-base text-stone-300 leading-relaxed italic max-w-sm mx-auto">
            ${escapeHtml(prayers.contrition.text)}
          </p>
        </section>

        <!-- Panic Button -->
        <button id="btn-panic"
                class="w-full py-5 rounded-2xl bg-red-950/60 border border-red-900 text-red-300
                       font-bold text-xl flex items-center justify-center gap-3
                       hover:bg-red-900/50 active:bg-red-900/70 transition-colors">
          <span class="inline-block">${icons.trash}</span>
          Alles löschen
        </button>

      </main>
    </div>
  `;

  // --- Event Listeners ---
  let panicTimer = null;

  container.querySelector('#btn-back').addEventListener('click', () => navigate('/examination'));
  attachHeaderActions(container);

  container.querySelector('#btn-panic').addEventListener('click', async () => {
    await storage.clearAll();

    // Brief visual confirmation (no confirm dialog per PRD)
    container.innerHTML = `
      <div class="min-h-screen bg-slate-950 flex items-center justify-center">
        <div class="text-center screen-enter">
          <div class="text-4xl mb-3 text-emerald-400">${icons.check}</div>
          <p class="text-xl text-stone-200 font-medium">Deine Daten wurden gelöscht.</p>
        </div>
      </div>
    `;

    panicTimer = setTimeout(() => navigate('/completion'), 1500);
  });

  // Return cleanup function to clear dangling timer
  return () => {
    if (panicTimer) clearTimeout(panicTimer);
  };
}

/** Remove trailing question mark for more compact display in summary. */
function stripTrailingQuestion(text) {
  return text.replace(/\?$/, '');
}
