import dataStorage from '../data/projects-time-data-storage.js';
import UIkit from 'uikit';

const PROJECT_GROUPS_CONTAINER_ID_PREFIX = 'tes-pt-project-groups-';
const PROJECT_GROUP_TITLE_CLASS = 'tes-pt-group-title';
const FORM_ERROR_CLASS = 'uk-form-danger';
const ACCORDION_CONTENT_CLASS = 'uk-accordion-content';
const ACCORDION_TITLE_CLASS = 'uk-accordion-title';
const DEFAULT_LOG_GROUP_NAME = 'Ungrouped';
const EMPTY_REGEX_PLACEHOLDER = 'Regex';
const REGEX_INPUT_TOOLTIP = 'Регулярний вираз для групування записів.<br>' +
  'Має містити рівно одну групу захоплення.';
const REGEX_INPUT_ERROR_MESSAGE_PREFIX = 'Помилка в регулярному виразі. ';
const REGEX_MISSING_GROUP_ERROR = 'Вираз має містити групу захоплення';
const regexTooManyGroupsErrorMessageGenerator = (groupsAmount) =>
  `Забагато груп захоплення в виразі: реальна кількість - ${groupsAmount}, ` +
   'очікувана - 1';

/**
 * @typedef {import('./../../../api/api-client.js').LogLine} LogLine
 */

/**
 * Function that groups log lines by a grouping key
 *
 * @callback linesGroupingFunction
 * @param {string} projectName name of the project, associated with the
 * log lines
 * @param {Array<LogLine>} logLines log lines to group
 * @return {Promise<Map<string, Array<LogLine>>>} promise for the log lines
 *  grouped by a grouping key
 */

/**
 * Builds project container
 *
 * @param {string} featureId unique feature identifier
 * @param {HTMLElement} worklogProjectElement original worklog project element
 * @param {string} projectName name of the project
 * @param {Array<LogLine>} logLines log line entries
 * @param {linesGroupingFunction} groupLogLinesByGroupKey lines grouping
 *  function
 * @param {string} projectTitleClass name of the project title element CSS class
 * @param {string} projectAccordionTitleClass name of the accordion title
 *  element CSS class for the project title element
 * @return {Promise<HTMLDivElement>} promise for the project container
 */
async function buildProjectContainer(featureId, worklogProjectElement,
    projectName, logLines, groupLogLinesByGroupKey, projectTitleClass,
    projectAccordionTitleClass) {
  const newProjectContainer = document.createElement('div');

  const projectAccordionTitleElement = document.createElement('div');
  projectAccordionTitleElement.classList.add(projectAccordionTitleClass);
  newProjectContainer.append(projectAccordionTitleElement);
  worklogProjectElement.classList.add(projectTitleClass);
  projectAccordionTitleElement.append(worklogProjectElement);

  const projectDetails = document.createElement('div');
  projectDetails.classList.add(ACCORDION_CONTENT_CLASS);

  const groupRegexContainer = document.createElement('div');
  groupRegexContainer.classList.add('uk-flex', 'uk-flex-right');
  const groupRegexFormContainer = document.createElement('div');
  groupRegexFormContainer.classList.add('uk-inline', 'uk-margin-small-bottom');

  const groupRegexInputElement = await buildRegexInputElement(featureId,
      projectName, logLines, groupLogLinesByGroupKey);
  groupRegexFormContainer.append(groupRegexInputElement);
  const groupRegexIconElement = document.createElement('button');
  groupRegexIconElement.classList.add('uk-form-icon', 'uk-form-icon-flip');
  groupRegexIconElement.setAttribute('uk-icon', 'icon: info');
  groupRegexIconElement.setAttribute('uk-tooltip', REGEX_INPUT_TOOLTIP);
  groupRegexFormContainer.append(groupRegexIconElement);

  groupRegexContainer.append(groupRegexFormContainer);
  projectDetails.append(groupRegexContainer);

  const projectGroups = await buildProjectGroupsContainer(projectName,
      logLines, groupLogLinesByGroupKey);
  projectDetails.append(projectGroups);
  newProjectContainer.append(projectDetails);

  return newProjectContainer;
}

/**
 * Creates a regex input element for the project
 *
 * @param {string} featureId unique feature identifier
 * @param {string} projectName name of the project
 * @param {Array<LogLine>} logLines log line entries
 * @param {Function} groupLogLinesByGroupKey function
 * @return {Promise<HTMLInputElement>} promise for the regex input element
 */
async function buildRegexInputElement(featureId, projectName,
    logLines, groupLogLinesByGroupKey) {
  const groupRegexElement = document.createElement('input');
  groupRegexElement.classList.add('uk-input', 'uk-form-small',
      'uk-form-width-small');
  groupRegexElement.placeholder = EMPTY_REGEX_PLACEHOLDER;
  groupRegexElement.addEventListener('change',
      (changeEvent) => handleProjectRegexChange(featureId, projectName,
          changeEvent, logLines, groupLogLinesByGroupKey));

  const savedGroupRegex =
    await dataStorage.getGroupRegexByProject(featureId, projectName);
  groupRegexElement.value = savedGroupRegex || '';

  return groupRegexElement;
}

/**
 * Creates a container with grouped project log entries
 *
 * @param {string} projectName name of the project
 * @param {Array<LogLine>} logLines log line entries
 * @param {linesGroupingFunction} groupLogLinesByGroupKey lines grouping
 *  function
 * @return {Promise<HTMLDivElement>} promise for the project groups container
 */
async function buildProjectGroupsContainer(projectName, logLines,
    groupLogLinesByGroupKey) {
  const projectGroups = document.createElement('div');
  const projectElementId = convertProjectNameToElementId(projectName);
  projectGroups.id = PROJECT_GROUPS_CONTAINER_ID_PREFIX + projectElementId;

  const groupContainers = await buildProjectGroupContainers(projectName,
      logLines, groupLogLinesByGroupKey);
  projectGroups.append(...groupContainers);

  return projectGroups;
}

/**
 * Creates group containers for all log entry groups
 *
 * @param {string} projectName name of the project
 * @param {Array<LogLine>} logLines log line entries
 * @param {linesGroupingFunction} groupLogLinesByGroupKey lines grouping
 *  function
 * @return {Promise<Array<HTMLDivElement>>} promise for the project group
 *  containers
 */
async function buildProjectGroupContainers(projectName, logLines,
    groupLogLinesByGroupKey) {
  const logLinesByGroupingKey = await groupLogLinesByGroupKey(projectName,
      logLines);
  const logLinesByGroupingKeySorted = new Map([...logLinesByGroupingKey]
      .sort((firstEntry, secondEntry) =>
        String(firstEntry[0]).localeCompare(secondEntry[0])));

  return Array.from(logLinesByGroupingKeySorted, ([groupName, logLines]) =>
    buildProjectGroupContainer(logLines, groupName));
}

/**
 * Handles the project regex value change event
 *
 * @param {string} featureId unique feature identifier
 * @param {string} projectName name of the project, associated with the regex
 * @param {Event} event change event
 * @param {Array<LogLine>} logLines log line entries
 * @param {Function} groupLogLinesByGroupKey function
 */
async function handleProjectRegexChange(featureId, projectName, event,
    logLines, groupLogLinesByGroupKey) {
  const inputElement = event.target;
  const regexFromUser = inputElement.value;
  const validRegex = validateRegexValue(regexFromUser, inputElement);
  if (!validRegex) {
    return;
  }

  await dataStorage.saveGroupRegexForProject(featureId, projectName,
      regexFromUser);
  regenerateProjectGroups(projectName, logLines, groupLogLinesByGroupKey);
}

/**
 * Validates regex value input
 *
 * Provides an error to the user on invalid input value
 *
 * @param {string} regexValue regex value provided by the user
 * @param {HTMLInputElement} regexInputElement regex HTML input element
 * @return {boolean} whether the user provided regex is valid or not
 */
function validateRegexValue(regexValue, regexInputElement) {
  const regexError = getInvalidRegexError(regexValue);

  if (regexError) {
    regexInputElement.setCustomValidity(REGEX_INPUT_ERROR_MESSAGE_PREFIX +
      regexError);
    regexInputElement.classList.add(FORM_ERROR_CLASS);

    setTimeout(() => {
      regexInputElement.reportValidity();
    }, 0);

    return false;
  }

  regexInputElement.setCustomValidity('');
  regexInputElement.classList.remove(FORM_ERROR_CLASS);

  return true;
}

/**
 * Gets an error on invalid regex value
 *
 * @param {string} regexValue regex value string
 * @return {Error} error if the regex is invalid or null if it's valid
 */
function getInvalidRegexError(regexValue) {
  if (regexValue === '') {
    return null;
  }

  const regexSyntaxError = validateRegexValueSyntax(regexValue);
  if (regexSyntaxError) {
    return regexSyntaxError;
  }

  return validateRegexGroupsAmount(regexValue);
}

/**
 * Validates the regex value syntax
 *
 * @param {string} regexValue regex value string to be validated
 * @return {Error} error if the value can't be parsed as a valid regex,
 *  or null if it's valid
 */
function validateRegexValueSyntax(regexValue) {
  try {
    new RegExp(regexValue);
  } catch (e) {
    return e;
  }
}

/**
 * Validates the amount of capturing groups in the regex
 *
 * @param {string} regexValue regex value string to be validated
 * @return {Error} error if the regex value contains an invalid amount of
 *  groups, or null if it's valid
 */
function validateRegexGroupsAmount(regexValue) {
  const regexMatchingEmptyString = new RegExp(regexValue + '|');
  const capturingGroupsAmount = regexMatchingEmptyString.exec('').length - 1;

  if (capturingGroupsAmount === 1) {
    return null;
  }

  if (capturingGroupsAmount === 0) {
    return new Error(REGEX_MISSING_GROUP_ERROR);
  }

  const message =
    regexTooManyGroupsErrorMessageGenerator(capturingGroupsAmount);
  return new Error(message);
}

/**
 * Regenerates project groups element
 *
 * Replaces existing project groups with new ones, designed for usage after
 *  changing the grouping key
 *
 * @param {string} projectName name of the project, associated with the regex
 * @param {Array<LogLine>} logLines log line entries
 * @param {Function} groupLogLinesByGroupKey function
 */
async function regenerateProjectGroups(projectName, logLines,
    groupLogLinesByGroupKey) {
  const projectElementId = convertProjectNameToElementId(projectName);
  const selector = '#' + PROJECT_GROUPS_CONTAINER_ID_PREFIX + projectElementId;
  const projectGroupsContainer = document.querySelector(selector);
  if (!projectGroupsContainer) {
    return;
  }

  const projectGroups = await buildProjectGroupContainers(projectName, logLines,
      groupLogLinesByGroupKey);

  projectGroupsContainer.replaceChildren(...projectGroups);
}

/**
 * Creates a container for a single project group
 *
 * @param {Array<LogLine>} logLines log lines, associated with the group
 * @param {string} groupName name of the group
 * @return {HTMLDivElement} project group container
 */
function buildProjectGroupContainer(logLines, groupName) {
  const groupSummaryContainer =
    buildGroupSummaryContainer(logLines, groupName);

  const groupTitleElement = document.createElement('a');
  groupTitleElement.classList.add(ACCORDION_TITLE_CLASS);
  groupTitleElement.append(groupSummaryContainer);

  const accordionElement = document.createElement('ul');
  accordionElement.classList.add('uk-list');

  const accordionEntryElement = document.createElement('li');
  accordionEntryElement.append(groupTitleElement);
  const groupDetailsContainer = document.createElement('div');
  groupDetailsContainer.classList.add(ACCORDION_CONTENT_CLASS,
      'uk-flex', 'uk-flex-column');
  logLines.forEach((entry) => {
    const logLineElement = buildLogLineContainer(entry);
    groupDetailsContainer.append(logLineElement);
  });
  accordionEntryElement.append(groupDetailsContainer);

  accordionElement.append(accordionEntryElement);
  UIkit.accordion(accordionElement);

  const groupContainer = document.createElement('div');
  groupContainer.append(accordionElement);

  return groupContainer;
}

/**
 * Creates a group summary container
 *
 * @param {Array<LogLine>} logLines log lines, associated with the group
 * @param {string} groupName name of the group
 * @return {HTMLDivElement} group summary container
 */
function buildGroupSummaryContainer(logLines, groupName) {
  const groupSummaryContainer = document.createElement('div');
  groupSummaryContainer.classList.add('uk-flex', 'uk-flex-column');

  const groupSummaryTitleElement = document.createElement('span');
  groupSummaryTitleElement.classList.add(PROJECT_GROUP_TITLE_CLASS);
  const groupTitle = groupName !== null ? groupName : DEFAULT_LOG_GROUP_NAME;
  groupSummaryTitleElement.innerHTML = groupTitle;
  groupSummaryContainer.append(groupSummaryTitleElement);

  const groupTimeElement = document.createElement('span');
  const totalGroupTimeUnits = logLines.reduce((accumulator, entry) =>
    accumulator + entry.timeUnit, 0);
  const localizedTimeString = timeUnitsToString(totalGroupTimeUnits);
  groupTimeElement.innerHTML = localizedTimeString;
  groupTimeElement.classList.add('uk-text-normal', 'uk-text-default');

  groupSummaryContainer.append(groupTimeElement);

  return groupSummaryContainer;
}

/**
 * Creates a log line container
 *
 * @param {LogLine} logLine log line
 * @return {HTMLDivElement} log line container
 */
function buildLogLineContainer(logLine) {
  const container = document.createElement('div');
  container.classList.add('uk-flex', 'uk-flex-column', 'uk-margin-small');
  const logDescription = document.createElement('span');
  logDescription.innerHTML = logLine.description;
  container.append(logDescription);

  const logLineDetailsElement = document.createElement('span');
  const logDurationString = timeUnitsToString(logLine.timeUnit);
  const logDateString = isoDateToString(logLine.logDate);
  const logLineDetails = `${logDurationString} | ${logDateString}`;
  logLineDetailsElement.innerHTML = logLineDetails;
  logLineDetailsElement.classList.add('uk-text-meta');
  container.append(logLineDetailsElement);

  return container;
}

/**
 * Converts time units into human-readable duration
 *
 * @param {number} timeUnits integer amount of work log time units, 1 unit is 30
 *  minutes
 * @return {string} localized duration string
 */
function timeUnitsToString(timeUnits) {
  const hours = Math.floor(timeUnits / 2);
  const minutes = timeUnits % 2 * 30;

  return hours + ' год. ' + minutes + ' хв.';
}

/**
 * Converts the provided ISO date string into a human-readable one
 *
 * @param {string} isoDateString date string in the yyyy-mm-dd format
 * @return {string} localized date string
 */
function isoDateToString(isoDateString) {
  const dateParts = isoDateString.split('-');
  const utcDate = new Date(Date.UTC(dateParts[0], dateParts[1], dateParts[2]));

  return utcDate.toLocaleDateString('uk-UA');
}

/**
 * Converts the provided project name into an element ID
 *
 * @param {string} projectName name
 * @return {string} converted project element ID
 */
function convertProjectNameToElementId(projectName) {
  return projectName.replaceAll(' ', '-');
}

export default {buildProjectContainer};
