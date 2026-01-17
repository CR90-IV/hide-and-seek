import { EventDelegator } from '../../utils/events.js';

/**
 * OverviewRenderer - Renders the overview grid with icon-based cards
 *
 * Similar to DetailRenderer but with a compact grid layout
 * Shows category-colored icons with checkmarks for used questions
 */
export class OverviewRenderer {
  #container;
  #questionService;
  #copyService;
  #stateManager;
  #events;
  #searchService = null;

  /**
   * Create a new OverviewRenderer
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
   * Render overview grid
   */
  render() {
    this.#container.innerHTML = '';

    const questionsData = this.#questionService.getAllCategories();
    for (const [categoryKey, categoryData] of Object.entries(questionsData)) {
      const section = this.#renderCategory(categoryKey, categoryData);
      this.#container.appendChild(section);
    }
  }

  /**
   * Set the search service for filtering
   * @param {SearchService} searchService - The search service
   */
  setSearchService(searchService) {
    this.#searchService = searchService;

    // Register callback for search results
    this.#searchService.onSearchResults(this.#handleSearchResults.bind(this));
  }

  /* ============================================
     PRIVATE - EVENT DELEGATION
     ============================================ */

  #setupEventDelegation() {
    this.#events.on('.overview-card', 'click', (event, card) => {
      const questionData = this.#extractQuestionData(card);
      this.#copyService.handleCopy('overview', questionData, { allowToggle: true });
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

    // Header
    const header = document.createElement('div');
    header.className = `${categoryKey}-header text-white p-3`;
    header.style.borderRadius = '4px 4px 0 0';
    header.innerHTML = `<h2 class="text-lg font-bold tracking-wide uppercase">${categoryData.title}</h2>`;
    section.appendChild(header);

    // Content
    const content = document.createElement('div');
    content.className = 'bg-white border-2 border-t-0 border-gray-200 p-3';
    content.style.borderRadius = '0 0 4px 4px';

    // Render question groups
    categoryData.questions.forEach(group => {
      if (group.subcategory) {
        const subcategoryHeader = document.createElement('div');
        subcategoryHeader.className = 'overview-subcategory';
        subcategoryHeader.innerHTML = `
          <span class="w-2 h-2 rounded-full bg-current mr-2"></span>
          ${group.subcategory}
        `;
        content.appendChild(subcategoryHeader);
      }

      // Create grid
      const grid = document.createElement('div');
      grid.className = 'overview-grid';

      group.items.forEach(item => {
        const card = this.#createOverviewCard(categoryKey, categoryData, item);
        grid.appendChild(card);
      });

      content.appendChild(grid);
    });

    section.appendChild(content);
    return section;
  }

  #createOverviewCard(categoryKey, categoryData, item) {
    const card = document.createElement('div');
    card.className = `overview-card ${categoryKey}-card cursor-pointer transition-all`;

    // Set data attributes
    card.dataset.category = categoryData.title;
    card.dataset.title = item.title;
    card.dataset.question = item.question;
    card.dataset.answer = item.answer || categoryData.answer;
    card.dataset.note = item.note || '';
    card.dataset.reward = categoryData.reward;

    // Check if used
    const key = `${categoryData.title}:${item.title}`;
    const isUsed = this.#stateManager.isQuestionUsed(categoryData.title, item.title);
    if (isUsed) {
      card.classList.add('overview-card-used');
    }

    card.innerHTML = `
      <div class="overview-card-icon-wrapper">
        <div class="icon-shape ${categoryKey}-card">
          <span class="material-symbols-outlined">${item.icon}</span>
        </div>
        ${isUsed ? '<span class="overview-checkmark material-symbols-outlined">check_circle</span>' : ''}
      </div>
      <div class="overview-card-title">${item.title}</div>
    `;

    return card;
  }

  /* ============================================
     PRIVATE - STATE UPDATES
     ============================================ */

  #updateCardUsedState(category, title, isUsed) {
    const cards = this.#container.querySelectorAll(
      `[data-category="${category}"][data-title="${title}"]`
    );

    cards.forEach(card => {
      if (isUsed) {
        card.classList.add('overview-card-used');
        // Add checkmark
        const iconWrapper = card.querySelector('.overview-card-icon-wrapper');
        if (iconWrapper && !card.querySelector('.overview-checkmark')) {
          const checkmark = document.createElement('span');
          checkmark.className = 'overview-checkmark material-symbols-outlined';
          checkmark.textContent = 'check_circle';
          iconWrapper.appendChild(checkmark);
        }
      } else {
        card.classList.remove('overview-card-used');
        // Remove checkmark
        const checkmark = card.querySelector('.overview-checkmark');
        if (checkmark) {
          checkmark.remove();
        }
      }
    });
  }

  /* ============================================
     PRIVATE - SEARCH/FILTER
     ============================================ */

  /**
   * Handle search results (show/hide cards based on matches)
   * @private
   * @param {object} results - { matches: Set, total: number, query: string }
   */
  #handleSearchResults({ matches, total, query }) {
    if (!query) {
      // Show all cards and sections
      this.#showAllCards();
      return;
    }

    // Filter cards based on matches
    const cards = this.#container.querySelectorAll('.overview-card');

    cards.forEach(card => {
      const key = `${card.dataset.category}:${card.dataset.title}`;
      if (matches.has(key)) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });

    // Hide empty sections
    this.#container.querySelectorAll('section').forEach(section => {
      const visibleCards = section.querySelectorAll('.overview-card:not([style*="display: none"])');
      if (visibleCards.length === 0) {
        section.style.display = 'none';
      } else {
        section.style.display = '';
      }
    });
  }

  /**
   * Show all cards (clear search filter)
   * @private
   */
  #showAllCards() {
    this.#container.querySelectorAll('.overview-card').forEach(card => {
      card.style.display = '';
    });
    this.#container.querySelectorAll('section').forEach(section => {
      section.style.display = '';
    });
  }

  /* ============================================
     PRIVATE - HELPERS
     ============================================ */

  #extractQuestionData(element) {
    const { category, title, question, answer, note, reward } = element.dataset;
    return { category, title, question, answer, note, reward };
  }
}
