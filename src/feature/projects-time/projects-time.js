import apiClient from '../../api/api-client.js';
import htmlHelper from '../../helper/html-helper.js';
import elementBuilder from './element/projects-time-element-builder.js';
import extensionLogger from '../../helper/extension-logger.js';
import collectionService from './collection-service.js';
import UIkit from 'uikit';
import './projects-time.css';

const PROJECTS_TIME_ELEMENT_SELECTOR = 'app-worklog-projects-time';
const OVERLAY_CONTAINER_CLASS = 'cdk-overlay-container';
const OVERLAY_MODAL_CONTAINER_CLASS_SELECTOR = 'cdk-overlay-backdrop';
const CUSTOM_MODAL_CONTAINER_CLASS = 'tes-pt-modal-container';
const PROJECTS_TIME_MODAL_CONTAINER_SELECTOR = 'mat-dialog-container';
const DATE_FROM_PICKER_SELECTOR =
  '[id^=mat-date-range-input-] input.mat-start-date';
const DATE_TO_PICKER_SELECTOR =
  '[id^=mat-date-range-input-] input.mat-end-date';
const WORKLOG_PROJECT_NAME_SELECTOR =
  '.worklog-projects-time__table p:nth-child(odd)';
const ACCORDION_CLASS = 'uk-accordion';
const PROJECT_ACCORDION_TITLE_CLASS = 'tes-pt-accordion-title';
const PROJECT_TITLE_CLASS = 'tes-pt-project-title';

const OVERLAY_MUTATION_OBSERVER = new MutationObserver(
    (records) => {
      const modalContainerAdded = records
          .some((record) => Array.from(record.addedNodes)
              .some((node) => node.classList && node.classList
                  .contains(OVERLAY_MODAL_CONTAINER_CLASS_SELECTOR)));
      if (!modalContainerAdded) {
        return;
      }
      triggerProjectsTimeModification();
    });
const BODY_MUTATION_OBSERVER = new MutationObserver(
    (records) => {
      const modalContainerAdded = records
          .some((record) => Array.from(record.addedNodes)
              .some((node) => node.classList && node.classList
                  .contains(OVERLAY_CONTAINER_CLASS)));
      if (!modalContainerAdded) {
        return;
      }
      triggerProjectsTimeModification();
    });

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
 * Returns whether the feature should be enabled by default
 *
 * @return {boolean} default enabled status
 */
function isEnabledByDefault() {
  return true;
}

/**
 * Initializes and enables the feature
 */
async function initialize() {
  extensionLogger.infoFeature(getId(), 'Start initializing');
  triggerProjectsTimeModification();

  initialized = true;
  extensionLogger.infoFeature(getId(), 'Initialized');
}

/**
 * Deregisters and disables the feature
 */
async function deregister() {
  extensionLogger.infoFeature(getId(), 'Start deregistering');
  disableOverlayObserver();
  removeCustomModalClass();
  restoreProjectsTimeTable();

  initialized = false;
  extensionLogger.infoFeature(getId(), 'Deregistered');
}

/**
 * Enables overlay mutation observer
 */
async function enableOverlayObserver() {
  const overlayElement = document.querySelector(`.${OVERLAY_CONTAINER_CLASS}`);
  if (!overlayElement) {
    extensionLogger.infoFeature(getId(),
        'No overlay element, observing the body');
    const bodyElement = document.querySelector('body');
    BODY_MUTATION_OBSERVER.observe(bodyElement, {childList: true});
    return;
  }

  OVERLAY_MUTATION_OBSERVER.observe(overlayElement, {childList: true});
}

/**
 * Disables overlay mutation observer
 */
function disableOverlayObserver() {
  OVERLAY_MUTATION_OBSERVER.disconnect();
  BODY_MUTATION_OBSERVER.disconnect();
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

  const logLinesByProjectName = collectionService.groupToMap(logLines,
      (logLine) => logLine.userProject.projectName);
  const logLinesByProjectNameSorted = new Map([...logLinesByProjectName]
      .sort((firstEntry, secondEntry) =>
        String(firstEntry[0]).localeCompare(secondEntry[0])));

  const modificationPromises = [];
  for (const [projectName, logLines] of logLinesByProjectNameSorted) {
    const [projectTitleElement, projectTimeElement] =
     await htmlHelper.resolveElementWithTimeout(() =>
       findWorklogProjectPair(projectName));
    const modificationPromise = modifyProjectTimeDetails(projectTitleElement,
        projectTimeElement, projectName, logLines);
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
 * Finds a worklog project elements pair by the project name
 *
 * @param {string} projectName project name to search the element by
 * @return {Array<HTMLElement> | undefined} worklog project elements pair, with
 *  the first element being a project title and the second one being a project
 *  time
 */
function findWorklogProjectPair(projectName) {
  const matchingElements =
    document.querySelectorAll(WORKLOG_PROJECT_NAME_SELECTOR);

  const matchingProjectTitle = Array.from(matchingElements)
      .find((element) => {
        if (element.hasChildNodes() &&
          element.firstChild.textContent === projectName) {
          return element;
        }
      });

  if (!matchingProjectTitle) {
    return;
  }

  return [matchingProjectTitle, matchingProjectTitle.nextElementSibling];
}

/**
 * Modifies time details element for the provided project
 *
 * @param {HTMLElement} worklogProjectTitleElement original worklog project
 *  title element
 * @param {HTMLElement} worklogProjectTimeElement original worklog project
 *  time element
 * @param {string} projectName name of the project
 * @param {Array<LogLine>} logLines log line entries
 */
async function modifyProjectTimeDetails(worklogProjectTitleElement,
    worklogProjectTimeElement, projectName, logLines) {
  const originalProjectsTable = worklogProjectTitleElement.parentElement;
  const newProjectContainer =
    await elementBuilder.buildProjectContainer(getId(),
        worklogProjectTitleElement, worklogProjectTimeElement, projectName,
        logLines, PROJECT_TITLE_CLASS, PROJECT_ACCORDION_TITLE_CLASS);
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
    return await htmlHelper.resolveElementWithTimeout(() =>
      document.querySelector(selector));
  } catch (error) {
    extensionLogger.infoFeature(getId(), `Encountered an error on resolving 
    element via '${selector}' selector:`, error);
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
    return await htmlHelper.resolveElementsWithTimeout(() =>
      document.querySelectorAll(selector));
  } catch (error) {
    extensionLogger.infoFeature(getId(), `Encountered an error on resolving 
    elements via '${selector}' selector:`, error);
  }
}

export default {getId, getDescription, isInitialized, isEnabledByDefault,
  initialize, deregister};
