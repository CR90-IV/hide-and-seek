import { sentenceCase } from '../../utils/dom.js';

/**
 * QuickJump - "Contents" list of links to each category section
 *
 * Follows the GOV.UK contents list pattern. Each link goes to the
 * section with id "category-<key>", rendered by DetailRenderer.
 */
export class QuickJump {
  #element;
  #questionsData;

  /**
   * @param {string} elementId - ID of the contents container
   * @param {object} questionsData - The questions data structure
   */
  constructor(elementId, questionsData) {
    this.#element = document.getElementById(elementId);
    this.#questionsData = questionsData;

    if (!this.#element) {
      console.error(`QuickJump: Element with ID "${elementId}" not found`);
      return;
    }

    this.render();
    this.#element.addEventListener('click', this.#handleClick);
  }

  render() {
    const links = Object.entries(this.#questionsData)
      .map(([key, data]) => `<li><a class="govuk-link" href="#category-${key}">${sentenceCase(data.title)}</a></li>`)
      .join('');

    this.#element.innerHTML = `
      <h2 class="govuk-heading-s govuk-!-margin-bottom-2">Contents</h2>
      <ol class="govuk-body app-contents__list">
        ${links}
        <li><a class="govuk-link" href="#category-rules">General rules</a></li>
      </ol>
    `;
  }

  show() {
    this.#element.classList.remove('hidden');
  }

  hide() {
    this.#element.classList.add('hidden');
  }

  /**
   * Scroll to the section without changing the URL hash,
   * because the hash selects the view.
   */
  #handleClick = (event) => {
    const link = event.target.closest('a[href^="#category-"]');
    if (!link) return;
    const target = document.getElementById(link.getAttribute('href').slice(1));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const heading = target.querySelector('h2');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
  };

  destroy() {
    this.#element.removeEventListener('click', this.#handleClick);
  }
}
