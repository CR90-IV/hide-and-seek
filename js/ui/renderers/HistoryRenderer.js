import { EventDelegator } from '../../utils/events.js';
import { sentenceCase, setCategoryColours, iconBoxHTML } from '../../utils/dom.js';

/**
 * HistoryRenderer - Renders question history as a GOV.UK summary list
 *
 * Each row: time and date (key), category, title and question (value),
 * and a "Copy" action. Most recent first.
 */
export class HistoryRenderer {
  #container;
  #questionService;
  #copyService;
  #stateManager;
  #events;

  /**
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

  render() {
    this.#container.innerHTML = '';

    const history = this.#stateManager.getHistory();
    if (history.length === 0) {
      return; // CSS :empty shows the empty message
    }

    const list = document.createElement('dl');
    list.className = 'govuk-summary-list';
    [...history].reverse().forEach(item => {
      list.appendChild(this.#createHistoryItem(item));
    });
    this.#container.appendChild(list);
  }

  /* ============================================
     PRIVATE - EVENT DELEGATION
     ============================================ */

  #setupEventDelegation() {
    this.#events.on('.history-copy-btn', 'click', (event, btn) => {
      const { category, title, question } = btn.closest('.history-item').dataset;
      const questionData = this.#questionService.getQuestion(category, title);

      if (questionData) {
        this.#copyService.copyFromHistory({ category, title, question }, questionData);
      } else {
        console.error(`HistoryRenderer: Question not found: ${category}:${title}`);
      }
    });
  }

  /* ============================================
     PRIVATE - STATE OBSERVATION
     ============================================ */

  #observeState() {
    this.#stateManager.subscribe('historyAdded', () => this.render());
    this.#stateManager.subscribe('historyCleared', () => this.render());
    this.#stateManager.subscribe('stateReset', () => this.render());
  }

  /* ============================================
     PRIVATE - RENDERING
     ============================================ */

  #createHistoryItem(item) {
    const row = document.createElement('div');
    row.className = 'govuk-summary-list__row history-item';
    row.dataset.category = item.category;
    row.dataset.title = item.title;
    row.dataset.question = item.question;

    const date = new Date(item.timestamp);
    const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const dateStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

    const questionData = this.#questionService.getQuestion(item.category, item.title);
    const categoryData = questionData ? this.#questionService.getCategoryData(questionData.categoryKey) : null;
    if (categoryData) setCategoryColours(row, categoryData);

    row.innerHTML = `
      <dt class="govuk-summary-list__key">
        ${timeStr}<br><span class="govuk-body-s govuk-!-font-weight-regular">${dateStr}</span>
      </dt>
      <dd class="govuk-summary-list__value">
        <div class="app-history__value">
          ${iconBoxHTML(questionData?.icon)}
          <div>
            <p class="govuk-body govuk-!-font-weight-bold govuk-!-margin-bottom-1">${sentenceCase(item.category)}: ${item.title}</p>
            <p class="govuk-body-s govuk-!-margin-bottom-0">${item.question}</p>
          </div>
        </div>
      </dd>
      <dd class="govuk-summary-list__actions">
        <button type="button" class="govuk-link app-link-button history-copy-btn">
          Copy<span class="govuk-visually-hidden"> ${item.title} question</span>
        </button>
      </dd>
    `;

    return row;
  }
}
