import { EventDelegator } from '../../utils/events.js';
import { sentenceCase, setCategoryColours, iconBoxHTML, updateProgress } from '../../utils/dom.js';

/**
 * DetailRenderer - Renders the Questions view in the GOV.UK Design System style
 *
 * Each category is a section with:
 * - a band in the category colour: icon, heading, progress count,
 *   question pattern and tags (answer type, time and reward)
 * - inset text for the category note
 * - a task list where each row has an icon in the category colour,
 *   the question title (button), the full question text in small type,
 *   any note, and an "Asked" status. Asked rows are grey.
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
      this.#copyService.copyThermometerStart(this.#extractQuestionData(btn.closest('.app-question')));
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
    setCategoryColours(section, categoryData);

    const tagsHTML = categoryData.badges
      .map(badge => `<strong class="govuk-tag">${sentenceCase(badge)}</strong>`)
      .join('');

    section.innerHTML = `
      <div class="app-band">
        <div class="app-band__title-row">
          <span class="app-icon" aria-hidden="true">${categoryData.icon || 'help'}</span>
          <h2 class="govuk-heading-l app-band__heading">${sentenceCase(categoryData.title)}</h2>
          <span class="app-band__progress"></span>
        </div>
        <p class="govuk-body-l app-band__description">${categoryData.description}</p>
        <div class="app-band__tags">${tagsHTML}</div>
      </div>
      ${this.#categoryNoteHTML(categoryData)}
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
  }

  #createQuestionRow(categoryData, item) {
    const id = `question-${++this.#rowId}`;
    const row = document.createElement('li');
    row.className = 'govuk-task-list__item govuk-task-list__item--with-link app-question';
    this.#setRowData(row, categoryData, item);

    const hint = [item.fill, item.note].filter(Boolean).join('<br>');

    row.innerHTML = `
      ${iconBoxHTML(item.icon)}
      <div class="govuk-task-list__name-and-hint">
        <button type="button" class="govuk-task-list__link app-question__button"
                aria-describedby="${id}-question ${hint ? `${id}-hint ` : ''}${id}-status">${item.title}</button>
        <p id="${id}-question" class="app-question__text">${item.question}</p>
        ${hint ? `<div id="${id}-hint" class="govuk-task-list__hint app-question__note">${hint}</div>` : ''}
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
      ${iconBoxHTML(item.icon)}
      <div class="govuk-task-list__name-and-hint">
        <p class="govuk-body govuk-!-font-weight-bold govuk-!-margin-bottom-0 app-thermometer__title">${item.title}</p>
        <p class="app-question__text">${item.question}</p>
        ${item.note ? `<div class="govuk-task-list__hint app-question__note">${item.note}</div>` : ''}
        <div class="app-thermometer__actions">
          <button type="button" class="govuk-button govuk-button--secondary thermometer-btn start-btn"
                 >
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

  /**
   * Rules for the hider (also in every message) and help for the seekers
   */
  #categoryNoteHTML(categoryData) {
    const rules = categoryData.rules || [];
    const parts = [];
    if (categoryData.seekerNote) {
      parts.push(`<p class="govuk-body">${categoryData.seekerNote}</p>`);
    }
    if (rules.length) {
      parts.push(`<p class="govuk-body govuk-!-font-weight-bold govuk-!-margin-bottom-1">Rules for the hider</p>`);
      parts.push(`<ul class="govuk-list govuk-list--bullet govuk-!-margin-bottom-0">${rules.map(r => `<li>${r}</li>`).join('')}</ul>`);
    }
    return parts.length ? `<div class="govuk-inset-text">${parts.join('')}</div>` : '';
  }

  #createRulesSection() {
    const section = document.createElement('section');
    section.className = 'app-category';
    section.id = 'category-rules';
    section.innerHTML = `
      <h2 class="govuk-heading-l">General rules</h2>
      <ul class="govuk-list govuk-list--bullet">
        <li>Ask one question at a time. Wait for the answer before you ask the next one.</li>
        <li>The hider must tell the truth.</li>
        <li>Ignore places outside the game area.</li>
        <li>After each answer, the hider draws cards. Each question says how many.</li>
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
      status.innerHTML = isUsed ? '<strong class="govuk-tag govuk-tag--grey">Asked</strong>' : '';
    }
  }

  #applyUsedState() {
    const usedQuestions = this.#stateManager.getUsedQuestions();
    this.#container.querySelectorAll('.app-question').forEach(row => {
      this.#setRowUsed(row, usedQuestions.has(`${row.dataset.category}:${row.dataset.title}`));
    });
    updateProgress(this.#container, '.app-question', 'app-question--used');
  }

  #updateCardUsedState(category, title, isUsed) {
    this.#container.querySelectorAll('.app-question').forEach(row => {
      if (row.dataset.category === category && row.dataset.title === title) {
        this.#setRowUsed(row, isUsed);
      }
    });
    updateProgress(this.#container, '.app-question', 'app-question--used');
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
    const { category, title } = element.dataset;
    return { category, title };
  }
}
