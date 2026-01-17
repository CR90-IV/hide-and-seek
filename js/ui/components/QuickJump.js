import { throttle } from '../../utils/debounce.js';

/**
 * QuickJump - Category navigation component
 *
 * Provides quick navigation dots for jumping to categories
 * with scroll position tracking
 */
export class QuickJump {
  #element;
  #questionsData;
  #gridSelector;
  #categories = ['matching', 'measuring', 'radar', 'thermometer', 'photo', 'tentacle'];
  #throttledUpdate;

  /**
   * Create a new QuickJump component
   * @param {string} elementId - ID of the quick jump container
   * @param {object} questionsData - The questions data structure
   * @param {string} gridSelector - Selector for the questions grid (default: '#questions-grid')
   */
  constructor(elementId, questionsData, gridSelector = '#questions-grid') {
    this.#element = document.getElementById(elementId);
    this.#questionsData = questionsData;
    this.#gridSelector = gridSelector;

    if (!this.#element) {
      console.error(`QuickJump: Element with ID "${elementId}" not found`);
      return;
    }

    // Create throttled update function (100ms)
    this.#throttledUpdate = throttle(this.#updateHighlight.bind(this), 100);

    this.render();
    this.#attachScrollListener();
  }

  /* ============================================
     PUBLIC API
     ============================================ */

  /**
   * Render the quick jump navigation dots
   */
  render() {
    this.#element.innerHTML = '';

    this.#categories.forEach((categoryKey, index) => {
      const categoryData = this.#questionsData[categoryKey];
      if (!categoryData) return;

      const dot = document.createElement('button');
      dot.className = 'quick-jump-dot';
      dot.dataset.category = categoryKey;
      dot.title = categoryData.title;
      dot.setAttribute('aria-label', `Jump to ${categoryData.title}`);

      dot.addEventListener('click', () => this.#scrollToCategory(index));

      this.#element.appendChild(dot);
    });

    // Initial highlight update
    this.#updateHighlight();
  }

  /**
   * Show the quick jump component
   */
  show() {
    this.#element.classList.remove('hidden');
  }

  /**
   * Hide the quick jump component
   */
  hide() {
    this.#element.classList.add('hidden');
  }

  /**
   * Update highlight based on current scroll position
   */
  updateHighlight() {
    this.#updateHighlight();
  }

  /* ============================================
     PRIVATE METHODS
     ============================================ */

  /**
   * Scroll to a specific category section
   * @private
   * @param {number} index - The index of the category section
   */
  #scrollToCategory(index) {
    const sections = document.querySelectorAll(`${this.#gridSelector} > section`);

    if (sections[index]) {
      sections[index].scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Highlight the active dot temporarily
      const dots = this.#element.querySelectorAll('.quick-jump-dot');
      dots.forEach((dot, i) => {
        if (i === index) {
          dot.classList.add('active');
          setTimeout(() => this.#updateHighlight(), 600);
        }
      });
    }
  }

  /**
   * Update dot highlights based on scroll position
   * @private
   */
  #updateHighlight() {
    const sections = document.querySelectorAll(`${this.#gridSelector} > section`);
    const scrollPosition = window.scrollY + 100;

    let activeIndex = 0;
    sections.forEach((section, index) => {
      if (section.offsetTop <= scrollPosition) {
        activeIndex = index;
      }
    });

    // Update dot active states
    const dots = this.#element.querySelectorAll('.quick-jump-dot');
    dots.forEach((dot, index) => {
      if (index === activeIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  /**
   * Attach scroll event listener
   * @private
   */
  #attachScrollListener() {
    window.addEventListener('scroll', this.#throttledUpdate);
  }

  /**
   * Detach scroll event listener (cleanup)
   */
  destroy() {
    window.removeEventListener('scroll', this.#throttledUpdate);
  }
}
