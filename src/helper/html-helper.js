import {ResolutionTimeoutError} from './resolution-timeout-error.js';

const ELEMENT_RESOLUTION_TIMEOUT_MS = 1000;

/**
 * Function that returns html element or null if it's not available
 *
 * @callback elementSupplier
 * @return {HTMLElement} html element
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

    const observer = new MutationObserver(() => {
      const element = elementSupplier();
      if (element) {
        resolve(element);
        observer.disconnect();
      }
    });

    observer.observe(document, {childList: true, subtree: true});
  });
}

/**
 * Resolves html element on the page
 *
 * Handles the cases when the element can't be retrieved right away
 *
 * @param {elementSupplier} elementSupplier provider of the html element to
 * resolve
 * @return {Promise.<HTMLElement>} promise for the html element
 */
function resolveElementWithTimeout(elementSupplier) {
  return new Promise((resolve, reject) => {
    const element = elementSupplier();

    if (element) {
      return resolve(element);
    }

    const observer = new MutationObserver(() => {
      const element = elementSupplier();
      if (element) {
        if (timeout) {
          clearTimeout(timeout);
        }

        resolve(element);
        observer.disconnect();
      }
    });

    observer.observe(document, {childList: true, subtree: true});
    const timeout = setTimeout(() => {
      observer.disconnect();
      reject(new ResolutionTimeoutError());
    }, ELEMENT_RESOLUTION_TIMEOUT_MS);
  });
}

/**
 * Function that returns html elements or null if they are not available
 *
 * @callback elementsSupplier
 * @return {Array<HTMLElement>} html elements
 */

/**
 * Resolves html element on the page
 *
 * Handles the cases when the element can't be retrieved right away
 *
 * @param {elementsSupplier} elementsSupplier provider of the html elements to
 * resolve
 * @return {Promise.<Array<HTMLElement>>} promise for the html elements
 */
function resolveElementsWithTimeout(elementsSupplier) {
  return new Promise((resolve, reject) => {
    const elements = elementsSupplier();

    if (elements.length > 0) {
      return resolve(elements);
    }

    const observer = new MutationObserver(() => {
      const elements = elementsSupplier();
      if (elements.length > 0) {
        if (timeout) {
          clearTimeout(timeout);
        }

        resolve(elements);
        observer.disconnect();
      }
    });

    observer.observe(document, {childList: true, subtree: true});
    const timeout = setTimeout(() => {
      observer.disconnect();
      reject(new ResolutionTimeoutError());
    }, ELEMENT_RESOLUTION_TIMEOUT_MS);
  });
}

export default {resolveElement, resolveElementWithTimeout,
  resolveElementsWithTimeout};
