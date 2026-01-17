/**
 * StateManager - Observable state management with automatic persistence
 *
 * Replaces global mutable arrays (usedQuestions, questionHistory) with a single
 * source of truth that:
 * - Uses observer pattern for automatic UI updates
 * - Provides immutable state access
 * - Automatically persists to localStorage
 * - Centralizes all state mutations
 *
 * Events emitted:
 * - 'questionMarkedUsed': { key, category, title, question }
 * - 'questionUnmarked': { key, category, title }
 * - 'historyAdded': { entry }
 * - 'historyCleared': {}
 * - 'whatsappModeChanged': { mode }
 * - 'stateReset': {}
 */
export class StateManager {
  // Private state object
  #state = {
    usedQuestions: new Set(),      // Set of "Category:Title" keys
    questionHistory: [],            // Array of history entries
    whatsappMode: 'clipboard',      // 'clipboard' or 'deeplink'
    searchActive: false,
    searchQuery: '',
    lastAction: null               // For undo functionality
  };

  // Observer callbacks by event type
  #observers = new Map();

  /**
   * Create a new StateManager
   * @param {StorageService} storageService - The storage service to use
   */
  constructor(storageService) {
    this.storage = storageService;
    this.#loadState();
  }

  /* ============================================
     SUBSCRIPTION (Observer Pattern)
     ============================================ */

  /**
   * Subscribe to state change events
   * @param {string} event - The event name
   * @param {Function} callback - The callback function
   * @returns {Function} Unsubscribe function
   */
  subscribe(event, callback) {
    if (!this.#observers.has(event)) {
      this.#observers.set(event, []);
    }
    this.#observers.get(event).push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.#observers.get(event) || [];
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  /* ============================================
     STATE GETTERS (Immutable Access)
     ============================================ */

  /**
   * Get copy of used questions Set
   * @returns {Set<string>} Copy of used questions
   */
  getUsedQuestions() {
    return new Set(this.#state.usedQuestions);
  }

  /**
   * Get copy of question history
   * @returns {Array} Copy of question history
   */
  getHistory() {
    return [...this.#state.questionHistory];
  }

  /**
   * Get WhatsApp mode
   * @returns {string} 'clipboard' or 'deeplink'
   */
  getWhatsAppMode() {
    return this.#state.whatsappMode;
  }

  /**
   * Get search active state
   * @returns {boolean}
   */
  isSearchActive() {
    return this.#state.searchActive;
  }

  /**
   * Get search query
   * @returns {string}
   */
  getSearchQuery() {
    return this.#state.searchQuery;
  }

  /**
   * Get last action (for undo)
   * @returns {object|null}
   */
  getLastAction() {
    return this.#state.lastAction ? { ...this.#state.lastAction } : null;
  }

  /**
   * Check if a question is marked as used
   * @param {string} category - The question category
   * @param {string} title - The question title
   * @returns {boolean} True if the question is used
   */
  isQuestionUsed(category, title) {
    const key = `${category}:${title}`;
    return this.#state.usedQuestions.has(key);
  }

  /* ============================================
     STATE MUTATIONS (Single Source of Truth)
     ============================================ */

  /**
   * Mark a question as used
   * @param {string} key - The question key "Category:Title"
   * @param {object} questionData - { category, title, question }
   */
  markQuestionAsUsed(key, questionData) {
    const { category, title, question } = questionData;

    // Add to used questions Set
    this.#state.usedQuestions.add(key);

    // Save to storage
    this.#saveUsedQuestions();

    // Add to history
    this.addToHistory({ category, title, question });

    // Set last action for undo
    this.#state.lastAction = {
      type: 'mark',
      key,
      category,
      title,
      timestamp: Date.now()
    };

    // Emit event
    this.#emit('questionMarkedUsed', { key, category, title, question });
  }

  /**
   * Unmark a question (toggle back to unused)
   * @param {string} key - The question key "Category:Title"
   * @param {string} category - The category name
   * @param {string} title - The question title
   */
  unmarkQuestion(key, category, title) {
    // Remove from used questions Set
    this.#state.usedQuestions.delete(key);

    // Save to storage
    this.#saveUsedQuestions();

    // Clear last action
    this.#state.lastAction = null;

    // Emit event
    this.#emit('questionUnmarked', { key, category, title });
  }

  /**
   * Add entry to question history
   * @param {object} entry - { category, title, question }
   */
  addToHistory(entry) {
    const historyEntry = {
      ...entry,
      timestamp: new Date().toISOString()
    };

    this.#state.questionHistory.push(historyEntry);

    // Save to storage
    this.#saveHistory();

    // Emit event
    this.#emit('historyAdded', { entry: historyEntry });
  }

  /**
   * Clear all history
   */
  clearHistory() {
    this.#state.questionHistory = [];
    this.#saveHistory();
    this.#emit('historyCleared', {});
  }

  /**
   * Set WhatsApp mode
   * @param {string} mode - 'clipboard' or 'deeplink'
   */
  setWhatsAppMode(mode) {
    if (mode !== 'clipboard' && mode !== 'deeplink') {
      console.error(`Invalid WhatsApp mode: ${mode}`);
      return;
    }

    this.#state.whatsappMode = mode;
    this.storage.set('whatsappMode', mode);
    this.#emit('whatsappModeChanged', { mode });
  }

  /**
   * Set search state
   * @param {boolean} active - Whether search is active
   * @param {string} query - The search query
   */
  setSearchState(active, query = '') {
    this.#state.searchActive = active;
    this.#state.searchQuery = query;
    this.#emit('searchStateChanged', { active, query });
  }

  /**
   * Undo last action
   * @returns {object|null} The undone action, or null if nothing to undo
   */
  undo() {
    const action = this.#state.lastAction;

    if (!action || action.type !== 'mark') {
      return null;
    }

    // Check if action is recent (within 5 seconds)
    const age = Date.now() - action.timestamp;
    if (age > 5000) {
      this.#state.lastAction = null;
      return null;
    }

    // Unmark the question
    this.unmarkQuestion(action.key, action.category, action.title);

    // Clear last action
    this.#state.lastAction = null;

    // Return the undone action
    return action;
  }

  /**
   * Reset all state
   */
  reset() {
    this.#state.usedQuestions.clear();
    this.#state.questionHistory = [];
    this.#state.lastAction = null;

    this.#saveUsedQuestions();
    this.#saveHistory();

    this.#emit('stateReset', {});
  }

  /* ============================================
     PRIVATE METHODS
     ============================================ */

  /**
   * Load state from localStorage
   * @private
   */
  #loadState() {
    // Load used questions (convert array to Set)
    const usedQuestionsArray = this.storage.get('usedQuestions', []);
    this.#state.usedQuestions = new Set(usedQuestionsArray);

    // Load history
    this.#state.questionHistory = this.storage.get('questionHistory', []);

    // Load WhatsApp mode
    this.#state.whatsappMode = this.storage.get('whatsappMode', 'clipboard');

    console.log(`StateManager: Loaded ${this.#state.usedQuestions.size} used questions, ${this.#state.questionHistory.length} history entries`);
  }

  /**
   * Save used questions to localStorage
   * @private
   */
  #saveUsedQuestions() {
    const array = Array.from(this.#state.usedQuestions);
    this.storage.set('usedQuestions', array);
  }

  /**
   * Save history to localStorage
   * @private
   */
  #saveHistory() {
    this.storage.set('questionHistory', this.#state.questionHistory);
  }

  /**
   * Emit an event to all subscribers
   * @private
   * @param {string} event - The event name
   * @param {object} data - The event data
   */
  #emit(event, data) {
    const callbacks = this.#observers.get(event) || [];
    for (const callback of callbacks) {
      try {
        callback(data);
      } catch (error) {
        console.error(`StateManager: Error in "${event}" observer:`, error);
      }
    }
  }
}
