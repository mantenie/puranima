/**
 * PIN lock screen — blocks app startup until the correct PIN is entered.
 * Also provides lockApp() for instant-lock from any screen.
 */

import { storage } from '../storage.js';
import { verifyPin, dotsHtml, numpadHtml, attachNumpad } from '../pin.js';

const LOCK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;

const MAX_ATTEMPTS = 3;
const COOLDOWN_MS = 30_000;

/**
 * Render the lock screen and block until PIN is correct.
 * @param {HTMLElement} container
 * @param {string} pinHash - Stored SHA-256 hash.
 * @returns {Promise<void>} Resolves on successful authentication.
 */
/**
 * Show lock overlay on top of the current page. Resolves when unlocked.
 * The current screen stays intact underneath.
 */
export async function lockApp() {
  const pinHash = await storage.get('pinHash');
  if (!pinHash) return;

  const overlay = document.createElement('div');
  overlay.id = 'pin-lock-overlay';
  overlay.className = 'fixed inset-0 z-50 bg-stone-50';
  document.body.appendChild(overlay);

  await showPinLock(overlay, pinHash);
  overlay.remove();
}

export function showPinLock(container, pinHash) {
  return new Promise((resolve) => {
    let digits = [];
    let attempts = 0;
    let locked = false;

    function render() {
      container.innerHTML = `
        <div class="min-h-screen flex flex-col">
          <!-- Top: icon, title, dots -->
          <div class="flex-1 flex flex-col items-center justify-center pb-4">
            <div class="text-amber-600 mb-5">${LOCK_ICON}</div>
            <h1 class="text-xl font-bold text-stone-800 mb-1">PIN eingeben</h1>
            <p id="pin-msg" class="text-sm h-5 mb-6 text-center text-stone-400"></p>
            <div id="pin-dots">${dotsHtml(0)}</div>
          </div>

          <!-- Bottom: numpad -->
          <div class="pb-6 pt-4">
            ${numpadHtml()}
            <div class="text-center mt-6">
              <button id="btn-forgot" class="text-xs text-stone-400 hover:text-stone-500 transition-colors">
                PIN vergessen?
              </button>
            </div>
          </div>
        </div>
      `;

      attachNumpad(container, { onDigit, onDelete });

      container.querySelector('#btn-forgot').addEventListener('click', () => {
        const msg = container.querySelector('#pin-msg');
        msg.innerHTML = 'Alle Daten löschen, um die App zurückzusetzen.';
        msg.className = 'text-sm h-5 mb-6 text-center text-stone-500';

        // Replace "PIN vergessen?" with "Alles löschen" button
        const forgotBtn = container.querySelector('#btn-forgot');
        forgotBtn.textContent = 'Alles löschen';
        forgotBtn.className = 'text-sm text-red-500 hover:text-red-700 font-medium transition-colors';
        forgotBtn.replaceWith(forgotBtn.cloneNode(true));
        container.querySelector('#btn-forgot').addEventListener('click', async () => {
          await storage.clearAll();
          window.location.hash = '';
          window.location.reload();
        });
      });
    }

    function updateDots() {
      const dotsContainer = container.querySelector('#pin-dots');
      if (dotsContainer) dotsContainer.innerHTML = dotsHtml(digits.length);
    }

    function showMessage(text, colorClass) {
      const msg = container.querySelector('#pin-msg');
      if (msg) {
        msg.textContent = text;
        msg.className = `text-sm h-5 mb-6 text-center ${colorClass}`;
      }
    }

    function shakeAndReset() {
      const dotsContainer = container.querySelector('#pin-dots');
      if (dotsContainer) {
        dotsContainer.querySelector('.pin-dots').classList.add('pin-shake');
      }
      showMessage('Falscher PIN', 'text-red-600');

      setTimeout(() => {
        digits = [];
        updateDots();
        showMessage('', 'text-stone-400');
      }, 600);
    }

    async function onDigit(d) {
      if (locked || digits.length >= 4) return;
      digits.push(d);
      updateDots();

      if (digits.length === 4) {
        const pin = digits.join('');
        const correct = await verifyPin(pin, pinHash);

        if (correct) {
          resolve();
        } else {
          attempts++;
          if (attempts >= MAX_ATTEMPTS) {
            locked = true;
            digits = [];
            updateDots();

            let remaining = COOLDOWN_MS / 1000;
            showMessage(`Bitte warte ${remaining} Sekunden…`, 'text-red-600');

            const interval = setInterval(() => {
              remaining--;
              if (remaining > 0) {
                showMessage(`Bitte warte ${remaining} Sekunden…`, 'text-red-600');
              } else {
                clearInterval(interval);
                locked = false;
                attempts = 0;
                showMessage('', 'text-stone-400');
              }
            }, 1000);
          } else {
            shakeAndReset();
          }
        }
      }
    }

    function onDelete() {
      if (locked || digits.length === 0) return;
      digits.pop();
      updateDots();
    }

    render();
  });
}
