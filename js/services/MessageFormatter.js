/**
 * MessageFormatter - WhatsApp message formatting service
 *
 * Eliminates 5 duplications of message formatting logic (~150 lines)
 * Provides consistent message formatting across the application
 */
export class MessageFormatter {
  /**
   * Format a WhatsApp message for a question
   * @param {string} category - The category name (e.g., "MATCHING")
   * @param {string} title - The question title
   * @param {string} question - The question text
   * @param {string} answer - The answer format
   * @param {string|null} note - Optional note
   * @param {string} reward - The reward text
   * @returns {string} Formatted WhatsApp message
   *
   * @example
   * MessageFormatter.formatWhatsAppMessage(
   *   "RADAR",
   *   "1 mile",
   *   "Are you within 1 mile of me?",
   *   "YES or NO",
   *   null,
   *   "Draw 2, keep 1"
   * );
   * // Returns:
   * // *RADAR: 1 mile*
   * // Are you within 1 mile of me?
   * // Answer: YES or NO
   * // Reward: Draw 2, keep 1
   */
  static formatWhatsAppMessage(category, title, question, answer, note, reward) {
    let message = `*${category}: ${title}*\n`;
    message += `${question}\n`;
    message += `Answer: ${answer}\n`;

    if (note) {
      const plainTextNote = this.#convertLinksToPlainText(note);
      message += `_${plainTextNote}_\n`;
    }

    message += `Reward: ${reward}`;

    return message;
  }

  /**
   * Format a thermometer start message
   * @param {string} distance - The distance (e.g., "3 miles")
   * @returns {string} Formatted start message
   *
   * @example
   * MessageFormatter.formatThermometerStart("3 miles");
   * // Returns: "Starting a 3 miles thermometer"
   */
  static formatThermometerStart(distance) {
    return `Starting a ${distance} thermometer`;
  }

  /**
   * Format a question from history
   * @param {object} historyEntry - The history entry { category, title, question }
   * @param {object} questionData - The full question data from QuestionService
   * @returns {string} Formatted WhatsApp message
   */
  static formatFromHistory(historyEntry, questionData) {
    return this.formatWhatsAppMessage(
      historyEntry.category,
      historyEntry.title,
      historyEntry.question,
      questionData.answer,
      questionData.note,
      questionData.reward
    );
  }

  /* ============================================
     PRIVATE METHODS
     ============================================ */

  /**
   * Convert HTML links to plain text with visible URLs
   * Format: "link text: URL"
   *
   * @private
   * @param {string} html - HTML string potentially containing links
   * @returns {string} Plain text with URLs visible
   *
   * @example
   * convertLinksToPlainText('See <a href="https://example.com">map</a>')
   * // Returns: "See map: https://example.com"
   */
  static #convertLinksToPlainText(html) {
    if (!html) return html;

    // Create a temporary element to parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;

    // Find all anchor tags and replace them with "text: URL" format
    const links = temp.querySelectorAll('a');
    links.forEach(link => {
      const text = link.textContent;
      const url = link.href;
      const replacement = document.createTextNode(`${text}: ${url}`);
      link.parentNode.replaceChild(replacement, link);
    });

    return temp.textContent;
  }
}
