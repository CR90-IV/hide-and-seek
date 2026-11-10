import { EventDelegator } from '../../utils/events.js';
import { sentenceCase, setCategoryColours, iconBoxHTML, updateProgress } from '../../utils/dom.js';

/**
 * OverviewRenderer - Renders all questions as a compact grid of icon tiles
 *
 * Each category starts with a short band in its colour. Asked questions
 * are grey with a tick.
 * Select an asked question again to mark it as not asked.
 */
export class OverviewRenderer {
  #container;
  #questionService;
  #copyService;
  #stateManager;
  #events;
  #searchService = null;

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

    const questionsData = this.#questionService.getAllCategories();
    for (const [categoryKey, categoryData] of Object.entries(questionsData)) {
      this.#container.appendChild(this.#renderCategory(categoryKey, categoryData));
    }
    updateProgress(this.#container, '.overview-card', 'app-overview-card--used');
  }

  /**
   * @param {SearchService} searchService - The search service
   */
  setSearchService(searchService) {
    this.#searchService = searchService;
    this.#searchService.onSearchResults(this.#handleSearchResults.bind(this));
  }

  /* ============================================
     PRIVATE - EVENT DELEGATION
     ============================================ */

  #setupEventDelegation() {
    this.#events.on('.overview-card', 'click', (event, card) => {
      this.#copyService.handleCopy('overview', this.#extractQuestionData(card), { allowToggle: true });
    });
  }

  /* ============================================
     PRIVATE - STATE OBSERVATION
     ============================================ */

  #observeState() {
    this.#stateManager.subscribe('questionMarkedUsed', ({ category, title }) => {
      this.#updateCardUsedState(category, title, true);
    });

    this.#stateManager.subscribe('questionUnmarked', ({ category, title }) => {
      this.#updateCardUsedState(category, title, false);
    });

    this.#stateManager.subscribe('stateReset', () => {
      this.render();
    });
  }

  /* ============================================
     PRIVATE - RENDERING
     ============================================ */

  #renderCategory(categoryKey, categoryData) {
    const section = document.createElement('section');
    section.className = 'app-overview-category';
    section.dataset.categoryKey = categoryKey;
    setCategoryColours(section, categoryData);

    section.innerHTML = `
      <div class="app-band app-band--compact">
        <div class="app-band__title-row">
          <span class="app-icon" aria-hidden="true">${categoryData.icon || 'help'}</span>
          <h2 class="govuk-heading-m app-band__heading">${sentenceCase(categoryData.title)}</h2>
          <span class="app-band__progress"></span>
        </div>
      </div>
    `;

    categoryData.questions.forEach(group => {
      if (group.subcategory) {
        const subheading = document.createElement('h3');
        subheading.className = 'govuk-heading-s govuk-!-margin-bottom-2';
        subheading.textContent = group.subcategory;
        section.appendChild(subheading);
      }

      const grid = document.createElement('div');
      grid.className = 'app-overview-grid';
      group.items.forEach(item => {
        grid.appendChild(this.#createOverviewCard(categoryData, item));
      });
      section.appendChild(grid);
    });

    return section;
  }

  #createOverviewCard(categoryData, item) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'govuk-button govuk-button--secondary overview-card app-overview-card';

    card.dataset.category = categoryData.title;
    card.dataset.title = item.title;

    card.innerHTML = `
      ${iconBoxHTML(item.icon)}
      <span>${item.title}</span>
      <span class="govuk-visually-hidden app-overview-card__status"></span>
    `;
    this.#setCardUsed(card, this.#stateManager.isQuestionUsed(categoryData.title, item.title));

    return card;
  }

  /* ============================================
     PRIVATE - STATE UPDATES
     ============================================ */

  #setCardUsed(card, isUsed) {
    card.classList.toggle('app-overview-card--used', isUsed);
    card.setAttribute('aria-pressed', String(isUsed));
    const status = card.querySelector('.app-overview-card__status');
    if (status) status.textContent = isUsed ? ' (asked)' : '';

    let tick = card.querySelector('.app-overview-card__tick');
    if (isUsed && !tick) {
      tick = document.createElement('span');
      tick.className = 'app-icon app-overview-card__tick';
      tick.setAttribute('aria-hidden', 'true');
      tick.textContent = 'check';
      card.appendChild(tick);
    } else if (!isUsed && tick) {
      tick.remove();
    }
  }

  #updateCardUsedState(category, title, isUsed) {
    this.#container.querySelectorAll('.overview-card').forEach(card => {
      if (card.dataset.category === category && card.dataset.title === title) {
        this.#setCardUsed(card, isUsed);
      }
    });
    updateProgress(this.#container, '.overview-card', 'app-overview-card--used');
  }

  /* ============================================
     PRIVATE - SEARCH/FILTER
     ============================================ */

  #handleSearchResults({ matches, query }) {
    if (!query) {
      this.#container.querySelectorAll('.hidden').forEach(el => el.classList.remove('hidden'));
      return;
    }

    this.#container.querySelectorAll('.overview-card').forEach(card => {
      card.classList.toggle('hidden', !matches.has(`${card.dataset.category}:${card.dataset.title}`));
    });

    this.#container.querySelectorAll('.app-overview-grid').forEach(grid => {
      const empty = !grid.querySelector('.overview-card:not(.hidden)');
      grid.classList.toggle('hidden', empty);
      const prev = grid.previousElementSibling;
      if (prev && prev.tagName === 'H3') prev.classList.toggle('hidden', empty);
    });

    this.#container.querySelectorAll('section').forEach(section => {
      section.classList.toggle('hidden', !section.querySelector('.overview-card:not(.hidden)'));
    });
  }

  /* ============================================
     PRIVATE - HELPERS
     ============================================ */

  #extractQuestionData(element) {
    const { category, title } = element.dataset;
    return { category, title };
  }
}
