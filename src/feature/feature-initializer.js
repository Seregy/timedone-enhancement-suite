import browser from 'webextension-polyfill';
import featureLoader from './feature-loader.js';

/**
 * @typedef {import('./../feature/feature.js').Feature} Feature
 */

/**
 * Initializes all enabled features
 */
function initializeFeatures() {
  const featureSettingsPromise = loadFeatureSettings();
  const features = featureLoader.getFeatures();

  const initStatusByFeature = new Map(features.map((feature) =>
    [feature, feature.isInitialized()]));

  featureSettingsPromise.then((settings) => {
    initStatusByFeature.forEach((isInitialized, feature) =>
      initializeFeature(feature, isInitialized, settings));
  }, onStorageError);
}

/**
 * Initializes an enabled feature
 * @param {Feature} feature to initialize
 * @param {boolean} isInitialized current feature initialization status
 * @param {Object.<string, boolean>} settings current feature settings object
 *  with feature IDs as keys and their enabled status as values
 */
function initializeFeature(feature, isInitialized, settings) {
  const featureId = feature.getId();
  const enabledInSettings = settings[featureId];

  if (enabledInSettings && !isInitialized) {
    feature.initialize();
    return;
  }

  if (!enabledInSettings && isInitialized) {
    feature.deregister();
  }
}

/**
 * Handles the error on retrieving settings from the storage
 * @param {*} error error to be handled
 */
function onStorageError(error) {
  console.error(`Encountered an error on retrieving settings from the
   storage: ${error}`);
}

/**
 * Loads saved feature settings
 * @return {Promise.<Object.<string, boolean>>} promise for current feature
 *  settings object with feature IDs as keys and their enabled status as values
 */
function loadFeatureSettings() {
  return browser.storage.sync.get();
}

export default {initializeFeatures};
