/**
 * Minimal hash-based router for single-page navigation.
 * Routes map hash paths (e.g. #/welcome) to render functions.
 */

/** @type {Map<string, function(HTMLElement): Promise<Function|void>>} */
const routes = new Map();

/** @type {Function|null} */
let currentCleanup = null;

/**
 * Register a route handler.
 * @param {string} path - Hash path without '#' (e.g. '/welcome').
 * @param {function(HTMLElement): Promise<Function|void>} handler - Receives the app container, optionally returns cleanup.
 */
export function registerRoute(path, handler) {
  routes.set(path, handler);
}

/**
 * Navigate to a route.
 * @param {string} path - Hash path without '#' (e.g. '/welcome').
 */
export function navigate(path) {
  window.location.hash = path;
}

/** Get the current route path. Defaults to '/welcome'. */
export function getCurrentRoute() {
  return window.location.hash.slice(1) || '/welcome';
}

/** @private Handle route changes. */
async function handleRoute() {
  const path = getCurrentRoute();
  const handler = routes.get(path);

  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }

  if (handler) {
    const container = document.getElementById('app');
    container.innerHTML = '';
    currentCleanup = await handler(container) || null;
  }
}

/** Start listening for route changes and render the initial route. */
export function startRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}
