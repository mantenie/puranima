/**
 * Examination screen — card-based question flow.
 * Shows one question at a time with Ja / Nein / Unsicher buttons.
 */

import { storage } from '../storage.js';
import { navigate } from '../router.js';
import { getFilteredQuestions, getCategories } from '../questions.js';
import { icons } from '../components/icons.js';
import { escapeHtml } from '../utils.js';
import { headerActionsHtml, attachHeaderActions } from '../components/header-actions.js';

/**
 * Render the examination screen.
 * @param {HTMLElement} container
 */
export async function render(container) {
  const lifeState = await storage.get('lifeState');
  if (!lifeState) { navigate('/welcome'); return; }

  const questions = getFilteredQuestions(lifeState);
  const categories = getCategories();
  const categoryMap = Object.fromEntries(categories.map(c => [c.id, c.label]));
  const answers = await storage.get('answers') || {};
  let currentIndex = await storage.get('currentIndex') || 0;

  // Guard against out-of-bounds index (e.g. after catalog update)
  // Allow questions.length for the notes card (shown after all questions)
  if (currentIndex > questions.length) currentIndex = 0;

  // Set session timestamp if not already set
  if (!(await storage.get('sessionTimestamp'))) {
    await storage.set('sessionTimestamp', Date.now());
  }

  async function renderNotesCard() {
    const savedNotes = await storage.get('notes') || '';

    container.innerHTML = `
      <div class="screen-enter min-h-screen flex flex-col bg-white">

        <!-- Header -->
        <header class="flex items-center justify-between px-4 py-3 border-b border-stone-100">
          <button id="btn-back" class="p-2 -ml-2 text-stone-400 hover:text-stone-600"
                  aria-label="Zurück">
            ${icons.arrowLeft}
          </button>
          <span class="text-sm font-medium text-stone-400">Notizen</span>
          <div class="flex items-center">
            ${headerActionsHtml({ showHome: true, showLock: true })}
          </div>
        </header>

        <!-- Notes Content -->
        <main class="flex-1 px-6 pt-10 pb-6 overflow-y-auto">
          <p class="text-xs font-semibold uppercase tracking-widest text-purple-700 mb-3">
            Persönliche Notizen
          </p>
          <p class="text-sm text-stone-400 mb-6">
            Weitere Gedanken, Erinnerungen oder Vorsätze für die Beichte
          </p>
          <textarea id="notes-input"
                    class="w-full rounded-xl border border-stone-200 bg-stone-50 p-4 text-stone-800
                           text-base leading-relaxed resize-none focus:outline-none focus:border-purple-400
                           focus:ring-1 focus:ring-purple-400"
                    rows="5"
                    placeholder="z.B. Vorsätze, Umstände, Häufigkeit...">${escapeHtml(savedNotes)}</textarea>
        </main>

        <!-- Action Button -->
        <footer class="px-6 pb-6 space-y-3">
          <button id="btn-to-summary"
                  class="w-full py-4 rounded-xl bg-purple-700 text-white font-semibold text-lg
                         hover:bg-purple-800 active:bg-purple-900 transition-colors">
            Zum Spickzettel
          </button>

          <!-- Progress Bar (100%) -->
          <div class="pt-2" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"
               aria-label="Alle Fragen beantwortet">
            <div class="h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div class="h-full bg-purple-600 rounded-full" style="width: 100%"></div>
            </div>
          </div>
        </footer>

      </div>
    `;

    container.querySelector('#btn-back').addEventListener('click', () => {
      currentIndex = questions.length - 1;
      storage.set('currentIndex', currentIndex);
      renderCard();
    });
    container.querySelector('#btn-to-summary').addEventListener('click', async () => {
      const notes = container.querySelector('#notes-input').value.trim();
      if (notes) {
        await storage.set('notes', notes);
      } else {
        await storage.remove('notes');
      }
      navigate('/summary');
    });
    attachHeaderActions(container);
  }

  function renderCard() {
    if (currentIndex >= questions.length) {
      renderNotesCard();
      return;
    }

    const q = questions[currentIndex];
    const categoryLabel = categoryMap[q.category] || q.category;
    const progress = Math.round(((currentIndex + 1) / questions.length) * 100);
    const existingAnswer = answers[q.id];

    container.innerHTML = `
      <div class="screen-enter min-h-screen flex flex-col bg-white">

        <!-- Header -->
        <header class="flex items-center justify-between px-4 py-3 border-b border-stone-100">
          <button id="btn-back" class="p-2 -ml-2 text-stone-400 hover:text-stone-600"
                  aria-label="Zurück">
            ${icons.arrowLeft}
          </button>
          <span class="text-sm font-medium text-stone-400">
            ${currentIndex + 1} / ${questions.length}
          </span>
          <div class="flex items-center">
            <button id="btn-to-summary" class="p-2 text-stone-400 hover:text-stone-600"
                    aria-label="Zur Zusammenfassung">
              ${icons.list}
            </button>
            ${headerActionsHtml({ showHome: true, showLock: true })}
          </div>
        </header>

        <!-- Card Content -->
        <main class="flex-1 px-6 pt-10 pb-6 overflow-y-auto" aria-live="polite">

          <!-- Category Label -->
          <p class="text-xs font-semibold uppercase tracking-widest text-purple-700 mb-3">
            ${escapeHtml(categoryLabel)}
          </p>

          <!-- Subcategory -->
          <p class="text-xs text-stone-400 mb-4">${escapeHtml(q.subcategory)}</p>

          <!-- Question -->
          <p class="text-xl font-medium text-stone-800 leading-relaxed mb-4">
            ${escapeHtml(q.question)}
          </p>

          <!-- Severity indicator intentionally hidden -->

          <!-- Explanation (expandable) -->
          ${q.explanation ? `
            <details class="mb-4 group">
              <summary class="text-sm text-stone-400 cursor-pointer flex items-center gap-1
                              hover:text-stone-600 transition-colors">
                <span>Theologische Erklärung</span>
                <span class="transition-transform group-open:rotate-180">${icons.chevronDown}</span>
              </summary>
              <p class="mt-2 text-sm text-stone-600 leading-relaxed pl-0.5">
                ${escapeHtml(q.explanation)}
              </p>
            </details>
          ` : ''}

          <!-- Previous answer indicator -->
          ${existingAnswer ? `
            <p class="text-xs text-stone-400 italic">
              Bereits beantwortet: ${existingAnswer === 'yes' ? 'Ja' : 'Unsicher'}
            </p>
          ` : ''}

        </main>

        <!-- Action Buttons -->
        <footer class="px-6 pb-6 space-y-3">
          <button id="btn-yes"
                  class="w-full py-4 rounded-xl bg-purple-700 text-white font-semibold text-lg
                         hover:bg-purple-800 active:bg-purple-900 transition-colors">
            Ja, trifft zu
          </button>

          <div class="flex gap-3">
            <button id="btn-no"
                    class="flex-1 py-3.5 rounded-xl bg-stone-100 text-stone-600 font-medium
                           hover:bg-stone-200 active:bg-stone-300 transition-colors">
              Nein
            </button>
            <button id="btn-unsure"
                    class="flex-1 py-3.5 rounded-xl bg-purple-50 text-purple-800 font-medium border border-purple-200
                           hover:bg-purple-100 active:bg-purple-200 transition-colors">
              Unsicher
            </button>
          </div>

          <!-- Progress Bar -->
          <div class="pt-2" role="progressbar" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"
               aria-label="Fortschritt: ${currentIndex + 1} von ${questions.length} Fragen">
            <div class="h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div class="h-full bg-purple-600 rounded-full transition-all duration-300 ease-out"
                   style="width: ${progress}%"></div>
            </div>
          </div>

          <!-- Jump to Summary -->
          <button id="btn-summary-link"
                  class="w-full text-center text-sm text-stone-400 hover:text-purple-700 pt-1 transition-colors">
            Zur Zusammenfassung springen
          </button>

          <!-- Keyboard hints (desktop only) -->
          <p class="hidden md:block text-center text-xs text-stone-300 pt-1">
            Tastatur: <kbd class="bg-stone-100 rounded px-1">1</kbd> Ja &nbsp;
            <kbd class="bg-stone-100 rounded px-1">2</kbd> Nein &nbsp;
            <kbd class="bg-stone-100 rounded px-1">3</kbd> Unsicher &nbsp;
            <kbd class="bg-stone-100 rounded px-1">←</kbd> Zurück
          </p>
        </footer>

      </div>
    `;

    // --- Event Listeners ---
    container.querySelector('#btn-yes').addEventListener('click', () => handleAnswer('yes'));
    container.querySelector('#btn-no').addEventListener('click', () => handleAnswer('no'));
    container.querySelector('#btn-unsure').addEventListener('click', () => handleAnswer('unsure'));
    container.querySelector('#btn-back').addEventListener('click', goBack);
    container.querySelector('#btn-to-summary').addEventListener('click', () => navigate('/summary'));
    container.querySelector('#btn-summary-link').addEventListener('click', () => navigate('/summary'));
    attachHeaderActions(container);
  }

  async function handleAnswer(answer) {
    if (answer === 'no') {
      // Remove any previous answer for this question
      delete answers[questions[currentIndex].id];
    } else {
      answers[questions[currentIndex].id] = answer;
    }
    await storage.set('answers', answers);

    currentIndex++;
    await storage.set('currentIndex', currentIndex);

    renderCard();
  }

  async function goBack() {
    if (currentIndex > 0) {
      currentIndex--;
      await storage.set('currentIndex', currentIndex);
      renderCard();
    } else {
      navigate('/welcome');
    }
  }

  // Handle keyboard navigation
  function onKeyDown(e) {
    // Don't fire in text inputs (notes card)
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
    // Don't fire on notes card (after all questions)
    if (currentIndex >= questions.length) return;

    if (e.key === 'ArrowLeft') {
      goBack();
    } else if (e.key === '1') {
      handleAnswer('yes');
    } else if (e.key === '2' || e.key === 'ArrowRight') {
      handleAnswer('no');
    } else if (e.key === '3') {
      handleAnswer('unsure');
    }
  }

  document.addEventListener('keydown', onKeyDown);
  renderCard();

  // Return cleanup function to remove keyboard listener
  return () => document.removeEventListener('keydown', onKeyDown);
}
