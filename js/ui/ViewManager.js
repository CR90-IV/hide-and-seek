/**
 * ViewManager - Manages switching between Detail, Overview, and History views
 *
 * Handles:
 * - View visibility toggling
 * - Quick jump visibility
 * - Bottom navigation active states
 */
export class ViewManager {
  #views = {
    detail: null,
    overview: null,
    history: null
  };
  #quickJump;
  #currentView = 'detail';

  /**
   * Create a new ViewManager
   * @param {object} config - Configuration object
   * @param {object} config.detailRenderer - Detail renderer instance
   * @param {object} config.overviewRenderer - Overview renderer instance
   * @param {object} config.historyRenderer - History renderer instance
   * @param {object} config.quickJump - QuickJump component instance
   */
  constructor(config) {
    this.#views.detail = {
      element: document.getElementById('normal-view'),
      renderer: config.detailRenderer
    };
    this.#views.overview = {
      element: document.getElementById('overview-view'),
      renderer: config.overviewRenderer
    };
    this.#views.history = {
      element: document.getElementById('history-view'),
      renderer: config.historyRenderer
    };
    this.#quickJump = config.quickJump;

    // Setup bottom nav listeners
    this.#setupBottomNav();

    // Initial view - start with detail
    this.switchView('detail');
  }

  /* ============================================
     PUBLIC API
     ============================================ */

  /**
   * Switch to a different view
   * @param {string} view - View name ('detail', 'overview', 'history')
   */
  switchView(view) {
    if (!this.#views[view]) {
      console.error(`ViewManager: Invalid view "${view}"`);
      return;
    }

    // Hide all views
    Object.values(this.#views).forEach(v => {
      v.element.classList.add('hidden');
    });

    // Show selected view
    this.#views[view].element.classList.remove('hidden');

    // Show/hide quick jump (only visible in detail view)
    if (view === 'detail') {
      this.#quickJump.show();
    } else {
      this.#quickJump.hide();
    }

    // Update bottom nav active state
    this.#updateBottomNav(view);

    // Update current view
    this.#currentView = view;
  }

  /**
   * Get current view name
   * @returns {string} Current view ('detail', 'overview', 'history')
   */
  getCurrentView() {
    return this.#currentView;
  }

  /* ============================================
     PRIVATE METHODS
     ============================================ */

  /**
   * Setup bottom navigation event listeners
   * @private
   */
  #setupBottomNav() {
    const navItems = document.querySelectorAll('.bottom-nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const view = item.dataset.view;
        if (view) {
          this.switchView(view);
        }
      });
    });
  }

  /**
   * Update bottom navigation active state
   * @private
   * @param {string} activeView - The active view name
   */
  #updateBottomNav(activeView) {
    const navItems = document.querySelectorAll('.bottom-nav-item');
    navItems.forEach(item => {
      if (item.dataset.view === activeView) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }
}
