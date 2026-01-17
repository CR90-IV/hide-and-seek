import { debounce } from '../utils/debounce.js';

/**
 * SearchService - Debounced search with indexed question data
 *
 * Provides fast, debounced search functionality using QuestionService's
 * pre-built indices for O(1) performance
 */
export class SearchService {
  #questionService;
  #stateManager;
  #debouncedSearch;
  #searchCallbacks = [];

  /**
   * Create a new SearchService
   * @param {QuestionService} questionService - The question service
   * @param {StateManager} stateManager - The state manager
   * @param {number} debounceMs - Debounce delay in milliseconds (default: 150)
   */
  constructor(questionService, stateManager, debounceMs = 150) {
    this.#questionService = questionService;
    this.#stateManager = stateManager;

    // Create debounced search function
    this.#debouncedSearch = debounce(
      this.#executeSearch.bind(this),
      debounceMs
    );
  }

  /* ============================================
     PUBLIC API
     ============================================ */

  /**
   * Perform a search (debounced)
   * @param {string} query - The search query
   */
  search(query) {
    // Update state immediately for UI responsiveness
    const normalized = query.trim();
    this.#stateManager.setSearchState(!!normalized, normalized);

    // Execute debounced search
    this.#debouncedSearch(normalized);
  }

  /**
   * Register callback for search results
   * @param {Function} callback - Called with { matches: Set, total: number, query: string }
   */
  onSearchResults(callback) {
    this.#searchCallbacks.push(callback);
  }

  /**
   * Clear search and reset state
   */
  clear() {
    this.#stateManager.setSearchState(false, '');

    // Notify all callbacks
    const allQuestions = this.#questionService.search('');
    const result = {
      matches: allQuestions,
      total: this.#questionService.getTotalQuestions(),
      query: ''
    };

    this.#searchCallbacks.forEach(callback => {
      callback(result);
    });
  }

  /* ============================================
     PRIVATE METHODS
     ============================================ */

  /**
   * Execute the search and notify all callbacks
   * @private
   * @param {string} query - The normalized search query
   */
  #executeSearch(query) {
    if (!query) {
      this.clear();
      return;
    }

    // Use QuestionService's indexed search (fast!)
    const matches = this.#questionService.search(query);
    const total = this.#questionService.getTotalQuestions();

    // Notify all callbacks with results
    const result = { matches, total, query };

    this.#searchCallbacks.forEach(callback => {
      try {
        callback(result);
      } catch (error) {
        console.error('SearchService: Error in search callback:', error);
      }
    });
  }
}
