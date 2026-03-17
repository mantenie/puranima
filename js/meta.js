/**
 * Dynamic meta tag utility for SEO.
 * Updates document head meta tags when SPA-navigating between public pages.
 */

const BASE_URL = 'https://beichtbar.de';

/**
 * Update document meta tags for the current page.
 * @param {{ title: string, description: string, path: string, ogImage?: string }} meta
 */
export function updateMeta({ title, description, path, ogImage }) {
  const url = `${BASE_URL}${path}`;
  const image = ogImage || `${BASE_URL}/assets/og-image.png`;

  document.title = title;

  setMeta('name', 'description', description);
  setLink('canonical', url);

  // Open Graph
  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:url', url);
  setMeta('property', 'og:image', image);

  // Twitter
  setMeta('name', 'twitter:title', title);
  setMeta('name', 'twitter:description', description);
  setMeta('name', 'twitter:image', image);
}

/** @private */
function setMeta(attr, key, value) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (el) {
    el.setAttribute('content', value);
  }
}

/** @private */
function setLink(rel, href) {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (el) {
    el.setAttribute('href', href);
  }
}
