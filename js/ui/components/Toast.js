/**
 * Toast - Toast notification component
 *
 * Encapsulates toast notification logic with:
 * - Configurable messages
 * - Optional undo button
 * - Auto-hide with timeout
 * - Manual show/hide controls
 */
export class Toast {
  #element;
  #textElement;
  #undoBtn;
  #currentTimeout = null;

  /**
   * Create a new Toast component
   * @param {string} elementId - ID of the toast container element
   */
  constructor(elementId = 'toast') {
    this.#element = document.getElementById(elementId);
    this.#textElement = document.getElementById('toast-text');
    this.#undoBtn = document.getElementById('undo-btn');

    if (!this.#element || !this.#textElement || !this.#undoBtn) {
      console.error('Toast: Required elements not found');
    }
  }

  /* ============================================
     PUBLIC API
     ============================================ */

  /**
   * Show toast notification
   * @param {string} message - The message to display (default: 'COPIED TO CLIPBOARD')
   * @param {boolean} showUndo - Whether to show the undo button (default: false)
   */
  show(message = 'COPIED TO CLIPBOARD', showUndo = false) {
    // Update message
    this.#textElement.textContent = message;

    // Toggle undo button
    if (showUndo) {
      this.#undoBtn.classList.remove('hidden');
      this.#element.classList.add('toast-with-undo');
    } else {
      this.#undoBtn.classList.add('hidden');
      this.#element.classList.remove('toast-with-undo');
    }

    // Show toast
    this.#element.classList.remove('hidden');
    this.#element.classList.add('toast');

    // Clear existing timeout
    if (this.#currentTimeout) {
      clearTimeout(this.#currentTimeout);
    }

    // Auto-hide after delay
    const duration = showUndo ? 4000 : 2000;
    this.#currentTimeout = setTimeout(() => {
      this.hide();
    }, duration);
  }

  /**
   * Hide toast notification
   */
  hide() {
    this.#element.classList.add('hidden');
    this.#element.classList.remove('toast', 'toast-with-undo');

    if (this.#currentTimeout) {
      clearTimeout(this.#currentTimeout);
      this.#currentTimeout = null;
    }
  }

  /**
   * Get the undo button element for attaching event listeners
   * @returns {HTMLElement} The undo button element
   */
  getUndoButton() {
    return this.#undoBtn;
  }
}
