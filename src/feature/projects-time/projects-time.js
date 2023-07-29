import apiClient from '../../api/api-client.js';
import htmlHelper from '../../helper/html-helper.js';
import elementBuilder from './element/projects-time-element-builder.js';
import dataStorage from './data/projects-time-data-storage.js';
import extensionLogger from '../../helper/extension-logger.js';
import UIkit from 'uikit';
import './projects-time.css';

const OVERLAY_MUTATION_OBSERVER = new MutationObserver(
    () => triggerProjectsTimeModification());

const PROJECTS_TIME_ELEMENT_SELECTOR = 'app-worklog-projects-time';
const OVERLAY_CONTAINER_SELECTOR = '.cdk-overlay-container';
const CUSTOM_MODAL_CONTAINER_CLASS = 'tes-pt-modal-container';
const PROJECTS_TIME_MODAL_CONTAINER_SELECTOR = 'mat-dialog-container';
const DATE_FROM_PICKER_SELECTOR = 'input#dateFrom';
const DATE_TO_PICKER_SELECTOR = 'input#dateTo';
const WORKLOG_PROJECT_CLASS = '.worklog-project';
const ACCORDION_CLASS = 'uk-accordion';
const PROJECT_ACCORDION_TITLE_CLASS = 'tes-pt-accordion-title';
const PROJECT_TITLE_CLASS = 'tes-pt-project-title';

let initialized = false;

/**
 * Returns a unique feature identifier
 * @return {string} feature ID
 */
function getId() {
  return 'projects-time';
}

/**
 * Returns a feature description
 *
 * @return {string} feature description
 */
function getDescription() {
  return 'Extends the projects time summary modal window with the ability ' +
    'to group entries using regular expressions';
}

/**
 * Returns whether the feature has been initialized
 *
 * @return {boolean} feature initialization status
 */
function isInitialized() {
  return initialized;
}

/**
 * Initializes and enables the feature
 */
async function initialize() {
  triggerProjectsTimeModification();

  initialized = true;
}

/**
 * Deregisters and disables the feature
 */
async function deregister() {
  disableOverlayObserver();
  removeCustomModalClass();
  restoreProjectsTimeTable();

  initialized = false;
}

/**
 * Enables overlay mutation observer
 */
function enableOverlayObserver() {
  const overlayElement = document.querySelector(OVERLAY_CONTAINER_SELECTOR);
  OVERLAY_MUTATION_OBSERVER.observe(overlayElement, {childList: true});
}

/**
 * Disables overlay mutation observer
 */
function disableOverlayObserver() {
  OVERLAY_MUTATION_OBSERVER.disconnect();
}

/**
 * Triggers the modification of the projects time window
 */
async function triggerProjectsTimeModification() {
  disableOverlayObserver();

  await modifyProjectsTimeModal();

  enableOverlayObserver();
}

/**
 * Modifies the existing projects time modal window
 */
async function modifyProjectsTimeModal() {
  const projectsTimeElement =
    await resolveElement(PROJECTS_TIME_ELEMENT_SELECTOR);

  if (!projectsTimeElement) {
    return;
  }

  await Promise.all([assignCustomModalClass(), modifyProjectsTimeEntries()]);
}

/**
 * Assigns custom class to the modal container
 */
async function assignCustomModalClass() {
  const projectsTimeModalElement =
    await resolveElement(PROJECTS_TIME_MODAL_CONTAINER_SELECTOR);
  if (!projectsTimeModalElement) {
    return;
  }

  projectsTimeModalElement.classList.add(CUSTOM_MODAL_CONTAINER_CLASS);
}

/**
 * Removes custom class from the modal container
 */
async function removeCustomModalClass() {
  const modalContainer =
    await resolveElement(`.${CUSTOM_MODAL_CONTAINER_CLASS}`);
  if (!modalContainer) {
    return;
  }

  modalContainer.classList.remove(CUSTOM_MODAL_CONTAINER_CLASS);
}

/**
 * Restore original projects time table
 */
async function restoreProjectsTimeTable() {
  const tableElementSelector =
    `${PROJECTS_TIME_ELEMENT_SELECTOR} .${ACCORDION_CLASS}`;
  const projectsTableElement = await resolveElement(tableElementSelector);
  if (!projectsTableElement) {
    return;
  }
  projectsTableElement.classList.remove(ACCORDION_CLASS);

  const projectTitleElements = await resolveElements(`.${PROJECT_TITLE_CLASS}`);
  if (!projectTitleElements) {
    return;
  }
  projectTitleElements.forEach((element) =>
    element.classList.remove(PROJECT_TITLE_CLASS));
  projectsTableElement.replaceChildren(...projectTitleElements);
}

/**
 * Modifies the existing projects time entries
 *
 * @return {Promise<void>} promise for the operation completion
 */
async function modifyProjectsTimeEntries() {
  const logLines = await getLogLineEntries();

  const logLinesByProjectName = groupToMap(logLines,
      (logLine) => logLine.userProject.projectName);
  const logLinesByProjectNameSorted = new Map([...logLinesByProjectName]
      .sort((firstEntry, secondEntry) =>
        String(firstEntry[0]).localeCompare(secondEntry[0])));

  const modificationPromises = [];
  for (const [projectName, logLines] of logLinesByProjectNameSorted) {
    const projectElement = await htmlHelper.resolveElement(() =>
      findWorklogProjectElement(projectName));
    const modificationPromise = modifyProjectTimeDetails(projectElement,
        projectName, logLines);
    modificationPromises.push(modificationPromise);
  }

  await Promise.all(modificationPromises);
}

/**
 * @typedef {import('./../../api/api-client.js').LogLine} LogLine
 */

/**
 * Returns all log line entries for the currently selected dates
 *
 * @return {Promise<Array<LogLine>>} promise for the log lines
 */
async function getLogLineEntries() {
  const [dateFromElement, dateToElement] = await Promise.all([
    resolveElement(DATE_FROM_PICKER_SELECTOR),
    resolveElement(DATE_TO_PICKER_SELECTOR)]);

  if (!dateFromElement || !dateToElement) {
    return;
  }

  const dateFrom = localStringToDate(dateFromElement.value);
  const dateTo = localStringToDate(dateToElement.value);

  return await apiClient.getUserLogLines(dateFrom, dateTo);
}

/**
 * Function that extracts the key from an object
 *
 * @callback keyExtractor
 * @param {T} object object to extract the key from
 * @return {K} extracted key`
 * @template T, K
 */

/**
 * Groups the array into a map by an extracted key
 *
 * @param {Array<T>} array array to be grouped
 * @param {keyExtractor<T, K>} keyExtractor key extractor
 * @return {Map<K, Array<T>>} grouped map
 * @template T, K
 */
function groupToMap(array, keyExtractor) {
  return array.reduce((map, arrayElement) => {
    const key = keyExtractor(arrayElement);
    map.get(key)?.push(arrayElement) ?? map.set(key, [arrayElement]);
    return map;
  }, new Map());
}

/**
 * Groups log lines by a grouping key
 *
 * Grouping key is extracted by a regular expression, associated with the
 *  project. Two log line entries will be grouped together if regular expression
 *  matches the same substring in the line description.
 *
 * @param {string} projectName name of the project, associated with the
 * log lines
 * @param {Array<LogLine>} logLines log lines to group
 * @return {Promise<Map<string, Array<LogLine>>>} promise for the log lines
 *  grouped by a grouping key
 */
async function groupLogLinesByGroupKey(projectName, logLines) {
  const groupRegexValue = await dataStorage.getGroupRegexByProject(getId(),
      projectName);
  const groupRegex = groupRegexValue ? new RegExp(groupRegexValue) : null;

  return groupLogLinesByRegex(logLines, groupRegex);
}

/**
 * Groups log lines by a regex grouping key
 *
 * @param {Array<LogLine>} logLines log lines to group
 * @param {RegExp} regex regular expression for extracting the grouping key
 * @return {Promise<Map<string, Array<LogLine>>>} promise for the log lines
 *  grouped by a grouping key
 */
function groupLogLinesByRegex(logLines, regex) {
  return groupToMap(logLines, (logLine) => extractGroupingKey(logLine, regex));
}

/**
 * Extracts the grouping key from the log line entry
 *
 * @param {LogLine} logLine log line to extract the group from
 * @param {RegExp} regex regular expression for extracting the grouping key
 * @return {string | null} extracted grouping key or null if it couldn't be
 *  extracted
 */
function extractGroupingKey(logLine, regex) {
  if (regex == null) {
    return null;
  }

  const description = logLine.description.trim();
  const matchedResults = regex.exec(description);

  if (matchedResults == null || matchedResults.length < 2) {
    return null;
  }

  return matchedResults[1];
}

/**
 * Finds a worklog project element by the project name
 *
 * @param {string} projectName project name to search the element by
 * @return {HTMLElement | undefined} worklog project element
 */
function findWorklogProjectElement(projectName) {
  const matchingElements = document.querySelectorAll(WORKLOG_PROJECT_CLASS);

  const matchingElement = Array.from(matchingElements)
      .find((element) => {
        if (element.hasChildNodes() &&
          element.firstChild.textContent === projectName) {
          return element;
        }
      });

  return matchingElement;
}

/**
 * Modifies time details element for the provided project
 *
 * @param {HTMLElement} worklogProjectElement original worklog project element
 * @param {string} projectName name of the project
 * @param {Array<LogLine>} logLines log line entries
 */
async function modifyProjectTimeDetails(worklogProjectElement, projectName,
    logLines) {
  const originalProjectsTable = worklogProjectElement.parentElement;
  const newProjectContainer =
    await elementBuilder.buildProjectContainer(getId(), worklogProjectElement,
        projectName, logLines, groupLogLinesByGroupKey, PROJECT_TITLE_CLASS,
        PROJECT_ACCORDION_TITLE_CLASS);
  originalProjectsTable.append(newProjectContainer);

  UIkit.accordion(originalProjectsTable,
      {multiple: true, toggle: `> .${PROJECT_ACCORDION_TITLE_CLASS}`});
}

/**
 * Converts a localized string value into a date object
 *
 * @param {string} localStringDate date string in the dd.mm.yyyy format
 * @return {Date} converted date in UTC
 */
function localStringToDate(localStringDate) {
  const dateParts = localStringDate.split('.');

  return new Date(Date.UTC(dateParts[2], dateParts[1] - 1, dateParts[0]));
}

/**
 * Resolves an element in the document using the provided selector
 *
 * @param {string} selector element selector
 * @return {Promise.<HTMLElement>} promise for the html element
 */
async function resolveElement(selector) {
  try {
    return await htmlHelper.resolveElement(() =>
      document.querySelector(selector));
  } catch (error) {
    extensionLogger.info(`Encountered an error on resolving element via 
    '${selector}' selector:`, error);
  }
}

/**
 * Resolves elements in the document using the provided selector
 *
 * @param {string} selector element selector
 * @return {Promise.<Array<HTMLElement>>} promise for the html elements
 */
async function resolveElements(selector) {
  try {
    return await htmlHelper.resolveElements(() =>
      document.querySelectorAll(selector));
  } catch (error) {
    extensionLogger.info(`Encountered an error on resolving elements via 
    '${selector}' selector:`, error);
  }
}

export default {getId, getDescription, isInitialized, initialize, deregister};
