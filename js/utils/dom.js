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
 * Get category text color class for headers
 * @param {string} categoryKey - The category key (e.g., 'matching')
 * @returns {string} Tailwind color class
 */
export function getCategoryTextColor(categoryKey) {
  const colorMap = {
    'matching': 'text-gray-200',
    'measuring': 'text-green-100',
    'radar': 'text-orange-100',
    'thermometer': 'text-yellow-100',
    'photo': 'text-blue-100',
    'tentacle': 'text-white'
  };
  return colorMap[categoryKey] || 'text-gray-100';
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

/**
 * Create a Material Symbol icon span
 * @param {string} iconName - The icon name
 * @param {string[]} classes - Additional classes
 * @returns {HTMLElement} The icon element
 */
export function createIcon(iconName, classes = []) {
  return createElement('span', {
    classes: ['material-symbols-outlined', ...classes],
    text: iconName
  });
}
