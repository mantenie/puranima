/**
 * Shared PIN utilities — hashing, verification, and UI components.
 */

/**
 * Hash a 4-digit PIN using SHA-256 with a salt.
 * @param {string} pin
 * @returns {Promise<string>} Hex-encoded hash.
 */
export async function hashPin(pin) {
  const data = new TextEncoder().encode(`beichtbar_${pin}`);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify a PIN against a stored hash.
 * @param {string} pin
 * @param {string} storedHash
 * @returns {Promise<boolean>}
 */
export async function verifyPin(pin, storedHash) {
  return (await hashPin(pin)) === storedHash;
}

/**
 * Render the 4-dot PIN indicator.
 * @param {number} filled - Number of filled dots (0–4).
 * @returns {string} HTML string.
 */
export function dotsHtml(filled) {
  return `<div class="pin-dots flex gap-3.5 justify-center">
    ${[0, 1, 2, 3].map(i => `
      <div class="w-3.5 h-3.5 rounded-full transition-all duration-150
                  ${i < filled ? 'bg-amber-600 scale-110' : 'bg-stone-300'}"></div>
    `).join('')}
  </div>`;
}

/**
 * Render the numeric keypad (3×4 grid).
 * @returns {string} HTML string.
 */
export function numpadHtml() {
  const delIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z"/><line x1="18" x2="12" y1="9" y2="15"/><line x1="12" x2="18" y1="9" y2="15"/></svg>`;

  const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'];
  return `<div class="grid grid-cols-3 gap-3 w-56 mx-auto">
    ${keys.map(k => {
      if (k === null) return '<div></div>';
      if (k === 'del') {
        return `<button data-key="del" class="numpad-key aspect-square rounded-full flex items-center justify-center
                       text-stone-400 hover:bg-stone-100 active:bg-stone-200 transition-colors"
                       aria-label="Löschen">${delIcon}</button>`;
      }
      return `<button data-key="${k}" class="numpad-key aspect-square rounded-full flex items-center justify-center
                     text-2xl font-medium text-stone-700 hover:bg-stone-100 active:bg-stone-200 transition-colors">${k}</button>`;
    }).join('')}
  </div>`;
}

/**
 * Attach click listeners to numpad buttons within a container.
 * @param {HTMLElement} container
 * @param {{ onDigit: (d: number) => void, onDelete: () => void }} callbacks
 */
export function attachNumpad(container, { onDigit, onDelete }) {
  container.querySelectorAll('.numpad-key').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.key;
      if (key === 'del') onDelete();
      else onDigit(parseInt(key));
    });
  });
}
