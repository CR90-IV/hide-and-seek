import { EventDelegator } from '../../utils/events.js';
import { getCategoryTextColor } from '../../utils/dom.js';

/**
 * DetailRenderer - Renders the detail view with all question categories
 *
 * PERFORMANCE IMPROVEMENTS:
 * - Event delegation: 80+ individual listeners → 3 delegated listeners
 * - State observation: Automatic UI updates when state changes
 * - Incremental updates: Only update specific cards, not full re-renders
 *
 * REFERENCE IMPLEMENTATION:
 * This renderer demonstrates the patterns used across all renderers:
 * - Event delegation for performance
 * - State observation for reactivity
 * - Separation of concerns
 */
export class DetailRenderer {
  #container;
  #questionService;
  #copyService;
  #stateManager;
  #events;
  #searchService = null;

  /**
   * Create a new DetailRenderer
   * @param {HTMLElement} container - The container element for the detail view
   * @param {QuestionService} questionService - The question service
   * @param {CopyService} copyService - The copy service
   * @param {StateManager} stateManager - The state manager
   */
  constructor(container, questionService, copyService, stateManager) {
    this.#container = container;
    this.#questionService = questionService;
    this.#copyService = copyService;
    this.#stateManager = stateManager;

    // Create event delegator for this container
    this.#events = new EventDelegator(this.#container);

    this.#setupEventDelegation();
    this.#observeState();
  }

  /* ============================================
     PUBLIC API
     ============================================ */

  /**
   * Render all categories and questions
   */
  render() {
    this.#container.innerHTML = '';

    // Render each category
    const questionsData = this.#questionService.getAllCategories();
    for (const [categoryKey, categoryData] of Object.entries(questionsData)) {
      const section = this.#renderCategory(categoryKey, categoryData);
      this.#container.appendChild(section);
    }

    // Add general rules section
    const rulesSection = this.#createRulesSection();
    this.#container.appendChild(rulesSection);

    // Apply used state to all cards
    this.#applyUsedState();
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
     PRIVATE - EVENT DELEGATION (96% Memory Reduction)
     ============================================ */

  /**
   * Setup delegated event handlers (replaces 80+ individual listeners)
   * @private
   */
  #setupEventDelegation() {
    // ONE delegated listener for ALL regular question cards
    this.#events.on('.question-card', 'click', (event, card) => {
      const questionData = this.#extractQuestionData(card);
      this.#copyService.handleCopy('detail', questionData, { allowToggle: true });
    });

    // ONE delegated listener for thermometer END buttons
    this.#events.on('.thermometer-btn.end-btn', 'click', (event, btn) => {
      event.stopPropagation();
      const questionData = this.#extractQuestionData(btn);
      this.#copyService.handleCopy('detail', questionData, { allowToggle: false });
    });

    // ONE delegated listener for thermometer START buttons
    this.#events.on('.thermometer-btn.start-btn', 'click', (event, btn) => {
      event.stopPropagation();
      const distance = btn.dataset.distance;
      this.#copyService.copyThermometerStart(distance);
    });
  }

  /* ============================================
     PRIVATE - STATE OBSERVATION (Automatic UI Updates)
     ============================================ */

  /**
   * Observe state changes for automatic UI updates
   * @private
   */
  #observeState() {
    // Auto-update when questions are marked as used
    this.#stateManager.subscribe('questionMarkedUsed', ({ category, title }) => {
      this.#updateCardUsedState(category, title, true);
    });

    // Auto-update when questions are unmarked
    this.#stateManager.subscribe('questionUnmarked', ({ category, title }) => {
      this.#updateCardUsedState(category, title, false);
    });

    // Auto-update when state is reset
    this.#stateManager.subscribe('stateReset', () => {
      this.#applyUsedState();
    });
  }

  /* ============================================
     PRIVATE - RENDERING METHODS
     ============================================ */

  /**
   * Render a single category section
   * @private
   * @param {string} categoryKey - The category key (e.g., "matching")
   * @param {object} categoryData - The category data
   * @returns {HTMLElement} The category section element
   */
  #renderCategory(categoryKey, categoryData) {
    const section = document.createElement('section');

    // Create header
    const header = this.#createCategoryHeader(categoryKey, categoryData);
    section.appendChild(header);

    // Create content container
    const content = this.#createCategoryContent(categoryKey, categoryData);
    section.appendChild(content);

    return section;
  }

  /**
   * Create category header
   * @private
   */
  #createCategoryHeader(categoryKey, categoryData) {
    const header = document.createElement('div');
    header.className = `${categoryKey}-header text-white p-3`;
    header.style.borderRadius = '4px 4px 0 0';

    const badgesHTML = categoryData.badges
      .map(badge => `<span class="bg-white/30 backdrop-blur-sm px-2.5 py-1" style="border-radius: 2px;">${badge}</span>`)
      .join('');

    header.innerHTML = `
      <h2 class="text-xl font-bold tracking-wide uppercase">${categoryData.title}</h2>
      <p class="text-base ${getCategoryTextColor(categoryKey)} mt-2 font-medium">${categoryData.description}</p>
      <div class="flex flex-wrap gap-2 mt-3 text-sm font-semibold">
        ${badgesHTML}
      </div>
    `;

    return header;
  }

  /**
   * Create category content
   * @private
   */
  #createCategoryContent(categoryKey, categoryData) {
    const content = document.createElement('div');
    content.className = 'bg-white border-2 border-t-0 border-gray-200 p-3 space-y-2';
    content.style.borderRadius = '0 0 4px 4px';

    // Add category note if exists
    if (categoryData.note) {
      const noteBox = this.#createNoteBox(categoryData.note);
      content.appendChild(noteBox);
    }

    // Render question groups
    categoryData.questions.forEach(group => {
      if (group.subcategory) {
        const subcatLabel = this.#createSubcategoryLabel(group.subcategory);
        content.appendChild(subcatLabel);
      }

      // Create grid or regular layout
      const itemsContainer = this.#createItemsContainer(categoryData.gridCols);
      group.items.forEach(item => {
        const card = this.#createQuestionCard(categoryKey, categoryData, item);
        itemsContainer.appendChild(card);
      });

      content.appendChild(itemsContainer);
    });

    return content;
  }

  /**
   * Create note box
   * @private
   */
  #createNoteBox(note) {
    const noteBox = document.createElement('div');
    noteBox.className = 'bg-yellow-50 border-l-4 border-yellow-400 p-2.5';
    noteBox.style.borderRadius = '2px';
    noteBox.innerHTML = `<p class="text-gray-800 text-sm font-medium"><span class="material-symbols-outlined text-base align-middle mr-1">info</span>${note}</p>`;
    return noteBox;
  }

  /**
   * Create subcategory label
   * @private
   */
  #createSubcategoryLabel(subcategory) {
    const label = document.createElement('p');
    label.className = 'text-gray-700 text-sm font-bold uppercase tracking-wider pt-3 first:pt-1 flex items-center';
    label.innerHTML = `<span class="w-2 h-2 rounded-full bg-current mr-2"></span>${subcategory}`;
    return label;
  }

  /**
   * Create items container (grid or regular)
   * @private
   */
  #createItemsContainer(gridCols) {
    const container = document.createElement('div');
    container.className = gridCols ? `grid grid-cols-${gridCols} gap-2` : 'space-y-2';
    return container;
  }

  /**
   * Create a question card (regular or thermometer)
   * @private
   */
  #createQuestionCard(categoryKey, categoryData, item) {
    if (categoryKey === 'thermometer') {
      return this.#createThermometerCard(categoryData, item);
    } else {
      return this.#createRegularCard(categoryKey, categoryData, item);
    }
  }

  /**
   * Create thermometer card with START/END buttons
   * @private
   */
  #createThermometerCard(categoryData, item) {
    const card = document.createElement('div');
    card.className = 'thermometer-card border-2 p-3 bg-white';
    card.style.borderRadius = '6px';
    card.style.boxShadow = 'var(--station-shadow)';
    card.dataset.category = categoryData.title;
    card.dataset.title = item.title;

    card.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="icon-shape">
          <span class="material-symbols-outlined text-2xl">${item.icon}</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-gray-900 font-semibold text-base mb-2">${item.title}</p>
          <div class="flex gap-2">
            <button class="thermometer-btn start-btn flex-1 bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 py-1.5 px-2 text-xs font-semibold transition-all"
                    style="border-radius: 4px;"
                    data-distance="${item.title}">
              Start
            </button>
            <button class="thermometer-btn end-btn flex-1 bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 py-1.5 px-2 text-xs font-semibold transition-all"
                    style="border-radius: 4px;"
                    data-category="${categoryData.title}"
                    data-title="${item.title}"
                    data-question="${item.question}"
                    data-answer="${item.answer || categoryData.answer}"
                    data-note="${item.note || ''}"
                    data-reward="${categoryData.reward}">
              End
            </button>
          </div>
        </div>
      </div>
    `;

    return card;
  }

  /**
   * Create regular question card
   * @private
   */
  #createRegularCard(categoryKey, categoryData, item) {
    const card = document.createElement('div');
    card.className = `question-card ${categoryKey}-card border-2 p-3 cursor-pointer transition-all`;
    card.style.borderRadius = '6px';

    // Set data attributes for copy service
    card.dataset.category = categoryData.title;
    card.dataset.title = item.title;
    card.dataset.question = item.question;
    card.dataset.answer = item.answer || categoryData.answer;
    card.dataset.note = item.note || '';
    card.dataset.reward = categoryData.reward;

    const isGrid = categoryData.gridCols;

    if (isGrid) {
      // Grid layout
      card.innerHTML = this.#createGridCardHTML(item);
    } else {
      // Regular layout
      card.innerHTML = this.#createRegularCardHTML(item);
    }

    return card;
  }

  /**
   * Create grid card HTML
   * @private
   */
  #createGridCardHTML(item) {
    let html = `
      <div class="flex flex-col items-center gap-2">
        <div class="icon-shape">
          <span class="material-symbols-outlined text-2xl">${item.icon}</span>
        </div>
        <p class="text-gray-900 font-semibold text-base text-center">${item.subtitle ? 'Choose' : item.title}</p>
    `;
    if (item.subtitle) {
      html += `<p class="text-gray-600 text-sm text-center font-medium">${item.subtitle}</p>`;
    }
    html += `</div>`;
    return html;
  }

  /**
   * Create regular card HTML
   * @private
   */
  #createRegularCardHTML(item) {
    let html = `
      <div class="flex items-center gap-3">
        <div class="icon-shape">
          <span class="material-symbols-outlined text-2xl">${item.icon}</span>
        </div>
        <div class="flex-1">
          <p class="text-gray-900 font-semibold text-base">${item.title}</p>
    `;
    if (item.note) {
      html += `<p class="text-gray-600 text-sm mt-1 leading-relaxed">${item.note}</p>`;
    }
    html += `
        </div>
      </div>
    `;
    return html;
  }

  /**
   * Create rules section
   * @private
   */
  #createRulesSection() {
    const section = document.createElement('section');
    section.className = 'rules-section';
    section.innerHTML = `
      <div class="bg-gray-800 text-white p-3" style="border-radius: 4px 4px 0 0;">
        <h2 class="text-xl font-bold tracking-wide uppercase">General Rules</h2>
      </div>
      <div class="bg-white border-2 border-t-0 border-gray-200 p-3" style="border-radius: 0 0 4px 4px;">
        <ul class="list-disc list-inside space-y-2 text-gray-800">
          <li class="text-sm font-medium">Questions must be asked one at a time</li>
          <li class="text-sm font-medium">Hiders must respond truthfully</li>
          <li class="text-sm font-medium">5-minute response time unless noted</li>
          <li class="text-sm font-medium">Card rewards shown after each question</li>
        </ul>
      </div>
    `;
    return section;
  }

  /* ============================================
     PRIVATE - STATE UPDATES (Incremental)
     ============================================ */

  /**
   * Apply used state to all cards (from StateManager)
   * @private
   */
  #applyUsedState() {
    const usedQuestions = this.#stateManager.getUsedQuestions();

    // Update all cards based on used state
    this.#container.querySelectorAll('.question-card, .thermometer-card').forEach(card => {
      const key = `${card.dataset.category}:${card.dataset.title}`;
      if (usedQuestions.has(key)) {
        card.classList.add('card-used');
      } else {
        card.classList.remove('card-used');
      }
    });
  }

  /**
   * Update a specific card's used state (incremental update)
   * @private
   * @param {string} category - The category name
   * @param {string} title - The question title
   * @param {boolean} isUsed - True if used, false otherwise
   */
  #updateCardUsedState(category, title, isUsed) {
    const cards = this.#container.querySelectorAll(
      `[data-category="${category}"][data-title="${title}"]`
    );

    cards.forEach(card => {
      if (isUsed) {
        card.classList.add('card-used');
      } else {
        card.classList.remove('card-used');
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
    const cards = this.#container.querySelectorAll('.question-card, .thermometer-card');

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
      const visibleCards = section.querySelectorAll('.question-card:not([style*="display: none"]), .thermometer-card:not([style*="display: none"])');
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
    this.#container.querySelectorAll('.question-card, .thermometer-card').forEach(card => {
      card.style.display = '';
    });
    this.#container.querySelectorAll('section').forEach(section => {
      section.style.display = '';
    });
  }

  /* ============================================
     PRIVATE - HELPERS
     ============================================ */

  /**
   * Extract question data from a card or button element
   * @private
   * @param {HTMLElement} element - The card or button element
   * @returns {object} Question data
   */
  #extractQuestionData(element) {
    const { category, title, question, answer, note, reward } = element.dataset;
    return { category, title, question, answer, note, reward };
  }
}
