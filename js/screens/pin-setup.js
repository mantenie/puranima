/**
 * PIN setup screen — set, change, or remove a PIN.
 * Accessible from the welcome screen via the lock icon.
 */

import { storage } from '../storage.js';
import { navigate } from '../router.js';
import { icons } from '../components/icons.js';
import { hashPin, verifyPin, dotsHtml, numpadHtml, attachNumpad } from '../pin.js';
import { headerActionsHtml, attachHeaderActions } from '../components/header-actions.js';

/**
 * Render the PIN setup screen.
 * @param {HTMLElement} container
 */
export async function render(container) {
  const existingHash = await storage.get('pinHash');

  // State: 'verify' → 'choose' | 'enter' → 'confirm'
  let step = existingHash ? 'verify' : 'enter';
  let digits = [];
  let newPin = '';
  let message = '';
  let messageColor = 'text-stone-400';

  function getStepConfig() {
    switch (step) {
      case 'verify':
        return { title: 'Aktuellen PIN eingeben', subtitle: '' };
      case 'choose':
        return { title: 'PIN-Einstellungen', subtitle: '' };
      case 'enter':
        return {
          title: existingHash ? 'Neuen PIN festlegen' : 'PIN festlegen',
          subtitle: 'Wähle einen 4-stelligen PIN',
        };
      case 'confirm':
        return { title: 'PIN bestätigen', subtitle: 'Bitte erneut eingeben' };
      default:
        return { title: '', subtitle: '' };
    }
  }

  function renderStep() {
    const config = getStepConfig();

    if (step === 'choose') {
      container.innerHTML = `
        <div class="screen-enter min-h-screen flex flex-col px-5 py-6">
          <header class="flex items-center justify-between mb-8">
            <div class="flex items-center gap-3">
              <button id="btn-back" class="p-2 -ml-2 text-stone-400 hover:text-stone-600 transition-colors"
                      aria-label="Zurück">
                ${icons.arrowLeft}
              </button>
              <h1 class="text-xl font-bold text-stone-800">${config.title}</h1>
            </div>
            ${headerActionsHtml({ showLock: false })}
          </header>

          <div class="flex-1 flex flex-col items-center justify-center gap-4">
            <div class="text-amber-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <p class="text-stone-600 text-sm text-center mb-4">Dein PIN ist aktiv.</p>

            <button id="btn-change-pin"
                    class="w-full max-w-xs py-3.5 rounded-xl bg-amber-700 text-white font-semibold
                           hover:bg-amber-800 active:bg-amber-900 transition-colors">
              PIN ändern
            </button>
            <button id="btn-remove-pin"
                    class="w-full max-w-xs py-3.5 rounded-xl bg-white text-red-600 font-medium border border-red-200
                           hover:bg-red-50 active:bg-red-100 transition-colors">
              PIN entfernen
            </button>
          </div>
        </div>
      `;

      container.querySelector('#btn-back').addEventListener('click', () => navigate('/welcome'));
      attachHeaderActions(container);
      container.querySelector('#btn-change-pin').addEventListener('click', () => {
        step = 'enter';
        digits = [];
        newPin = '';
        message = '';
        renderStep();
      });
      container.querySelector('#btn-remove-pin').addEventListener('click', async () => {
        await storage.remove('pinHash');
        navigate('/welcome');
      });
      return;
    }

    // Numpad-based steps: verify, enter, confirm
    container.innerHTML = `
      <div class="screen-enter min-h-screen flex flex-col">
        <!-- Header -->
        <header class="flex items-center justify-between px-5 py-4">
          <button id="btn-back" class="p-2 -ml-2 text-stone-400 hover:text-stone-600 transition-colors"
                  aria-label="Zurück">
            ${icons.arrowLeft}
          </button>
          ${headerActionsHtml({ showLock: false })}
        </header>

        <!-- Top: title, dots -->
        <div class="flex-1 flex flex-col items-center justify-center pb-4">
          <h2 class="text-lg font-semibold text-stone-800 mb-1">${config.title}</h2>
          <p class="text-sm text-stone-400 mb-1 h-5">${config.subtitle}</p>
          <p id="pin-msg" class="text-sm h-5 mb-6 text-center ${messageColor}">${message}</p>
          <div id="pin-dots">${dotsHtml(0)}</div>
        </div>

        <!-- Bottom: numpad -->
        <div class="pb-6 pt-4">
          ${numpadHtml()}
        </div>
      </div>
    `;

    container.querySelector('#btn-back').addEventListener('click', () => {
      if (step === 'confirm') {
        step = 'enter';
        digits = [];
        newPin = '';
        message = '';
        renderStep();
      } else {
        navigate('/welcome');
      }
    });

    attachNumpad(container, { onDigit, onDelete });
    attachHeaderActions(container);
  }

  function updateDots() {
    const dotsContainer = container.querySelector('#pin-dots');
    if (dotsContainer) dotsContainer.innerHTML = dotsHtml(digits.length);
  }

  function showMessage(text, color = 'text-stone-400') {
    message = text;
    messageColor = color;
    const el = container.querySelector('#pin-msg');
    if (el) {
      el.textContent = text;
      el.className = `text-sm h-5 mb-6 text-center ${color}`;
    }
  }

  function shakeAndReset() {
    const dotsContainer = container.querySelector('#pin-dots');
    if (dotsContainer) {
      const dots = dotsContainer.querySelector('.pin-dots');
      if (dots) dots.classList.add('pin-shake');
    }
    setTimeout(() => {
      digits = [];
      updateDots();
    }, 500);
  }

  async function onDigit(d) {
    if (digits.length >= 4) return;
    digits.push(d);
    updateDots();

    if (digits.length < 4) return;
    const pin = digits.join('');

    switch (step) {
      case 'verify': {
        const correct = await verifyPin(pin, existingHash);
        if (correct) {
          step = 'choose';
          digits = [];
          renderStep();
        } else {
          showMessage('Falscher PIN', 'text-red-600');
          shakeAndReset();
        }
        break;
      }

      case 'enter':
        newPin = pin;
        step = 'confirm';
        digits = [];
        message = '';
        renderStep();
        break;

      case 'confirm':
        if (pin === newPin) {
          const hash = await hashPin(pin);
          await storage.set('pinHash', hash);
          showMessage('PIN gespeichert!', 'text-emerald-600');
          setTimeout(() => navigate('/welcome'), 800);
        } else {
          showMessage('PINs stimmen nicht überein', 'text-red-600');
          shakeAndReset();
          setTimeout(() => {
            step = 'enter';
            newPin = '';
            message = '';
            renderStep();
          }, 1200);
        }
        break;
    }
  }

  function onDelete() {
    if (digits.length === 0) return;
    digits.pop();
    updateDots();
  }

  renderStep();
}
