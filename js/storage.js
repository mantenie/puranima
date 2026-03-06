/**
 * Storage abstraction layer using IndexedDB with localStorage fallback.
 * All data stays local — zero server communication.
 */

const DB_NAME = 'beichtbar';
const DB_VERSION = 1;
const STORE_NAME = 'appdata';

class StorageManager {
  /** @type {IDBDatabase|null} */
  #db = null;
  #useLocalStorage = false;

  /** Initialize the storage backend. Must be called before any other method. */
  async init() {
    try {
      this.#db = await this.#openDB();
    } catch (err) {
      console.warn('IndexedDB unavailable, using localStorage fallback:', err.message);
      this.#useLocalStorage = true;
    }
  }

  /**
   * Get a value by key.
   * @param {string} key
   * @returns {Promise<*>} The stored value, or null if not found.
   */
  async get(key) {
    if (this.#useLocalStorage) {
      const raw = localStorage.getItem(`beichtbar_${key}`);
      return raw ? JSON.parse(raw) : null;
    }

    return new Promise((resolve, reject) => {
      const tx = this.#db.transaction(STORE_NAME, 'readonly');
      const request = tx.objectStore(STORE_NAME).get(key);
      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Set a value by key.
   * @param {string} key
   * @param {*} value - Must be structured-cloneable.
   */
  async set(key, value) {
    if (this.#useLocalStorage) {
      localStorage.setItem(`beichtbar_${key}`, JSON.stringify(value));
      return;
    }

    return new Promise((resolve, reject) => {
      const tx = this.#db.transaction(STORE_NAME, 'readwrite');
      const request = tx.objectStore(STORE_NAME).put(value, key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Remove a single key.
   * @param {string} key
   */
  async remove(key) {
    if (this.#useLocalStorage) {
      localStorage.removeItem(`beichtbar_${key}`);
      return;
    }

    return new Promise((resolve, reject) => {
      const tx = this.#db.transaction(STORE_NAME, 'readwrite');
      const request = tx.objectStore(STORE_NAME).delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /** Clear session data (answers, progress) but keep life state. */
  async clearSession() {
    await Promise.all([
      this.remove('answers'),
      this.remove('currentIndex'),
      this.remove('sessionTimestamp'),
    ]);
  }

  /** Clear ALL local data — including PIN. Used by the Panic Button. */
  async clearAll() {
    if (this.#useLocalStorage) {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('beichtbar_')) keys.push(key);
      }
      keys.forEach(k => localStorage.removeItem(k));
    } else {
      await new Promise((resolve, reject) => {
        const tx = this.#db.transaction(STORE_NAME, 'readwrite');
        const request = tx.objectStore(STORE_NAME).clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }

  /** @private */
  #openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

export const storage = new StorageManager();
