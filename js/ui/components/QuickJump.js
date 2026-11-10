import { sentenceCase } from '../../utils/dom.js';

/**
 * QuickJump - Sticky row of category links ("chips") for the Questions view
 *
 * On a phone the row scrolls sideways and stays at the top of the screen,
 * so you can jump between categories from anywhere in the long list.
 * Each link goes to the section with id "category-<key>" (DetailRenderer).
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
      .map(([key, data]) => `
        <li class="app-jump__item">
          <a class="app-jump__link" href="#category-${key}"
             style="--app-category-colour: ${data.color}">
            <span class="app-jump__swatch" aria-hidden="true"></span>${sentenceCase(data.title)}
          </a>
        </li>`)
      .join('');

    this.#element.innerHTML = `
      <ul class="app-jump__list">
        ${links}
        <li class="app-jump__item"><a class="app-jump__link" href="#category-rules">Rules</a></li>
      </ul>
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
