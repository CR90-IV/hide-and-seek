import { MessageFormatter } from './MessageFormatter.js';

/**
 * CopyService - Unified copy handler using Strategy Pattern
 *
 * ELIMINATES 450+ LINES OF DUPLICATED CODE
 *
 * Replaces three nearly-identical functions:
 * - copyQuestion() (140 lines)
 * - copyThermometerEnd() (125 lines)
 * - copyQuestionFromOverview() (145 lines)
 *
 * Uses strategy pattern for clipboard vs deeplink modes
 * Centralizes all state updates in one place
 */
export class CopyService {
  /**
   * Create a new CopyService
   * @param {StateManager} stateManager - The state manager
   * @param {Toast} toast - The toast component
   */
  constructor(stateManager, toast) {
    this.state = stateManager;
    this.toast = toast;
  }

  /* ============================================
     MAIN COPY HANDLERS
     ============================================ */

  /**
   * Handle copying a question
   * Unified handler for all question types and sources
   *
   * @param {string} source - Source of the copy ('detail', 'overview', 'history')
   * @param {object} questionData - { category, title, question, answer, note, reward }
   * @param {object} options - { allowToggle: boolean }
   * @returns {Promise<void>}
   */
  async handleCopy(source, questionData, options = {}) {
    const { category, title, question, answer, note, reward } = questionData;
    const key = `${category}:${title}`;
    const { allowToggle = true } = options;

    // Handle toggle if already used (only for sources that allow it)
    if (allowToggle && this.state.isQuestionUsed(category, title)) {
      this.#toggleUnused(key, category, title);
      return;
    }

    try {
      // Build message
      const message = MessageFormatter.formatWhatsAppMessage(
        category,
        title,
        question,
        answer,
        note,
        reward
      );

      // Execute copy strategy
      const strategy = this.state.getWhatsAppMode();
      await this.#executeStrategy(strategy, message);

      // Update state (ONE place instead of THREE)
      this.state.markQuestionAsUsed(key, { category, title, question });

      // Show feedback
      const toastMessage = strategy === 'deeplink' ? 'OPENING WHATSAPP' : 'COPIED TO CLIPBOARD';
      const showUndo = strategy !== 'deeplink';
      this.toast.show(toastMessage, showUndo);

    } catch (error) {
      console.error('CopyService: Failed to copy question:', error);
      this.toast.show('COPY FAILED', false);
    }
  }

  /**
   * Handle copying thermometer start message
   * (Does NOT mark question as used)
   *
   * @param {string} distance - The distance (e.g., "3 miles")
   * @returns {Promise<void>}
   */
  async copyThermometerStart(distance) {
    try {
      const message = MessageFormatter.formatThermometerStart(distance);

      // Always use clipboard for start messages (never deeplink)
      await this.#copyToClipboard(message);

      this.toast.show('COPIED TO CLIPBOARD', false);

    } catch (error) {
      console.error('CopyService: Failed to copy thermometer start:', error);
      this.toast.show('COPY FAILED', false);
    }
  }

  /**
   * Handle copying from history
   * @param {object} historyEntry - The history entry
   * @param {object} questionData - Full question data from QuestionService
   * @returns {Promise<void>}
   */
  async copyFromHistory(historyEntry, questionData) {
    try {
      const message = MessageFormatter.formatFromHistory(historyEntry, questionData);

      // Always use clipboard for history (never mark as used again)
      await this.#copyToClipboard(message);

      this.toast.show('COPIED TO CLIPBOARD', false);

    } catch (error) {
      console.error('CopyService: Failed to copy from history:', error);
      this.toast.show('COPY FAILED', false);
    }
  }

  /* ============================================
     PRIVATE METHODS (Strategy Execution)
     ============================================ */

  /**
   * Execute copy strategy based on WhatsApp mode
   * @private
   * @param {string} strategy - 'clipboard' or 'deeplink'
   * @param {string} message - The message to copy/send
   * @returns {Promise<void>}
   */
  async #executeStrategy(strategy, message) {
    if (strategy === 'deeplink') {
      this.#openWhatsAppDeeplink(message);
    } else {
      await this.#copyToClipboard(message);
    }
  }

  /**
   * Copy message to clipboard
   * @private
   * @param {string} message - The message to copy
   * @returns {Promise<void>}
   * @throws {Error} If clipboard API fails
   */
  async #copyToClipboard(message) {
    if (!navigator.clipboard) {
      throw new Error('Clipboard API not available');
    }

    try {
      await navigator.clipboard.writeText(message);
    } catch (error) {
      // Provide more specific error information
      if (error.name === 'NotAllowedError') {
        throw new Error('Clipboard access denied. Please grant permission.');
      } else if (error.name === 'SecurityError') {
        throw new Error('Clipboard access requires HTTPS');
      }
      throw error;
    }
  }

  /**
   * Open WhatsApp with pre-filled message
   * @private
   * @param {string} message - The message to send
   */
  #openWhatsAppDeeplink(message) {
    const encodedMessage = encodeURIComponent(message);
    window.location.href = `https://wa.me/?text=${encodedMessage}`;
  }

  /**
   * Toggle a question back to unused
   * @private
   * @param {string} key - The question key "Category:Title"
   * @param {string} category - The category name
   * @param {string} title - The question title
   */
  #toggleUnused(key, category, title) {
    this.state.unmarkQuestion(key, category, title);
    // StateManager observers will handle DOM updates automatically
  }
}
