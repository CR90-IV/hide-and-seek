/**
 * ViewManager - Switches between the Questions, Overview, History and Settings views
 *
 * The URL hash selects the view (#questions, #overview, #history, #settings),
 * so the header navigation links and the browser back button work.
 */
const HASH_TO_VIEW = {
  questions: 'detail',
  overview: 'overview',
  history: 'history',
  settings: 'settings'
};

const VIEW_TITLES = {
  detail: 'Questions',
  overview: 'Overview',
  history: 'History',
  settings: 'Settings'
};

export class ViewManager {
  #views = {};
  #quickJump;
  #searchContainer;
  #currentView = 'detail';

  /**
   * @param {object} config
   * @param {object} config.detailRenderer
   * @param {object} config.overviewRenderer
   * @param {object} config.historyRenderer
   * @param {object} config.quickJump
   */
  constructor(config) {
    this.#views = {
      detail: { element: document.getElementById('normal-view'), renderer: config.detailRenderer },
      overview: { element: document.getElementById('overview-view'), renderer: config.overviewRenderer },
      history: { element: document.getElementById('history-view'), renderer: config.historyRenderer },
      settings: { element: document.getElementById('settings-view'), renderer: null }
    };
    this.#quickJump = config.quickJump;
    this.#searchContainer = document.getElementById('search-container');

    window.addEventListener('hashchange', () => this.#syncWithHash());
    this.#syncWithHash();
  }

  /* ============================================
     PUBLIC API
     ============================================ */

  /**
   * @param {string} view - 'detail', 'overview', 'history' or 'settings'
   */
  switchView(view) {
    if (!this.#views[view]) {
      console.error(`ViewManager: Invalid view "${view}"`);
      return;
    }

    Object.entries(this.#views).forEach(([name, v]) => {
      v.element.classList.toggle('hidden', name !== view);
    });

    if (view === 'detail') {
      this.#quickJump.show();
    } else {
      this.#quickJump.hide();
    }

    // Search applies to the Questions and Overview views only
    const hasSearch = view === 'detail' || view === 'overview';
    this.#searchContainer?.classList.toggle('hidden', !hasSearch);
    if (hasSearch) this.#placeSearch(view);

    this.#updateNavigation(view);
    document.title = `${VIEW_TITLES[view]} – Hide and seek`;

    const changed = this.#currentView !== view;
    this.#currentView = view;
    if (changed) window.scrollTo(0, 0);
  }

  getCurrentView() {
    return this.#currentView;
  }

  /* ============================================
     PRIVATE METHODS
     ============================================ */

  #syncWithHash() {
    const hash = window.location.hash.slice(1);
    const view = HASH_TO_VIEW[hash];
    if (view) {
      this.switchView(view);
    } else if (!hash) {
      this.switchView('detail');
    }
  }

  #updateNavigation(activeView) {
    document.querySelectorAll('.app-nav__item[data-view]').forEach(item => {
      const link = item.querySelector('.app-nav__link');
      const isActive = item.dataset.view === activeView;
      item.classList.toggle('app-nav__item--active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  /**
   * Put the search box after the heading and intro of the view,
   * so each page starts with its heading
   */
  #placeSearch(view) {
    const intro = this.#views[view].element.querySelector('.app-view__intro');
    if (intro && this.#searchContainer && intro.nextElementSibling !== this.#searchContainer) {
      intro.after(this.#searchContainer);
    }
  }
}
