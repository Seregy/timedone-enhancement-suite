import browser from 'webextension-polyfill';
import featureLoader from '../feature/feature-loader.js';
import featureService from '../helper/feature-service.js';
import storageService from '../helper/storage-service.js';
import extensionLogger from '../helper/extension-logger.js';

const requiredPermissions = {
  origins: ['*://timedone.golden-dimension.com/*'],
};
const FEATURES_CONTAINER_SELECTOR = '#features';

let permissionsGranted;

/**
 * @typedef {import('../feature/feature.js').Feature} Feature
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

      featureCheckbox.checked = featureService.isFeatureEnabled(feature,
          currentSettings);
    });
  }

  /**
   * Handles the error on retrieving settings from the storage
   * @param {*} error error to be handled
   */
  function onStorageError(error) {
    extensionLogger
        .info(`Error on retrieving settings from the storage: ${error}`);
  }

  const currentSettingsPromise = storageService.getFeatureSettings();
  currentSettingsPromise.then(applyCurrentValues, onStorageError);
}

/**
 * Handles the change in feature's enable/disable status
 */
function handleFeatureStateChange() {
  requestMissingPermissions();
  saveSettings();
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

  storageService.storeFeatureSettings(settingsToSave);
}

/**
 * Builds and adds feature HTML elements to the page
 */
function addFeaturesToThePage() {
  const featuresContainer = document.querySelector(FEATURES_CONTAINER_SELECTOR);

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
  container.classList.add('uk-flex', 'uk-flex-left', 'uk-margin-bottom');

  const checkbox = document.createElement('input');
  checkbox.setAttribute('type', 'checkbox');
  checkbox.classList.add('uk-checkbox', 'uk-margin-small-top', 'uk-flex-none');
  const featureId = feature.getId();
  checkbox.id = featureId;
  checkbox.addEventListener('change', handleFeatureStateChange);
  container.appendChild(checkbox);

  const featureDescriptionContainer = document.createElement('div');
  featureDescriptionContainer.classList.add('uk-margin-left');
  const label = document.createElement('label');
  label.classList.add('uk-form-label', 'uk-text-emphasis');
  label.setAttribute('for', featureId);
  label.textContent = feature.getId();
  featureDescriptionContainer.appendChild(label);
  const featureDescription = document.createElement('p');
  featureDescription.classList.add('uk-margin-small');
  featureDescription.textContent = feature.getDescription();
  featureDescriptionContainer.appendChild(featureDescription);
  container.appendChild(featureDescriptionContainer);

  return container;
}

/**
 * Requests permissions necessary for the extension if needed
 */
async function requestMissingPermissions() {
  if (!permissionsGranted) {
    permissionsGranted = await browser.permissions.request(requiredPermissions);
  }
}

addFeaturesToThePage();
