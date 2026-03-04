/**
 * Preparation screen — shown after life state selection, before examination.
 * Displays the opening prayer and a brief explanation of how the app works.
 */

import { storage } from '../storage.js';
import { navigate } from '../router.js';
import { getPrayers } from '../questions.js';
import { icons } from '../components/icons.js';
import { escapeHtml } from '../utils.js';

export async function render(container) {
  const lifeState = await storage.get('lifeState');
  if (!lifeState) { navigate('/welcome'); return; }

  const prayers = getPrayers();

  container.innerHTML = `
    <div class="screen-enter min-h-screen flex flex-col px-5 py-6">

      <header class="flex items-center gap-3 mb-8">
        <button id="btn-back" class="p-2 -ml-2 text-stone-400 hover:text-stone-600"
                aria-label="Zurück">
          ${icons.arrowLeft}
        </button>
        <h1 class="text-xl font-bold text-stone-800">Vorbereitung</h1>
      </header>

      <main class="flex-1 flex flex-col justify-center">

        <!-- Opening Prayer -->
        <section class="text-center mb-10">
          <p class="text-xs font-semibold uppercase tracking-widest text-amber-700 mb-3">
            ${escapeHtml(prayers.opening.title)}
          </p>
          <p class="text-base text-stone-700 leading-relaxed italic max-w-sm mx-auto">
            ${escapeHtml(prayers.opening.text)}
          </p>
        </section>

        <!-- How it works -->
        <section class="bg-stone-50 rounded-2xl p-5 mb-8">
          <h2 class="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-4">
            So funktioniert's
          </h2>
          <ul class="space-y-3">
            <li class="flex gap-3 items-start">
              <span class="bg-amber-100 text-amber-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
              <p class="text-sm text-stone-700 leading-relaxed">
                <strong>Fragen beantworten</strong> — Du siehst eine Frage nach der anderen.
                Antworte ehrlich mit „Ja", „Nein" oder „Unsicher".
              </p>
            </li>
            <li class="flex gap-3 items-start">
              <span class="bg-amber-100 text-amber-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
              <p class="text-sm text-stone-700 leading-relaxed">
                <strong>Spickzettel</strong> — Am Ende erhältst Du eine übersichtliche Liste
                Deiner markierten Punkte — im Dark Mode, perfekt für den Beichtstuhl.
              </p>
            </li>
            <li class="flex gap-3 items-start">
              <span class="bg-amber-100 text-amber-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
              <p class="text-sm text-stone-700 leading-relaxed">
                <strong>Alles löschen</strong> — Nach der Beichte löschst Du alles
                mit einem Tap. Deine Daten verlassen nie Dein Gerät.
              </p>
            </li>
          </ul>
        </section>

      </main>

      <!-- Start Button -->
      <footer class="pt-2 pb-2">
        <button id="btn-start"
                class="w-full py-4 rounded-xl bg-amber-700 text-white font-bold text-lg
                       hover:bg-amber-800 active:bg-amber-900 transition-colors">
          Gewissenserforschung beginnen
        </button>
        <p class="text-center text-xs text-stone-400 mt-3">
          Du kannst jederzeit zur Zusammenfassung springen.
        </p>
      </footer>

    </div>
  `;

  container.querySelector('#btn-back').addEventListener('click', () => navigate('/welcome'));
  container.querySelector('#btn-start').addEventListener('click', async () => {
    await storage.set('currentIndex', 0);
    await storage.set('answers', {});
    await storage.set('sessionTimestamp', Date.now());
    navigate('/examination');
  });
}
