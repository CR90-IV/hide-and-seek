/**
 * DOM Utility Functions
 *
 * Provides common DOM manipulation helpers to reduce boilerplate
 */

/**
 * Create an element with classes and attributes
 * @param {string} tag - HTML tag name
 * @param {object} options - { classes: string[], attrs: object, text: string }
 * @returns {HTMLElement} The created element
 *
 * @example
 * const button = createElement('button', {
 *   classes: ['btn', 'btn-primary'],
 *   attrs: { type: 'button', 'data-id': '123' },
 *   text: 'Click me'
 * });
 */
export function createElement(tag, options = {}) {
  const element = document.createElement(tag);

  // Add classes
  if (options.classes) {
    element.classList.add(...options.classes);
  }

  // Add attributes
  if (options.attrs) {
    for (const [key, value] of Object.entries(options.attrs)) {
      element.setAttribute(key, value);
    }
  }

  // Add text content
  if (options.text) {
    element.textContent = options.text;
  }

  // Add HTML content
  if (options.html) {
    element.innerHTML = options.html;
  }

  return element;
}

/**
 * Query selector with error handling
 * @param {string} selector - CSS selector
 * @param {HTMLElement} root - Root element (default: document)
 * @returns {HTMLElement|null} The element or null
 */
export function $(selector, root = document) {
  return root.querySelector(selector);
}

/**
 * Query selector all with error handling
 * @param {string} selector - CSS selector
 * @param {HTMLElement} root - Root element (default: document)
 * @returns {HTMLElement[]} Array of elements
 */
export function $$(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

/**
 * Toggle element visibility
 * @param {HTMLElement} element - The element
 * @param {boolean} show - True to show, false to hide
 */
export function toggle(element, show) {
  if (show) {
    element.classList.remove('hidden');
  } else {
    element.classList.add('hidden');
  }
}

/**
 * Clear all children of an element
 * @param {HTMLElement} element - The element to clear
 */
export function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/**
 * Append multiple children to an element
 * @param {HTMLElement} parent - The parent element
 * @param {HTMLElement[]} children - Array of child elements
 */
export function appendChildren(parent, children) {
  for (const child of children) {
    parent.appendChild(child);
  }
}

/**
 * Convert an all-capitals label to sentence case (GOV.UK style)
 * Labels with lower-case letters do not change.
 * @param {string} text - The text (e.g. 'MATCHING', 'YES / NO')
 * @returns {string} Sentence case text (e.g. 'Matching', 'Yes / no')
 */
export function sentenceCase(text) {
  if (!text || text !== text.toUpperCase()) return text;
  const lower = text.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

/**
 * Set the category colour and the text colour on it as CSS custom properties
 * @param {HTMLElement} element - The element (usually a section)
 * @param {object} categoryData - The category data ({ color, textColor })
 */
export function setCategoryColours(element, categoryData) {
  element.style.setProperty('--app-category-colour', categoryData.color);
  element.style.setProperty('--app-category-text-colour', categoryData.textColor || '#ffffff');
}

/**
 * HTML for a question icon in a square of the category colour
 * @param {string} iconName - Material Symbols icon name
 * @returns {string} HTML
 */
export function iconBoxHTML(iconName) {
  return `<span class="app-icon-box" aria-hidden="true"><span class="app-icon">${iconName || 'help'}</span></span>`;
}

/**
 * Update the "N of M asked" text in each section of a container
 * @param {HTMLElement} container - Container with <section> elements
 * @param {string} itemSelector - Selector for one question in a section
 * @param {string} usedClass - Class that marks an asked question
 */
export function updateProgress(container, itemSelector, usedClass) {
  container.querySelectorAll('section').forEach(section => {
    const progress = section.querySelector('.app-band__progress');
    if (!progress) return;
    const items = section.querySelectorAll(itemSelector);
    const used = section.querySelectorAll(`${itemSelector}.${usedClass}`).length;
    progress.textContent = `${used} of ${items.length} asked`;
  });
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - The text to escape
 * @returns {string} Escaped text
 */
export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
