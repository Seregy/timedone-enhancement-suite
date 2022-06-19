const PROJECT_SELECT_ELEMENT_SELECTOR = 'app-manage-worklog select#projectId';
const FIRST_PROJECT_SELECT_OPTION_ELEMENT_SELECTOR =
  'app-manage-worklog select#projectId option';
const MUTATION_OBSERVER = new MutationObserver((mutations) => {
  tryAutoselectProjectIfNoneSelected();
});

/**
 * Handles the autoselection of the project based on the feature settings
 *
 * @param {FeatureSettings} featureSettings current feature settings
 */
async function handleProjectAutoselectFix(featureSettings) {
  if (featureSettings.fixProjectAutoselect) {
    initProjectAutoselectObserver();
    return;
  }

  MUTATION_OBSERVER.disconnect();
}

/**
 * Initiates a mutation observer for the project autoselection
 */
function initProjectAutoselectObserver() {
  MUTATION_OBSERVER.observe(document.querySelector('body'), {
    childList: true,
  });
}

/**
 * Attempts to selects a proper project option if no project is selected
 */
async function tryAutoselectProjectIfNoneSelected() {
  let projectSelectElement;
  try {
    projectSelectElement = await resolveElement(() =>
      document.querySelector(PROJECT_SELECT_ELEMENT_SELECTOR));
  } catch (error) {
    console.error(`Encountered an error on autoselecting a project when
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
  return resolveElement(() =>
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

/**
 * Resolves html element on the page
 *
 * Handles the cases when the element can't be retrieved right away
 *
 * @param {elementSupplier} elementSupplier provider of the html element to
 * resolve
 * @return {Promise} promise for the html element
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

export {handleProjectAutoselectFix};
