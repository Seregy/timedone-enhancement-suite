/**
 * Settings for controlling enabled features
 * @typedef {Object} FeatureSettings
 * @property {boolean} noFooterBackground indicates whether the feature for
 * removing the footer's background is enabled
 * @property {boolean} expandAllButton indicates whether the feature for
 * adding the button for expanding all worklog rows is enabled
 * @property {boolean} shortFooter deprecated alias for
 * {@link FeatureSettings#noFooterBackground}
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
      currentSettings.shortFooter || false;
    getNoFooterBackgroundCheckbox().checked = noFooterBackgroundEnabled;

    const expandAllButtonEnabled = currentSettings.expandAllButton || false;
    getExpandAllButtonCheckbox().checked = expandAllButtonEnabled;
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
  });
}

/**
 * Gets checkbox element for "no footer background" option
 * @return {HTMLElement} checkbox html element
 */
function getNoFooterBackgroundCheckbox() {
  return document.querySelector('#no-footer-background');
}

/**
 * Gets checkbox element for "expand all button" option
 * @return {HTMLElement} checkbox html element
 */
function getExpandAllButtonCheckbox() {
  return document.querySelector('#expand-all-button');
}

/**
 * Initializes event listener for the page elements
 */
function initEventListeners() {
  getNoFooterBackgroundCheckbox().addEventListener('change', saveSettings);
  getExpandAllButtonCheckbox().addEventListener('change', saveSettings);

  document.addEventListener('DOMContentLoaded', loadSettings);
}

initEventListeners();
