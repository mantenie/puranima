/**
 * Welcome / onboarding screen.
 * Shows privacy promise, life state selection, and start button.
 */

import { storage } from '../storage.js';
import { navigate } from '../router.js';
import { icons } from '../components/icons.js';
import { footerHtml, attachFooterListeners } from '../components/footer.js';
import { lockApp } from './pin-lock.js';

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
  const hasPin = !!(await storage.get('pinHash'));
  const sessionTimestamp = await storage.get('sessionTimestamp');
  const currentIndex = await storage.get('currentIndex') || 0;
  const hasActiveSession = savedLifeState && sessionTimestamp && currentIndex > 0;

  container.innerHTML = `
    <div class="screen-enter min-h-screen flex flex-col px-5 py-6 relative">

      <!-- Lock/PIN (top-right) -->
      <div class="absolute top-5 right-4">
        <button id="btn-lock"
                class="p-2 ${hasPin ? 'text-purple-600' : 'text-stone-300'} hover:text-stone-500 transition-colors"
                aria-label="${hasPin ? 'App sperren' : 'PIN festlegen'}">
          ${hasPin ? icons.lock : icons.lockOpen}
        </button>
        ${!hasPin ? `
          <div id="pin-tooltip"
               class="absolute right-0 top-full mt-1 bg-stone-800 text-white text-xs rounded-lg px-3 py-2
                      shadow-lg whitespace-nowrap opacity-0 transition-opacity duration-300 pointer-events-none">
            Schütze Deine Daten mit einem PIN
            <div class="absolute -top-1 right-3 w-2 h-2 bg-stone-800 rotate-45"></div>
          </div>
        ` : ''}
      </div>

      <!-- Logo & Title -->
      <header class="text-center pt-4 pb-6">
        <div class="inline-block">${icons.logo}</div>
        <h1 class="text-3xl font-bold text-stone-800 mt-3 tracking-tight">beichtbar</h1>
        <p class="text-stone-500 mt-1 text-sm">Gewissenserforschung</p>
      </header>

      <!-- Privacy Promise -->
      <div class="bg-purple-50 border border-purple-200 rounded-2xl p-4 mb-6">
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
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-stone-200 bg-white hover:border-stone-300'}"
              aria-pressed="${savedLifeState === opt.id}"
            >
              <span class="font-medium text-stone-800">${opt.label}</span>
              <span class="block text-xs text-stone-500 mt-0.5">${opt.desc}</span>
            </button>
          `).join('')}
        </div>
      </section>

      <!-- Action Buttons -->
      <footer class="pt-6 pb-2">
        ${hasActiveSession ? `
          <button id="btn-continue"
                  class="w-full py-4 rounded-xl bg-purple-700 text-white font-bold text-lg
                         hover:bg-purple-800 active:bg-purple-900 transition-colors mb-3">
            Weiterarbeiten
          </button>
          <button id="btn-start"
                  class="w-full py-3 rounded-xl bg-white text-purple-800 font-medium border border-purple-200
                         hover:bg-purple-50 active:bg-purple-100 transition-colors">
            Neu beginnen
          </button>
        ` : `
          <button id="btn-start"
                  class="w-full py-4 rounded-xl bg-purple-700 text-white font-bold text-lg
                         transition-opacity duration-150
                         disabled:opacity-30 disabled:cursor-not-allowed
                         hover:bg-purple-800 active:bg-purple-900"
                  ${!savedLifeState ? 'disabled' : ''}>
            Gewissenserforschung beginnen
          </button>
        `}

        <!-- FAQ Link -->
        <button id="btn-faq"
                class="w-full text-center text-sm font-medium text-purple-800 hover:text-purple-900 pt-3 transition-colors underline underline-offset-2">
          Was ist die Beichte? — Infos &amp; FAQ
        </button>
      </footer>

      ${footerHtml()}

    </div>
  `;

  // --- Event Listeners ---

  let selectedLifeState = savedLifeState;

  let activeSessionLifeState = hasActiveSession ? savedLifeState : null;

  container.querySelectorAll('[data-lifestate]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const previousLifeState = selectedLifeState;
      selectedLifeState = btn.dataset.lifestate;
      await storage.set('lifeState', selectedLifeState);

      // Update visual selection
      container.querySelectorAll('[data-lifestate]').forEach(b => {
        const isSelected = b.dataset.lifestate === selectedLifeState;
        b.classList.toggle('border-purple-500', isSelected);
        b.classList.toggle('bg-purple-50', isSelected);
        b.classList.toggle('border-stone-200', !isSelected);
        b.classList.toggle('bg-white', !isSelected);
        b.setAttribute('aria-pressed', isSelected);
      });

      // If life state changed to a different one, reset session data
      if (activeSessionLifeState && selectedLifeState !== activeSessionLifeState) {
        await storage.remove('answers');
        await storage.remove('currentIndex');
        await storage.remove('sessionTimestamp');
        activeSessionLifeState = null;
      }

      // Update action buttons: show/hide "Weiterarbeiten" dynamically
      const footer = container.querySelector('footer');
      const canContinue = selectedLifeState === activeSessionLifeState;

      footer.querySelector('#btn-continue')?.remove();
      const startBtn = footer.querySelector('#btn-start');

      if (canContinue) {
        // Re-add "Weiterarbeiten" button before start
        const contBtn = document.createElement('button');
        contBtn.id = 'btn-continue';
        contBtn.className = 'w-full py-4 rounded-xl bg-purple-700 text-white font-bold text-lg hover:bg-purple-800 active:bg-purple-900 transition-colors mb-3';
        contBtn.textContent = 'Weiterarbeiten';
        contBtn.addEventListener('click', () => navigate('/examination'));
        footer.insertBefore(contBtn, startBtn);
        // Make start button secondary
        startBtn.className = 'w-full py-3 rounded-xl bg-white text-purple-800 font-medium border border-purple-200 hover:bg-purple-50 active:bg-purple-100 transition-colors';
        startBtn.textContent = 'Neu beginnen';
      } else {
        // Primary start button
        startBtn.className = 'w-full py-4 rounded-xl bg-purple-700 text-white font-bold text-lg transition-opacity duration-150 hover:bg-purple-800 active:bg-purple-900';
        startBtn.textContent = 'Gewissenserforschung beginnen';
        startBtn.disabled = false;
      }
    });
  });

  // Continue existing session
  const continueBtn = container.querySelector('#btn-continue');
  if (continueBtn) {
    continueBtn.addEventListener('click', () => navigate('/examination'));
  }

  // Start new / begin examination
  container.querySelector('#btn-start').addEventListener('click', async () => {
    if (!selectedLifeState) return;
    navigate('/preparation');
  });

  container.querySelector('#btn-faq').addEventListener('click', () => navigate('/faq'));

  // Lock icon: instant-lock if PIN set, otherwise go to PIN setup
  container.querySelector('#btn-lock').addEventListener('click', async () => {
    if (hasPin) {
      await lockApp();
    } else {
      navigate('/pin-setup');
    }
  });

  attachFooterListeners(container);

  // Show tooltip for PIN icon if no PIN is set (auto-fade after 4s)
  const tooltip = container.querySelector('#pin-tooltip');
  if (tooltip) {
    setTimeout(() => { tooltip.style.opacity = '1'; }, 500);
    setTimeout(() => { tooltip.style.opacity = '0'; }, 4500);
  }
}
