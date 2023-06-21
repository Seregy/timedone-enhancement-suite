/**
 * Function that returns html element or null if it's not available
 *
 * @callback elementSupplier
 */

/**
 * Resolves html element on the page
 *
 * Handles the cases when the element can't be retrieved right away
 *
 * @param {elementSupplier} elementSupplier provider of the html element to
 * resolve
 * @return {Promise.<HTMLElement>} promise for the html element
 */
function resolveElement(elementSupplier) {
  return new Promise((resolve) => {
    const element = elementSupplier();

    if (element) {
      return resolve(element);
    }

    const observer = new MutationObserver((mutations) => {
      const element = elementSupplier();
      if (element) {
        resolve(element);
        observer.disconnect();
      }
    });

    observer.observe(document, {childList: true, subtree: true});
  });
}

export default {resolveElement};
