/**
 * Question catalog loader and filter.
 * Loads the JSON catalog once and provides filtered access.
 */

/** @type {object|null} */
let catalog = null;

/** Load the question catalog from the JSON file. Caches after first load. */
export async function loadCatalog() {
  if (catalog) return catalog;
  const response = await fetch('/data/questions.json');
  if (!response.ok) throw new Error(`Failed to load catalog: ${response.status}`);
  catalog = await response.json();
  return catalog;
}

/**
 * Get questions filtered by life state.
 * Includes all 'allgemein' questions plus life-state-specific ones.
 * Sorted by category order defined in catalog metadata.
 * @param {string} lifeState
 * @returns {object[]}
 */
export function getFilteredQuestions(lifeState) {
  if (!catalog) throw new Error('Catalog not loaded. Call loadCatalog() first.');

  const categoryOrder = Object.fromEntries(
    catalog.meta.categories.map(c => [c.id, c.order])
  );

  return catalog.questions
    .filter(q => q.tags.includes('allgemein') || q.tags.includes(lifeState))
    .sort((a, b) => (categoryOrder[a.category] || 99) - (categoryOrder[b.category] || 99));
}

/** Get the category metadata list sorted by order. */
export function getCategories() {
  if (!catalog) throw new Error('Catalog not loaded.');
  return [...catalog.meta.categories].sort((a, b) => a.order - b.order);
}

/** Get the prayer texts. */
export function getPrayers() {
  if (!catalog) throw new Error('Catalog not loaded.');
  return catalog.prayers;
}

/** Get the list of available life states. */
export function getLifeStates() {
  if (!catalog) throw new Error('Catalog not loaded.');
  return catalog.meta.lifestates;
}
