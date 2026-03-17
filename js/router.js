/**
 * Hybrid router — path-based for public/crawlable pages, hash-based for private app screens.
 * Public routes use history.pushState for clean URLs (/faq, /impressum, /datenschutz).
 * Private routes use hash fragments (#/preparation, #/examination, etc.).
 */

/** @type {Map<string, function(HTMLElement): Promise<Function|void>>} */
const routes = new Map();

/** @type {Function|null} */
let currentCleanup = null;

/** Routes that use path-based (pushState) navigation for SEO. */
const PUBLIC_ROUTES = new Set(['/', '/faq', '/impressum', '/datenschutz']);

/**
 * Register a route handler.
 * @param {string} path - Route path (e.g. '/welcome', '/faq').
 * @param {function(HTMLElement): Promise<Function|void>} handler - Receives the app container, optionally returns cleanup.
 */
export function registerRoute(path, handler) {
  routes.set(path, handler);
}

/**
 * Navigate to a route.
 * Public routes use pushState, private routes use hash.
 * @param {string} path - Route path (e.g. '/welcome', '/faq', '/examination').
 */
export function navigate(path) {
  // Map /welcome to / for public URL
  const effectivePath = path === '/welcome' ? '/' : path;

  if (PUBLIC_ROUTES.has(effectivePath)) {
    history.pushState(null, '', effectivePath);
    handleRoute();
  } else {
    window.location.hash = path;
  }
}

/**
 * Get the current route path.
 * Checks pathname first (public routes), then hash (private routes).
 * Defaults to '/welcome'.
 */
export function getCurrentRoute() {
  const pathname = window.location.pathname;

  // Check if current pathname matches a public route (other than /)
  if (pathname !== '/' && PUBLIC_ROUTES.has(pathname)) {
    return pathname;
  }

  // Check hash for private routes
  const hash = window.location.hash.slice(1);
  if (hash) return hash;

  // Default: / maps to /welcome
  return '/welcome';
}

/** @private Resolve route path to a registered handler. */
function resolveHandler(path) {
  // Direct match
  if (routes.has(path)) return routes.get(path);
  // / maps to /welcome handler
  if (path === '/') return routes.get('/welcome');
  return null;
}

/** @private Handle route changes. */
async function handleRoute() {
  const path = getCurrentRoute();
  const handler = resolveHandler(path);

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
  window.addEventListener('popstate', handleRoute);
  handleRoute();
}
