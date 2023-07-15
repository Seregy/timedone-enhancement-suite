import htmlHelper from '../../helper/html-helper.js';
import extensionLogger from '../../helper/extension-logger.js';

import './footer-background-fix.css';

let initialized = false;

/**
 * Returns a unique feature identifier
 * @return {string} feature ID
 */
function getId() {
  return 'footer-background-fix';
}

/**
 * Returns a feature description
 *
 * @return {string} feature description
 */
function getDescription() {
  return 'Disable the background for the worklog footer';
}

/**
 * Returns whether the feature has been initialized
 *
 * @return {boolean} feature initilization status
 */
function isInitialized() {
  return initialized;
}

/**
 * Initializes and enables the feature
 */
async function initialize() {
  const footer = await resolveFooterElement();
  if (footer) {
    assignElementId(footer, 'tes-worklog-footer');
  }

  initialized = true;
}

/**
 * Deregisters and disables the feature
 */
async function deregister() {
  const footer = await resolveFooterElement();
  if (footer) {
    footer.removeAttribute('id');
  }

  initialized = false;
}

/**
 * Resolve footer element
 * @return {Promise.<HTMLElement>} promise for the footer HTML element
 */
async function resolveFooterElement() {
  try {
    return await htmlHelper.resolveElement(() =>
      document.querySelector('div.worklog__footer'));
  } catch (error) {
    extensionLogger.info(`Encountered an error on resolving footer element: %o`,
        error);
  }
}

/**
 * Assigns ID to the existing element
 *
 * @param {HTMLElement} element html element to assign the ID to
 * @param {string} newId id to assign to the element
 */
function assignElementId(element, newId) {
  if (element.id === newId) {
    return;
  }

  console.assert(!element.hasAttribute('id'),
      `Element has an ID assigned to it: ${element.id}`);
  element.id = newId;
}

export default {getId, getDescription, isInitialized, initialize, deregister};
