import { EventDelegator } from '../../utils/events.js';

/**
 * HistoryRenderer - Renders question history list
 *
 * Shows chronological list of asked questions with:
 * - Most recent first
 * - Copy button for each
 * - Timestamps
 * - Category icons
 *
 * PERFORMANCE: Uses QuestionService O(1) lookups instead of O(n²) nested loops
 */
export class HistoryRenderer {
  #container;
  #questionService;
  #copyService;
  #stateManager;
  #events;

  /**
   * Create a new HistoryRenderer
   * @param {HTMLElement} container - The container element
   * @param {QuestionService} questionService - The question service
   * @param {CopyService} copyService - The copy service
   * @param {StateManager} stateManager - The state manager
   */
  constructor(container, questionService, copyService, stateManager) {
    this.#container = container;
    this.#questionService = questionService;
    this.#copyService = copyService;
    this.#stateManager = stateManager;

    this.#events = new EventDelegator(this.#container);
    this.#setupEventDelegation();
    this.#observeState();
  }

  /* ============================================
     PUBLIC API
     ============================================ */

  /**
   * Render history list
   */
  render() {
    this.#container.innerHTML = '';

    const history = this.#stateManager.getHistory();

    if (history.length === 0) {
      return; // CSS ::before will show empty message
    }

    // Show most recent first
    const reversedHistory = [...history].reverse();

    reversedHistory.forEach((item) => {
      const historyItem = this.#createHistoryItem(item);
      this.#container.appendChild(historyItem);
    });
  }

  /* ============================================
     PRIVATE - EVENT DELEGATION
     ============================================ */

  #setupEventDelegation() {
    this.#events.on('.history-copy-btn', 'click', (event, btn) => {
      const historyItem = btn.closest('.history-item');
      const category = historyItem.dataset.category;
      const title = historyItem.dataset.title;
      const question = historyItem.dataset.question;

      const historyEntry = { category, title, question };

      // Get full question data from QuestionService (O(1) lookup!)
      const questionData = this.#questionService.getQuestion(category, title);

      if (questionData) {
        this.#copyService.copyFromHistory(historyEntry, questionData);
      } else {
        console.error(`HistoryRenderer: Question not found: ${category}:${title}`);
      }
    });
  }

  /* ============================================
     PRIVATE - STATE OBSERVATION
     ============================================ */

  #observeState() {
    // Re-render when history changes
    this.#stateManager.subscribe('historyAdded', () => {
      this.render();
    });

    this.#stateManager.subscribe('historyCleared', () => {
      this.render();
    });

    this.#stateManager.subscribe('stateReset', () => {
      this.render();
    });
  }

  /* ============================================
     PRIVATE - RENDERING
     ============================================ */

  /**
   * Create a history item element
   * @private
   * @param {object} item - History entry { category, title, question, timestamp }
   * @returns {HTMLElement} The history item element
   */
  #createHistoryItem(item) {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';

    // Store data attributes for copy handler
    historyItem.dataset.category = item.category;
    historyItem.dataset.title = item.title;
    historyItem.dataset.question = item.question;

    // Format timestamp
    const date = new Date(item.timestamp);
    const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const dateStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

    // Get icon and category key from QuestionService (O(1) instead of O(n²)!)
    const questionData = this.#questionService.getQuestion(item.category, item.title);
    const iconName = questionData?.icon || 'help';
    const categoryKey = questionData?.categoryKey || '';

    historyItem.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="icon-shape ${categoryKey}-card flex-shrink-0">
          <span class="material-symbols-outlined text-2xl">${iconName}</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-gray-900">${item.category}: ${item.title}</p>
          <p class="text-sm text-gray-600 mt-1">${item.question}</p>
          <div class="flex items-center gap-2 mt-2">
            <button class="history-copy-btn">
              <span class="material-symbols-outlined">content_copy</span>
              <span>Copy</span>
            </button>
            <div class="text-xs text-gray-500">
              ${timeStr} • ${dateStr}
            </div>
          </div>
        </div>
      </div>
    `;

    return historyItem;
  }
}
