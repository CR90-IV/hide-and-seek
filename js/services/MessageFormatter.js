import { sentenceCase } from '../utils/dom.js';

/**
 * MessageFormatter - builds the WhatsApp message for a question
 *
 * The message must hold all the information the hider needs to answer:
 * the question, the gaps the seekers fill in, the rules, the time limit
 * and the reward.
 */
export class MessageFormatter {
  /**
   * Format the message for a question
   * @param {object} q - Full question data from QuestionService
   * @returns {string} The message
   *
   * @example
   * // *Radar: 1km*
   * // Are you within 1km of me?
   * // I am at: [location]
   * //
   * // _Answer for where you are now, not for your whole hiding zone._
   * //
   * // Answer within 5 minutes: yes or no.
   * // Then draw 2 cards and keep 1.
   */
  static formatQuestion(q) {
    const lines = [`*${sentenceCase(q.category)}: ${q.title}*`, q.question];
    if (q.fill) lines.push(...q.fill.split('\n'));

    const notes = [q.note, ...(q.rules || [])].filter(Boolean);
    if (notes.length) {
      lines.push('');
      notes.forEach(note => lines.push(`_${this.#toPlainText(note)}_`));
    }

    lines.push('');
    lines.push(`Answer within ${q.time}: ${q.answer}.`);
    lines.push(q.reward);

    return lines.join('\n');
  }

  /**
   * Format the message seekers send when they start a thermometer
   * @param {object} q - Full question data for the thermometer
   * @returns {string} The message
   */
  static formatThermometerStart(q) {
    return [
      `*${sentenceCase(q.category)}: ${q.title} (start)*`,
      `We are starting a ${q.title} thermometer.`,
      'Start: [location]',
      '',
      '_You do not need to answer yet._'
    ].join('\n');
  }

  /**
   * Convert HTML to plain text. Links become "link text: URL".
   * @private
   */
  static #toPlainText(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    temp.querySelectorAll('a').forEach(link => {
      link.replaceWith(document.createTextNode(`${link.textContent}: ${link.href}`));
    });
    return temp.textContent;
  }
}
