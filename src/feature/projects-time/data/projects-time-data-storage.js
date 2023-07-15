import storageService from '../../../helper/storage-service.js';

const REGEX_DATA_STORAGE_KEY = 'regex';

/**
 * Returns grouping regex value by the provided project
 *
 * @param {string} featureId unique feature identifier
 * @param {string} projectName project name to get the grouping regex for
 * @return {Promise<string>} promise for the grouping regex value for the
 *  project, if it exists
 */
async function getGroupRegexByProject(featureId, projectName) {
  const storedRegexData = await storageService.getFeatureData(featureId,
      REGEX_DATA_STORAGE_KEY);
  const projectKey = convertProjectNameToKey(projectName);

  return storedRegexData[projectKey];
}

/**
 * Saves grouping regex value for the provided project
 *
 * @param {string} featureId unique feature identifier
 * @param {string} projectName project name to save the grouping regex for
 * @param {string} newRegexValue grouping regex value to save
 */
async function saveGroupRegexForProject(featureId, projectName, newRegexValue) {
  const projectKey = convertProjectNameToKey(projectName);
  const regexData = await storageService.getFeatureData(featureId,
      REGEX_DATA_STORAGE_KEY);

  regexData[projectKey] = newRegexValue;

  storageService.storeFeatureData(featureId, REGEX_DATA_STORAGE_KEY, regexData);
}

/**
 * Converts the provided project name into a storage key
 *
 * @param {string} projectName name
 * @return {string} converted project storage key
 */
function convertProjectNameToKey(projectName) {
  return projectName.replaceAll(' ', '-');
}

export default {getGroupRegexByProject, saveGroupRegexForProject};
