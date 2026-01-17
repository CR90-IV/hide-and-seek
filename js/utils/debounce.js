/**
 * Debounce utility - delays function execution until after wait time has elapsed
 * since the last call
 *
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @returns {Function} The debounced function
 *
 * @example
 * const debouncedSearch = debounce((query) => {
 *   console.log('Searching for:', query);
 * }, 300);
 *
 * debouncedSearch('hello');  // Won't execute immediately
 * debouncedSearch('hello w'); // Cancels previous, won't execute immediately
 * debouncedSearch('hello world'); // After 300ms of no calls, executes with 'hello world'
 */
export function debounce(func, wait) {
  let timeout = null;

  return function debounced(...args) {
    const context = this;

    // Clear existing timeout
    if (timeout) {
      clearTimeout(timeout);
    }

    // Set new timeout
    timeout = setTimeout(() => {
      timeout = null;
      func.apply(context, args);
    }, wait);
  };
}

/**
 * Throttle utility - ensures function is called at most once per specified time period
 *
 * @param {Function} func - The function to throttle
 * @param {number} wait - The number of milliseconds to wait between calls
 * @returns {Function} The throttled function
 *
 * @example
 * const throttledScroll = throttle(() => {
 *   console.log('Scroll event');
 * }, 100);
 *
 * window.addEventListener('scroll', throttledScroll);
 * // Function executes at most once every 100ms, even if scroll events fire more frequently
 */
export function throttle(func, wait) {
  let timeout = null;
  let lastRun = 0;

  return function throttled(...args) {
    const context = this;
    const now = Date.now();

    if (!lastRun) {
      // First call - execute immediately
      func.apply(context, args);
      lastRun = now;
    } else {
      // Clear existing timeout
      if (timeout) {
        clearTimeout(timeout);
      }

      // Schedule next execution
      const remaining = wait - (now - lastRun);

      if (remaining <= 0) {
        // Enough time has passed - execute now
        func.apply(context, args);
        lastRun = now;
      } else {
        // Not enough time - schedule for later
        timeout = setTimeout(() => {
          func.apply(context, args);
          lastRun = Date.now();
          timeout = null;
        }, remaining);
      }
    }
  };
}
