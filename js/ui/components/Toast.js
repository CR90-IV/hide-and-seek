/**
 * Toast - Short confirmation message after a copy
 *
 * Uses the GOV.UK notification banner styles, fixed to the bottom of the screen.
 * - type 'success' (default): green banner
 * - type 'error': blue (default) banner, because the copy did not happen
 */
export class Toast {
  #element;
  #textElement;
  #undoBtn;
  #currentTimeout = null;

  /**
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

  /**
   * @param {string} message - The message to show
   * @param {boolean} showUndo - Show the Undo button
   * @param {'success'|'error'} type - Banner type
   */
  show(message = 'Copied to clipboard', showUndo = false, type = 'success') {
    this.#textElement.textContent = message;
    this.#undoBtn.classList.toggle('hidden', !showUndo);
    this.#element.classList.toggle('govuk-notification-banner--success', type === 'success');
    this.#element.classList.remove('hidden');

    if (this.#currentTimeout) {
      clearTimeout(this.#currentTimeout);
    }

    const duration = showUndo || type === 'error' ? 4000 : 2000;
    this.#currentTimeout = setTimeout(() => this.hide(), duration);
  }

  hide() {
    this.#element.classList.add('hidden');

    if (this.#currentTimeout) {
      clearTimeout(this.#currentTimeout);
      this.#currentTimeout = null;
    }
  }

  /**
   * @returns {HTMLElement} The undo button element
   */
  getUndoButton() {
    return this.#undoBtn;
  }
}
