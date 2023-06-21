import featureLoader from '../feature/feature-loader.js';

/**
 * @typedef {import('./../feature/feature.js').Feature} Feature
 */

/**
 * Loads existing settings from the storage and displays their values
 * on the page
 */
function loadSettings() {
  /**
   * Applies current setting values to the page elements
   * @param {Object.<string, boolean>} currentSettings current feature settings
   *  object with feature IDs as keys and their enabled status as values
   */
  function applyCurrentValues(currentSettings) {
    const features = featureLoader.getFeatures();

    features.forEach((feature) => {
      const featureId = feature.getId();
      const featureCheckbox = document.querySelector('#' + featureId);
      featureCheckbox.checked = currentSettings[featureId] || false;
    });
  }

  /**
   * Handles the error on retrieving settings from the storage
   * @param {*} error error to be handled
   */
  function onStorageError(error) {
    console.log(`Error on retrieving settings from the storage: ${error}`);
  }

  const currentSettings = browser.storage.sync.get();
  currentSettings.then(applyCurrentValues, onStorageError);
}

/**
 * Saves settings values from the page into the storage
 */
function saveSettings() {
  const features = featureLoader.getFeatures();
  const settingsToSave = {};

  features.forEach((feature) => {
    const featureId = feature.getId();
    const featureCheckbox = document.querySelector('#' + featureId);
    settingsToSave[featureId] = featureCheckbox.checked;
  });

  browser.storage.sync.set(settingsToSave);
}

/**
 * Initializes event listener for the page elements
 */
function initEventListeners() {
  const featuresContainer = document.querySelector('#features');

  featureLoader.getFeatures().forEach((feature) => {
    const featureContainer = buildFeatureBlock(feature);
    featuresContainer.appendChild(featureContainer);
  });

  document.addEventListener('DOMContentLoaded', loadSettings);
}

/**
 * Builds a feature settings block
 * @param {Feature} feature feature to build the block for
 * @return {HTMLElement} HTML feature block element
 */
function buildFeatureBlock(feature) {
  const container = document.createElement('div');
  container.classList.add('uk-margin-small');

  const checkbox = document.createElement('input');
  checkbox.setAttribute('type', 'checkbox');
  checkbox.classList.add('uk-checkbox');
  const featureId = feature.getId();
  checkbox.id = featureId;
  checkbox.addEventListener('change', saveSettings);
  container.appendChild(checkbox);

  const label = document.createElement('label');
  label.classList.add('uk-form-label', 'uk-margin-small-left');
  label.setAttribute('for', featureId);
  label.textContent = feature.getDescription();
  container.appendChild(label);

  return container;
}

initEventListeners();
