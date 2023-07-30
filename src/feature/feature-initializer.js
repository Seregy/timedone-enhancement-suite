import featureLoader from './feature-loader.js';
import featureService from '../helper/feature-service.js';
import storageService from '../helper/storage-service.js';

/**
 * @typedef {import('./../feature/feature.js').Feature} Feature
 */

/**
 * Initializes all enabled features
 */
function initializeFeatures() {
  const featureSettingsPromise = storageService.getFeatureSettings();
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
  const enabled = featureService.isFeatureEnabled(feature, settings);

  if (enabled && !isInitialized) {
    feature.initialize();
    return;
  }

  if (!enabled && isInitialized) {
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

export default {initializeFeatures};
