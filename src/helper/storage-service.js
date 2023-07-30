import browser from 'webextension-polyfill';

const FEATURE_STATUS_PREFIX = 'status';
const FEATURE_DATA_PREFIX = 'data';
const GLOBAL_DATA_PREFIX = 'global';
const KEY_DELIMITER = '.';

/**
 * Fetches the feature status settings from the storage
 *
 * @return {Promise<Object<string, boolean>>} promise for feature status
 *  settings with feature IDs as keys and their enabled status as values
 */
async function getFeatureSettings() {
  const key = FEATURE_STATUS_PREFIX;
  const settings = await browser.storage.sync.get(key);

  return settings[key] || {};
}

/**
 * Saves feature enabled settings into the storage
 *
 * @param {Object<string, boolean>} newSettings feature status settings to store
 */
async function storeFeatureSettings(newSettings) {
  const key = FEATURE_STATUS_PREFIX;
  const newData = {
    [key]: newSettings,
  };

  browser.storage.sync.set(newData);
}

/**
 * Fetches feature-specific data from the storage using the key
 *
 * If there is no data in the storage with the provided key, empty object will
 *  be returned in the response
 *
 * @param {string} featureId unique feature identifier
 * @param {string} dataKey feature-specific data key
 * @return {Promise<Object>} promise for the feature-specific data object
 */
async function getFeatureData(featureId, dataKey) {
  const key = FEATURE_DATA_PREFIX + KEY_DELIMITER + featureId +
   KEY_DELIMITER + dataKey;
  const settings = await browser.storage.sync.get(key);

  return settings[key] || {};
}

/**
 * Saves feature-specific data into the storage
 *
 * @param {string} featureId unique feature identifier
 * @param {string} dataKey feature-specific data key
 * @param {object} data feature-specific data object to store
 */
function storeFeatureData(featureId, dataKey, data) {
  const key = FEATURE_DATA_PREFIX + KEY_DELIMITER + featureId +
   KEY_DELIMITER + dataKey;
  const newData = {
    [key]: data,
  };

  browser.storage.sync.set(newData);
}

/**
 * Fetches global extension data from the storage using the key
 *
 * If there is no data in the storage with the provided key, empty object will
 *  be returned in the response
 *
 * @param {string} dataKey data key
 * @return {Promise<Object>} promise for the global data object
 */
async function getGlobalData(dataKey) {
  const key = GLOBAL_DATA_PREFIX + KEY_DELIMITER + dataKey;
  const settings = await browser.storage.local.get(key);

  return settings[key] || {};
}

export default {getFeatureSettings, storeFeatureSettings, getFeatureData,
  storeFeatureData, getGlobalData};
