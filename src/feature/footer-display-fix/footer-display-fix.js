import htmlHelper from '../../helper/html-helper.js';
import extensionLogger from '../../helper/extension-logger.js';

import './footer-display-fix.css';

const WORKLOG_TABLE_CONTENT_SELECTOR = 'app-worklog mat-table';
const FOOTER_SELECTOR = 'div.worklog__footer';
const CUSTOM_CONTENT_TABLE_CLASS = 'tes-fdf-table';
const CUSTOM_FOOTER_CLASS = 'tes-fdf-worklog-footer';

let initialized = false;

/**
 * Returns a unique feature identifier
 * @return {string} feature ID
 */
function getId() {
  return 'footer-display-fix';
}

/**
 * Returns a feature description
 *
 * @return {string} feature description
 */
function getDescription() {
  return 'Adjusts the footer element style by removing its background and ' +
    'preventing it from overlapping the last entry on the page';
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
    footer.classList.add(CUSTOM_FOOTER_CLASS);
  }

  const tableContent = await resolveContentTableElement();
  if (tableContent) {
    tableContent.classList.add(CUSTOM_CONTENT_TABLE_CLASS);
  }

  initialized = true;
}

/**
 * Deregisters and disables the feature
 */
async function deregister() {
  const footer = await resolveFooterElement();
  if (footer) {
    footer.classList.remove(CUSTOM_FOOTER_CLASS);
  }

  const tableContent = await resolveContentTableElement();
  if (tableContent) {
    tableContent.classList.remove(CUSTOM_CONTENT_TABLE_CLASS);
  }

  initialized = false;
}

/**
 * Resolves the footer element
 *
 * @return {Promise.<HTMLElement>} promise for the footer HTML element
 */
async function resolveFooterElement() {
  return resolveElement(FOOTER_SELECTOR);
}

/**
 * Resolve the worklog content table element
 *
 * @return {Promise.<HTMLElement>} promise for the content table HTML element
 */
async function resolveContentTableElement() {
  return resolveElement(WORKLOG_TABLE_CONTENT_SELECTOR);
}

/**
 * Resolve an HTML element via the provided selector
 *
 * @param {string} selector HTML element selector
 * @return {Promise.<HTMLElement>} promise for the HTML element
 */
async function resolveElement(selector) {
  try {
    return await htmlHelper.resolveElement(() =>
      document.querySelector(selector));
  } catch (error) {
    extensionLogger.info('Encountered an error on resolving an HTML element ' +
     `using the '${selector}' selector:`, error);
  }
}

export default {getId, getDescription, isInitialized, initialize, deregister};
