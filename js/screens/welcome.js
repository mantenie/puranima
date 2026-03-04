/**
 * Welcome / onboarding screen.
 * Shows privacy promise, life state selection, and start button.
 */

import { storage } from '../storage.js';
import { navigate } from '../router.js';
import { icons } from '../components/icons.js';

const LIFE_STATE_OPTIONS = [
  { id: 'allgemein', label: 'Allgemein', desc: 'Kernfragen des Glaubens' },
  { id: 'single', label: 'Ledig', desc: 'Ledige Erwachsene' },
  { id: 'verheiratet', label: 'Verheiratet', desc: 'Eheleute und Familien' },
  { id: 'jugendlich', label: 'Jugendlich', desc: 'Firmkandidaten und junge Erwachsene' },
  { id: 'kinder', label: 'Kind', desc: 'Ab Erstkommunion' },
  { id: 'priester', label: 'Priester / Ordensleute', desc: 'Geweihte und Gottgeweihte' },
];

/**
 * Render the welcome screen.
 * @param {HTMLElement} container
 */
export async function render(container) {
  const savedLifeState = await storage.get('lifeState');

  container.innerHTML = `
    <div class="screen-enter min-h-screen flex flex-col px-5 py-6">

      <!-- Logo & Title -->
      <header class="text-center pt-4 pb-6">
        <div class="inline-block">${icons.logo}</div>
        <h1 class="text-3xl font-bold text-stone-800 mt-3 tracking-tight">Puranima</h1>
        <p class="text-stone-500 mt-1 text-sm">Gewissenserforschung</p>
      </header>

      <!-- Privacy Promise -->
      <div class="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
        <p class="text-sm text-stone-700 leading-relaxed">
          <strong class="text-stone-800">Deine Sünden verlassen Dein Gerät nie.</strong><br>
          Alle Daten bleiben ausschließlich lokal gespeichert.
          Kein Tracking, keine Cookies, keine Datenübertragung.
        </p>
      </div>

      <!-- Life State Selection -->
      <section class="flex-1">
        <h2 class="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">
          Wähle Deinen Lebensstand
        </h2>
        <div class="space-y-2" id="lifestate-options" role="group" aria-label="Lebensstand">
          ${LIFE_STATE_OPTIONS.map(opt => `
            <button
              data-lifestate="${opt.id}"
              class="w-full text-left px-4 py-3 rounded-xl border-2 transition-colors duration-150
                ${savedLifeState === opt.id
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-stone-200 bg-white hover:border-stone-300'}"
              aria-pressed="${savedLifeState === opt.id}"
            >
              <span class="font-medium text-stone-800">${opt.label}</span>
              <span class="block text-xs text-stone-500 mt-0.5">${opt.desc}</span>
            </button>
          `).join('')}
        </div>
      </section>

      <!-- Start Button -->
      <footer class="pt-6 pb-2">
        <button
          id="btn-start"
          class="w-full py-4 rounded-xl bg-amber-700 text-white font-bold text-lg
                 transition-opacity duration-150
                 disabled:opacity-30 disabled:cursor-not-allowed
                 hover:bg-amber-800 active:bg-amber-900"
          ${!savedLifeState ? 'disabled' : ''}
        >
          Gewissenserforschung beginnen
        </button>
      </footer>

    </div>
  `;

  // --- Event Listeners ---

  let selectedLifeState = savedLifeState;

  container.querySelectorAll('[data-lifestate]').forEach(btn => {
    btn.addEventListener('click', async () => {
      selectedLifeState = btn.dataset.lifestate;
      await storage.set('lifeState', selectedLifeState);

      // Update visual selection
      container.querySelectorAll('[data-lifestate]').forEach(b => {
        const isSelected = b.dataset.lifestate === selectedLifeState;
        b.classList.toggle('border-amber-500', isSelected);
        b.classList.toggle('bg-amber-50', isSelected);
        b.classList.toggle('border-stone-200', !isSelected);
        b.classList.toggle('bg-white', !isSelected);
        b.setAttribute('aria-pressed', isSelected);
      });

      container.querySelector('#btn-start').disabled = false;
    });
  });

  container.querySelector('#btn-start').addEventListener('click', async () => {
    if (!selectedLifeState) return;
    await storage.set('currentIndex', 0);
    await storage.set('answers', {});
    await storage.set('sessionTimestamp', Date.now());
    navigate('/examination');
  });
}
