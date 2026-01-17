/**
 * StorageService - localStorage abstraction with error handling
 *
 * Provides a clean interface to localStorage with:
 * - Error handling for quota exceeded
 * - Graceful handling of corrupted JSON
 * - Easy to mock for testing
 * - Consistent API across the application
 */
export class StorageService {
  /**
   * Get a value from localStorage
   * @param {string} key - The storage key
   * @param {*} defaultValue - Default value if key doesn't exist or parsing fails
   * @returns {*} The parsed value or defaultValue
   */
  get(key, defaultValue = null) {
    try {
      const value = localStorage.getItem(key);
      if (value === null) {
        return defaultValue;
      }
      return JSON.parse(value);
    } catch (error) {
      console.error(`StorageService: Failed to read "${key}":`, error);
      return defaultValue;
    }
  }

  /**
   * Set a value in localStorage
   * @param {string} key - The storage key
   * @param {*} value - The value to store (will be JSON stringified)
   * @returns {boolean} True if successful, false otherwise
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error(`StorageService: Quota exceeded while writing "${key}"`);
        this.#handleQuotaExceeded(key);
      } else {
        console.error(`StorageService: Failed to write "${key}":`, error);
      }
      return false;
    }
  }

  /**
   * Remove a value from localStorage
   * @param {string} key - The storage key
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`StorageService: Failed to remove "${key}":`, error);
    }
  }

  /**
   * Clear all localStorage
   */
  clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('StorageService: Failed to clear storage:', error);
    }
  }

  /**
   * Check if a key exists in localStorage
   * @param {string} key - The storage key
   * @returns {boolean} True if the key exists
   */
  has(key) {
    return localStorage.getItem(key) !== null;
  }

  /**
   * Handle quota exceeded error
   * @private
   */
  #handleQuotaExceeded(key) {
    console.warn(`StorageService: Attempting to free up space by clearing old history...`);

    // Try to free up space by trimming question history
    try {
      const history = this.get('questionHistory', []);
      if (history.length > 50) {
        // Keep only the most recent 50 items
        const trimmedHistory = history.slice(-50);
        this.set('questionHistory', trimmedHistory);
        console.log(`StorageService: Trimmed history from ${history.length} to ${trimmedHistory.length} items`);
      }
    } catch (error) {
      console.error('StorageService: Failed to free up space:', error);
    }
  }
}
