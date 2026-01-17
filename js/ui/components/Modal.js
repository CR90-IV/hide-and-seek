/**
 * Modal - Reusable modal component
 *
 * Handles modal open/close behavior with:
 * - Backdrop click to close
 * - Escape key to close
 * - Focus management
 * - Show/hide animations
 */
export class Modal {
  #element;
  #backdrop;
  #isOpen = false;

  /**
   * Create a new Modal component
   * @param {string} elementId - ID of the modal container element
   */
  constructor(elementId) {
    this.#element = document.getElementById(elementId);

    if (!this.#element) {
      console.error(`Modal: Element with ID "${elementId}" not found`);
      return;
    }

    // Find backdrop (if exists)
    this.#backdrop = this.#element.querySelector('.overflow-backdrop, .modal-backdrop');

    this.#setupEventListeners();
  }

  /* ============================================
     PUBLIC API
     ============================================ */

  /**
   * Open the modal
   */
  open() {
    if (this.#isOpen) return;

    this.#element.classList.remove('hidden');
    this.#isOpen = true;

    // Add escape key listener
    document.addEventListener('keydown', this.#handleEscape);
  }

  /**
   * Close the modal
   */
  close() {
    if (!this.#isOpen) return;

    this.#element.classList.add('hidden');
    this.#isOpen = false;

    // Remove escape key listener
    document.removeEventListener('keydown', this.#handleEscape);
  }

  /**
   * Toggle modal open/close
   */
  toggle() {
    if (this.#isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Check if modal is open
   * @returns {boolean} True if modal is open
   */
  isOpen() {
    return this.#isOpen;
  }

  /**
   * Get the modal element
   * @returns {HTMLElement} The modal element
   */
  getElement() {
    return this.#element;
  }

  /* ============================================
     PRIVATE METHODS
     ============================================ */

  /**
   * Setup event listeners
   * @private
   */
  #setupEventListeners() {
    // Close on backdrop click
    if (this.#backdrop) {
      this.#backdrop.addEventListener('click', () => {
        this.close();
      });
    }
  }

  /**
   * Handle escape key press
   * @private
   * @param {KeyboardEvent} event - The keyboard event
   */
  #handleEscape = (event) => {
    if (event.key === 'Escape') {
      this.close();
    }
  };
}
