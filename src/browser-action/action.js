/**
 * Settings for controlling enabled features
 * @typedef {Object} FeatureSettings
 * @property {boolean} noFooterBackground indicates whether the feature for
 * removing the footer's background is enabled
 * @property {boolean} expandAllButton indicates whether the feature for
 * adding the button for expanding all worklog rows is enabled
 * @property {boolean} fixProjectAutoselect indicates whether the fix for
 * autoselecting last project when adding new worklog entry is enabled
 */

/**
 * Loads existing settings from the storage and displays their values
 * on the page
 */
function loadSettings() {
  /**
   * Applies current setting values to the page elements
   * @param {FeatureSettings} currentSettings current settings
   */
  function applyCurrentValues(currentSettings) {
    const noFooterBackgroundEnabled = currentSettings.noFooterBackground ||
      false;
    getNoFooterBackgroundCheckbox().checked = noFooterBackgroundEnabled;

    const expandAllButtonEnabled = currentSettings.expandAllButton || false;
    getExpandAllButtonCheckbox().checked = expandAllButtonEnabled;

    const fixProjectAutoselectEnabled = currentSettings.fixProjectAutoselect ||
      false;
    getFixProjectAutoselectCheckbox().checked = fixProjectAutoselectEnabled;
  }

  /**
   * Handles the error on retrieving settings from the storage
   * @param {*} error error to be handled
   */
  function onStorageError(error) {
    console.log(`Error: ${error}`);
  }

  const currentSettings = browser.storage.sync.get();
  currentSettings.then(applyCurrentValues, onStorageError);
}

/**
 * Saves settings values from the page into the storage
 */
function saveSettings() {
  browser.storage.sync.set({
    noFooterBackground: getNoFooterBackgroundCheckbox().checked,
    expandAllButton: getExpandAllButtonCheckbox().checked,
    fixProjectAutoselect: getFixProjectAutoselectCheckbox().checked,
  });
}

/**
 * Gets checkbox element for the "no footer background" option
 * @return {HTMLElement} checkbox html element
 */
function getNoFooterBackgroundCheckbox() {
  return document.querySelector('#no-footer-background');
}

/**
 * Gets checkbox element for the "expand all button" option
 * @return {HTMLElement} checkbox html element
 */
function getExpandAllButtonCheckbox() {
  return document.querySelector('#expand-all-button');
}

/**
 * Gets checkbox element for the "fix the autoselection of the project" option
 * @return {HTMLElement} checkbox html element
 */
function getFixProjectAutoselectCheckbox() {
  return document.querySelector('#fix-project-autoselect');
}

/**
 * Initializes event listener for the page elements
 */
function initEventListeners() {
  getNoFooterBackgroundCheckbox().addEventListener('change', saveSettings);
  getExpandAllButtonCheckbox().addEventListener('change', saveSettings);
  getFixProjectAutoselectCheckbox().addEventListener('change', saveSettings);

  document.addEventListener('DOMContentLoaded', loadSettings);
}

initEventListeners();
