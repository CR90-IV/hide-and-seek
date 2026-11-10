/**
 * Hider Cheat Sheet - Application Orchestrator
 *
 * This is the main entry point that wires together all services, components,
 * and renderers using clean dependency injection.
 *
 * ARCHITECTURE OVERVIEW:
 * - Core: StateManager, QuestionService, StorageService (foundation)
 * - Services: CopyService, SearchService, MessageFormatter (business logic)
 * - UI: Renderers, Components, ViewManager (presentation)
 *
 * REPLACES: 1,450-line monolithic app.js
 * NEW SIZE: ~250 lines of clean orchestration
 */

// Data
import { questionsData, renamedQuestions } from '../questions-data.js';

// Core services
import { StorageService } from './core/StorageService.js';
import { StateManager } from './core/StateManager.js';
import { QuestionService } from './core/QuestionService.js';

// Business services
import { CopyService } from './services/CopyService.js';
import { SearchService } from './services/SearchService.js';

// UI Components
import { Toast } from './ui/components/Toast.js';
import { QuickJump } from './ui/components/QuickJump.js';

// Renderers
import { DetailRenderer } from './ui/renderers/DetailRenderer.js';
import { OverviewRenderer } from './ui/renderers/OverviewRenderer.js';
import { HistoryRenderer } from './ui/renderers/HistoryRenderer.js';

// View Manager
import { ViewManager } from './ui/ViewManager.js';

/**
 * Main Application Class
 */
class HiderApp {
  // Services
  storage;
  state;
  questionService;
  copyService;
  searchService;

  // UI Components
  toast;
  quickJump;

  // Renderers
  detailRenderer;
  overviewRenderer;
  historyRenderer;

  // View Manager
  viewManager;

  constructor() {
    console.log('🚀 Initializing Hider Cheat Sheet (Refactored Architecture)');

    this.#initializeServices();
    this.#initializeComponents();
    this.#initializeRenderers();
    this.#initializeViewManager();
    this.#renderAll();
    this.#setupGlobalHandlers();
    this.#exposeGlobalAPI();
    this.#registerServiceWorker();

    console.log('✅ Hider Cheat Sheet initialized successfully');
  }

  /* ============================================
     INITIALIZATION PHASES
     ============================================ */

  /**
   * Phase 1: Initialize core services
   * @private
   */
  #initializeServices() {
    // Core
    this.storage = new StorageService();
    this.state = new StateManager(this.storage, renamedQuestions);
    this.questionService = new QuestionService(questionsData);

    // Toast needed by CopyService
    this.toast = new Toast('toast');

    // Services
    this.copyService = new CopyService(this.state, this.toast, this.questionService);
    this.searchService = new SearchService(this.questionService, this.state);
  }

  /**
   * Phase 2: Initialize UI components
   * @private
   */
  #initializeComponents() {
    this.quickJump = new QuickJump('quick-jump', questionsData);
  }

  /**
   * Phase 3: Initialize renderers
   * @private
   */
  #initializeRenderers() {
    this.detailRenderer = new DetailRenderer(
      document.getElementById('questions-grid'),
      this.questionService,
      this.copyService,
      this.state
    );

    this.overviewRenderer = new OverviewRenderer(
      document.querySelector('#overview-view .overview-container'),
      this.questionService,
      this.copyService,
      this.state
    );

    this.historyRenderer = new HistoryRenderer(
      document.getElementById('history-list'),
      this.questionService,
      this.copyService,
      this.state
    );

    // Connect search service to renderers
    this.detailRenderer.setSearchService(this.searchService);
    this.overviewRenderer.setSearchService(this.searchService);
  }

  /**
   * Phase 4: Initialize view manager
   * @private
   */
  #initializeViewManager() {
    this.viewManager = new ViewManager({
      detailRenderer: this.detailRenderer,
      overviewRenderer: this.overviewRenderer,
      historyRenderer: this.historyRenderer,
      quickJump: this.quickJump
    });
  }

  /**
   * Phase 5: Render all views
   * @private
   */
  #renderAll() {
    this.detailRenderer.render();
    this.overviewRenderer.render();
    this.historyRenderer.render();
  }

  /**
   * Phase 6: Setup global event handlers
   * @private
   */
  #setupGlobalHandlers() {
    // Undo button
    const undoBtn = this.toast.getUndoButton();
    undoBtn.addEventListener('click', () => {
      this.#handleUndo();
    });

    // WhatsApp mode radio buttons
    document.querySelectorAll('input[name="whatsapp-mode"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.state.setWhatsAppMode(e.target.value);
      });
    });

    // Set initial radio state
    const currentMode = this.state.getWhatsAppMode();
    const radio = document.querySelector(`input[value="${currentMode}"]`);
    if (radio) radio.checked = true;

    // Search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchService.search(e.target.value);
      });
    }

    // Clear search button
    const clearSearchBtn = document.getElementById('clear-search');
    if (clearSearchBtn && searchInput) {
      clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        this.searchService.clear();
      });
    }

    // Settings and History buttons
    document.getElementById('reset-all')?.addEventListener('click', () => this.#resetAll());
    document.getElementById('clear-history')?.addEventListener('click', () => this.#clearHistory());

    // Update search results count
    this.searchService.onSearchResults(({ matches, total, query }) => {
      this.#updateSearchCount(matches.size, total, query);
    });
  }

  /**
   * Phase 7: Expose global API
   * @private
   */
  #exposeGlobalAPI() {
    // Small global API for debugging in the browser console
    window.hiderApp = {
      switchView: (view) => this.viewManager.switchView(view),
      resetAll: () => this.#resetAll(),
      clearHistory: () => this.#clearHistory()
    };
  }

  /**
   * Phase 8: Register service worker
   * @private
   */
  async #registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('./sw.js', { scope: './' });
        console.log('Service Worker registered:', registration.scope);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  /* ============================================
     GLOBAL HANDLERS
     ============================================ */

  /**
   * Handle undo action
   * @private
   */
  #handleUndo() {
    const action = this.state.undo();
    if (action) {
      this.toast.show('Undone', false);
    }
  }

  /**
   * Update search results count
   * @private
   */
  #updateSearchCount(matching, total, query) {
    const countElement = document.getElementById('search-results-count');

    if (!query) {
      countElement.textContent = '';
    } else if (matching === 0) {
      countElement.textContent = 'No questions match your search';
    } else {
      countElement.textContent = `${matching} question${matching !== 1 ? 's' : ''} found`;
    }
  }

  /**
   * Reset all questions and history
   * @private
   */
  #resetAll() {
    if (confirm('Reset all questions and clear history?')) {
      this.state.reset();
      this.toast.show('All questions reset', false);
    }
  }

  /**
   * Clear history only
   * @private
   */
  #clearHistory() {
    if (confirm('Clear question history?')) {
      this.state.clearHistory();
      this.toast.show('History cleared', false);
    }
  }
}

/* ============================================
   APPLICATION ENTRY POINT
   ============================================ */

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new HiderApp();
});
