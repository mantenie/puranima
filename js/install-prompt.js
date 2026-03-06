/**
 * PWA install prompt — captures beforeinstallprompt early so it can be
 * triggered later from any screen.
 *
 * This module must be imported by the app entry point (app.js) before any
 * navigation occurs so the event listener is registered at startup.
 */

let _deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  _deferredPrompt = e;
});

/** Returns true if the PWA install prompt is available. */
export function isInstallable() {
  return _deferredPrompt !== null;
}

/** Trigger the PWA install prompt. Returns true if user accepted. */
export async function promptInstall() {
  if (!_deferredPrompt) return false;
  _deferredPrompt.prompt();
  const { outcome } = await _deferredPrompt.userChoice;
  _deferredPrompt = null;
  return outcome === 'accepted';
}
