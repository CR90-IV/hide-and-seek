import { EventDelegator } from '../../utils/events.js';
import { sentenceCase } from '../../utils/dom.js';

/**
 * DetailRenderer - Renders the Questions view in the GOV.UK Design System style
 *
 * Each category is a section with:
 * - a heading with the category colour as a left border
 * - grey tags for the answer type, time and reward
 * - inset text for the category note
 * - a task list where each row is a question (button) with an "Asked" status
 *
 * Event delegation: one listener on the container handles all rows and buttons.
 */
export class DetailRenderer {
  #container;
  #questionService;
  #copyService;
  #stateManager;
  #events;
  #searchService = null;
  #rowId = 0;

  /**
   * @param {HTMLElement} container - The container element for the questions
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
    this.#rowId = 0;

    const questionsData = this.#questionService.getAllCategories();
    for (const [categoryKey, categoryData] of Object.entries(questionsData)) {
      this.#container.appendChild(this.#renderCategory(categoryKey, categoryData));
    }

    this.#container.appendChild(this.#createRulesSection());
    this.#applyUsedState();
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
    // Regular question rows
    this.#events.on('.app-question__button', 'click', (event, btn) => {
      const row = btn.closest('.app-question');
      this.#copyService.handleCopy('detail', this.#extractQuestionData(row), { allowToggle: true });
    });

    // Thermometer END buttons
    this.#events.on('.thermometer-btn.end-btn', 'click', (event, btn) => {
      event.stopPropagation();
      const row = btn.closest('.app-question');
      this.#copyService.handleCopy('detail', this.#extractQuestionData(row), { allowToggle: false });
    });

    // Thermometer START buttons
    this.#events.on('.thermometer-btn.start-btn', 'click', (event, btn) => {
      event.stopPropagation();
      this.#copyService.copyThermometerStart(btn.dataset.distance);
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
      this.#applyUsedState();
    });
  }

  /* ============================================
     PRIVATE - RENDERING
     ============================================ */

  #renderCategory(categoryKey, categoryData) {
    const section = document.createElement('section');
    section.className = 'app-category';
    section.id = `category-${categoryKey}`;
    section.dataset.categoryKey = categoryKey;
    section.style.setProperty('--app-category-colour', categoryData.color);

    const tagsHTML = categoryData.badges
      .map(badge => `<strong class="govuk-tag govuk-tag--grey">${sentenceCase(badge)}</strong>`)
      .join('');

    section.innerHTML = `
      <h2 class="govuk-heading-l app-category__heading">${sentenceCase(categoryData.title)}</h2>
      <p class="govuk-body">${categoryData.description}</p>
      <div class="app-category__tags">${tagsHTML}</div>
      ${categoryData.note ? `<div class="govuk-inset-text">${categoryData.note}</div>` : ''}
    `;

    categoryData.questions.forEach(group => {
      if (group.subcategory) {
        const subheading = document.createElement('h3');
        subheading.className = 'govuk-heading-m govuk-!-margin-top-6';
        subheading.textContent = group.subcategory;
        section.appendChild(subheading);
      }

      const list = document.createElement('ul');
      list.className = 'govuk-task-list';
      group.items.forEach(item => {
        list.appendChild(
          categoryKey === 'thermometer'
            ? this.#createThermometerRow(categoryData, item)
            : this.#createQuestionRow(categoryData, item)
        );
      });
      section.appendChild(list);
    });

    return section;
  }

  /**
   * Set the data attributes the copy service needs on a row
   */
  #setRowData(row, categoryData, item) {
    row.dataset.category = categoryData.title;
    row.dataset.title = item.title;
    row.dataset.question = item.question;
    row.dataset.answer = item.answer || categoryData.answer;
    row.dataset.note = item.note || '';
    row.dataset.reward = categoryData.reward;
  }

  #createQuestionRow(categoryData, item) {
    const id = `question-${++this.#rowId}`;
    const row = document.createElement('li');
    row.className = 'govuk-task-list__item govuk-task-list__item--with-link app-question';
    this.#setRowData(row, categoryData, item);

    const hint = item.note || item.subtitle || '';

    row.innerHTML = `
      <div class="govuk-task-list__name-and-hint">
        <button type="button" class="govuk-task-list__link app-question__button"
                aria-describedby="${hint ? `${id}-hint ` : ''}${id}-status">${item.title}</button>
        ${hint ? `<div id="${id}-hint" class="govuk-task-list__hint">${hint}</div>` : ''}
      </div>
      <div class="govuk-task-list__status" id="${id}-status"></div>
    `;

    return row;
  }

  #createThermometerRow(categoryData, item) {
    const id = `question-${++this.#rowId}`;
    const row = document.createElement('li');
    row.className = 'govuk-task-list__item app-question app-thermometer';
    this.#setRowData(row, categoryData, item);

    row.innerHTML = `
      <div class="govuk-task-list__name-and-hint">
        <p class="govuk-body govuk-!-font-weight-bold govuk-!-margin-bottom-0">${item.title}</p>
        ${item.note ? `<div class="govuk-task-list__hint">${item.note}</div>` : ''}
        <div class="app-thermometer__actions">
          <button type="button" class="govuk-button govuk-button--secondary thermometer-btn start-btn"
                  data-distance="${item.title}">
            Start<span class="govuk-visually-hidden"> ${item.title}</span>
          </button>
          <button type="button" class="govuk-button govuk-button--secondary thermometer-btn end-btn"
                  aria-describedby="${id}-status">
            End<span class="govuk-visually-hidden"> ${item.title}</span>
          </button>
        </div>
      </div>
      <div class="govuk-task-list__status" id="${id}-status"></div>
    `;

    return row;
  }

  #createRulesSection() {
    const section = document.createElement('section');
    section.className = 'app-category';
    section.id = 'category-rules';
    section.innerHTML = `
      <h2 class="govuk-heading-l app-category__heading">General rules</h2>
      <ul class="govuk-list govuk-list--bullet">
        <li>Ask questions one at a time.</li>
        <li>Hiders must answer truthfully.</li>
        <li>The hider has 5 minutes to answer, unless the question says a different time.</li>
        <li>The hider gets the card reward after each question.</li>
      </ul>
    `;
    return section;
  }

  /* ============================================
     PRIVATE - STATE UPDATES
     ============================================ */

  #setRowUsed(row, isUsed) {
    row.classList.toggle('app-question--used', isUsed);
    const status = row.querySelector('.govuk-task-list__status');
    if (status) {
      status.innerHTML = isUsed ? '<strong class="govuk-tag govuk-tag--green">Asked</strong>' : '';
    }
  }

  #applyUsedState() {
    const usedQuestions = this.#stateManager.getUsedQuestions();
    this.#container.querySelectorAll('.app-question').forEach(row => {
      this.#setRowUsed(row, usedQuestions.has(`${row.dataset.category}:${row.dataset.title}`));
    });
  }

  #updateCardUsedState(category, title, isUsed) {
    this.#container.querySelectorAll('.app-question').forEach(row => {
      if (row.dataset.category === category && row.dataset.title === title) {
        this.#setRowUsed(row, isUsed);
      }
    });
  }

  /* ============================================
     PRIVATE - SEARCH/FILTER
     ============================================ */

  #handleSearchResults({ matches, query }) {
    if (!query) {
      this.#showAllCards();
      return;
    }

    this.#container.querySelectorAll('.app-question').forEach(row => {
      row.classList.toggle('hidden', !matches.has(`${row.dataset.category}:${row.dataset.title}`));
    });

    // Hide lists, subheadings and sections with no visible questions
    this.#container.querySelectorAll('.govuk-task-list').forEach(list => {
      const empty = !list.querySelector('.app-question:not(.hidden)');
      list.classList.toggle('hidden', empty);
      const prev = list.previousElementSibling;
      if (prev && prev.tagName === 'H3') prev.classList.toggle('hidden', empty);
    });

    this.#container.querySelectorAll('section').forEach(section => {
      section.classList.toggle('hidden', !section.querySelector('.app-question:not(.hidden)'));
    });
  }

  #showAllCards() {
    this.#container.querySelectorAll('.hidden').forEach(el => el.classList.remove('hidden'));
  }

  /* ============================================
     PRIVATE - HELPERS
     ============================================ */

  #extractQuestionData(element) {
    const { category, title, question, answer, note, reward } = element.dataset;
    return { category, title, question, answer, note, reward };
  }
}
