import htmlHelper from '../../helper/html-helper.js';
import extensionLogger from '../../helper/extension-logger.js';

const PROJECT_SELECT_ELEMENT_SELECTOR = 'app-manage-worklog select#projectId';
const FIRST_PROJECT_SELECT_OPTION_ELEMENT_SELECTOR =
  'app-manage-worklog select#projectId option';
const MUTATION_OBSERVER = new MutationObserver((mutations) => {
  tryAutoselectProjectIfNoneSelected();
});

let initialized = false;

/**
 * Returns a unique feature identifier
 * @return {string} feature ID
 */
function getId() {
  return 'project-autoselect-bugfix';
}

/**
 * Returns a feature description
 *
 * @return {string} feature description
 */
function getDescription() {
  return 'Fix the autoselection of the project';
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
  MUTATION_OBSERVER.observe(document.querySelector('body'), {
    childList: true,
  });

  initialized = true;
}

/**
 * Deregisters and disables the feature
 */
async function deregister() {
  MUTATION_OBSERVER.disconnect();

  initialized = false;
}

/**
 * Attempts to selects a proper project option if no project is selected
 */
async function tryAutoselectProjectIfNoneSelected() {
  let projectSelectElement;
  try {
    projectSelectElement = await htmlHelper.resolveElement(() =>
      document.querySelector(PROJECT_SELECT_ELEMENT_SELECTOR));
  } catch (error) {
    extensionLogger.info(`Encountered an error on autoselecting a project when
     resolving selection element: %o`, error);
  }

  if (!projectSelectElement) {
    return;
  }

  const firstProjectOptionElement =
   await resolveFirstProjectSelectOptionElement();
  if (projectSelectElement.selectedIndex === -1) {
    const projectValueToSelect =
      resolveProjectValueToSelect(firstProjectOptionElement);
    selectProjectOption(projectSelectElement, projectValueToSelect);
  }
}

/**
 * Resolves the first option element for the project selection
 *
 * Ensures that option elements have been initialilzed for the select element
 *
 * @return {Promise<HTMLOptionElement>} promise for the first available option
 *  element for the project selection
 */
async function resolveFirstProjectSelectOptionElement() {
  return htmlHelper.resolveElement(() =>
    document.querySelector(FIRST_PROJECT_SELECT_OPTION_ELEMENT_SELECTOR));
}

/**
 * Resolves a project option value to be selected
 *
 * @param {HTMLOptionElement} firstProjectOptionElement first available option
 *  element for the project selection
 * @return {string} value, associated with the option element to be selected
 */
function resolveProjectValueToSelect(firstProjectOptionElement) {
  const lastUsedProjectId = getLastUsedProjectId();

  if (lastUsedProjectId) {
    return lastUsedProjectId;
  }

  return getFirstAvailableProjectOptionValue(firstProjectOptionElement);
}

/**
 * Returns a project option value based on the last written log entry
 *
 * @return {string} value, associated with the last selected project option
 *  element, if any
 */
function getLastUsedProjectId() {
  const lastWrittenLogRecord = JSON.parse(window.localStorage.lastWrittenDate);
  return lastWrittenLogRecord?.userProject?.projectId;
}

/**
 * Returns a value of the first available project option element
 *
 * @param {HTMLOptionElement} firstProjectOptionElement first available option
 *  element for the project selection
 * @return {string} value, associated with the first available project option
 *  element, if any
 */
function getFirstAvailableProjectOptionValue(firstProjectOptionElement) {
  return firstProjectOptionElement?.value;
}

/**
 * Selects a project option element
 *
 * @param {HTMLSelectElement} projectSelectElement select element for choosing a
 *  project
 * @param {string} projectValueToSelect value, associated with the option to be
 *  selected
 */
function selectProjectOption(projectSelectElement, projectValueToSelect) {
  projectSelectElement.value = projectValueToSelect;
  projectSelectElement.dispatchEvent(new Event('change'));
}

export default {getId, getDescription, isInitialized, initialize, deregister};
