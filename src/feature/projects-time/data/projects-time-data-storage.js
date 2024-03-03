import storageService from '../../../helper/storage-service.js';

const REGEX_DATA_STORAGE_KEY = 'regex';
const GROUP_TYPE_STORAGE_KEY = 'group-type';


/**
 * Returns the current grouping type for the provided project
 *
 * @param {string} featureId unique feature identifier
 * @param {string} projectName project name to get the grouping type for
 * @return {Promise<string>} promise for the grouping type value for the
 *  project, if it exists
 */
async function getGroupTypeByProject(featureId, projectName) {
  const storedGroupTypeData = await storageService.getFeatureData(featureId,
      GROUP_TYPE_STORAGE_KEY);
  const projectKey = convertProjectNameToKey(projectName);

  return storedGroupTypeData[projectKey];
}

/**
 * Saves a grouping type value for the provided project
 *
 * @param {string} featureId unique feature identifier
 * @param {string} projectName project name to save the grouping type for
 * @param {string} newGroupingType grouping type value to save
 */
async function saveGroupTypeForProject(featureId, projectName,
    newGroupingType) {
  const projectKey = convertProjectNameToKey(projectName);
  const storageKey = GROUP_TYPE_STORAGE_KEY;
  const storedGroupTypeData = await storageService.getFeatureData(featureId,
      storageKey);

  storedGroupTypeData[projectKey] = newGroupingType;

  storageService.storeFeatureData(featureId, storageKey,
      storedGroupTypeData);
}

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

export default {getGroupTypeByProject, saveGroupTypeForProject,
  getGroupRegexByProject, saveGroupRegexForProject};
