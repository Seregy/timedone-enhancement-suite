import dataStorage from '../data/projects-time-data-storage.js';
import UIkit from 'uikit';
import i18nService from '../../../helper/i18n-service.js';
import groupingService from '../grouping-service.js';

const PROJECT_GROUPS_CONTAINER_ID_PREFIX = 'tes-pt-project-groups-';
const PROJECT_REGEX_INPUT_ID_PREFIX = 'tes-pt-project-group-regex-';
const PROJECT_GROUP_TITLE_CLASS = 'tes-pt-group-title';
const FORM_ERROR_CLASS = 'uk-form-danger';
const ACCORDION_CONTENT_CLASS = 'uk-accordion-content';
const ACCORDION_TITLE_CLASS = 'uk-accordion-title';

/**
 * @typedef {import('./../../../api/api-client.js').LogLine} LogLine
 */

/**
 * Builds project container
 *
 * @param {string} featureId unique feature identifier
 * @param {HTMLElement} worklogProjectTitleElement original worklog project
 *  title element
 * @param {HTMLElement} worklogProjectTimeElement original worklog project
 *  time element
 * @param {string} projectName name of the project
 * @param {Array<LogLine>} logLines log line entries
 * @param {string} projectTitleClass name of the project title element CSS class
 * @param {string} projectAccordionTitleClass name of the accordion title
 *  element CSS class for the project title element
 * @return {Promise<HTMLDivElement>} promise for the project container
 */
async function buildProjectContainer(featureId, worklogProjectTitleElement,
    worklogProjectTimeElement, projectName, logLines,
    projectTitleClass, projectAccordionTitleClass) {
  const newProjectContainer = document.createElement('div');

  const projectAccordionTitleElement = document.createElement('div');
  projectAccordionTitleElement.classList.add(projectAccordionTitleClass);
  newProjectContainer.append(projectAccordionTitleElement);
  worklogProjectTitleElement.classList.add(projectTitleClass);
  projectAccordionTitleElement.append(worklogProjectTitleElement);
  projectAccordionTitleElement.append(worklogProjectTimeElement);

  const projectDetails = document.createElement('div');
  projectDetails.classList.add(ACCORDION_CONTENT_CLASS);

  const groupRegexContainer = document.createElement('div');
  groupRegexContainer.classList.add('uk-flex', 'uk-flex-right');

  const currentGroupingType =
   await groupingService.getCurrentGroupingType(featureId, projectName);
  const descriptionGroupingEnabled =
    currentGroupingType === groupingService.GroupType.DESCRIPTION;

  const groupTypeForm = await buildGroupTypeForm(featureId, projectName,
      logLines, descriptionGroupingEnabled);
  groupRegexContainer.append(groupTypeForm);

  const groupRegexFormContainer = document.createElement('div');
  groupRegexFormContainer.classList.add('uk-inline', 'uk-margin-small-bottom');

  const groupRegexInputElement = await buildRegexInputElement(featureId,
      projectName, logLines, descriptionGroupingEnabled);
  groupRegexFormContainer.append(groupRegexInputElement);
  const groupRegexIconElement = document.createElement('button');
  groupRegexIconElement.classList.add('uk-form-icon', 'uk-form-icon-flip');
  groupRegexIconElement.setAttribute('uk-icon', 'icon: info');
  const regexTooltipValue = i18nService.getLocalizedStrings().feature
      .projectTimeRegexDescription();
  groupRegexIconElement.setAttribute('uk-tooltip', regexTooltipValue);
  groupRegexFormContainer.append(groupRegexIconElement);

  groupRegexContainer.append(groupRegexFormContainer);
  projectDetails.append(groupRegexContainer);

  const projectGroups = await buildProjectGroupsContainer(featureId,
      projectName, logLines);
  projectDetails.append(projectGroups);
  newProjectContainer.append(projectDetails);

  return newProjectContainer;
}

/**
 * Creates a group type form
 *
 * @param {string} featureId unique feature identifier
 * @param {string} projectName name of the project
 * @param {Array<LogLine>} logLines log line entries
 * @param {boolean} descriptionGroupingEnabled indicator whether the
 *  description grouping is enabled
 * @return {Promise<HTMLFormElement>} promise for the group type form element
 */
async function buildGroupTypeForm(featureId, projectName, logLines,
    descriptionGroupingEnabled) {
  const groupTypeForm = document.createElement('form');
  groupTypeForm.classList.add('uk-margin-small-bottom', 'uk-margin-right');

  const groupTypeContainer = document.createElement('div');
  groupTypeContainer.classList.add('uk-form-controls', 'uk-form-controls-text');
  groupTypeForm.append(groupTypeContainer);

  const groupTypeToggleTitle = document.createElement('span');
  groupTypeToggleTitle.classList.add('uk-form-label');
  groupTypeToggleTitle.textContent = i18nService.getLocalizedStrings().feature
      .projectTimeGroupingTypeTitle() + ' ';
  groupTypeContainer.append(groupTypeToggleTitle);

  const groupTypeTicket = groupingService.GroupType.TICKET;
  const groupTypeTicketLabel = i18nService.getLocalizedStrings().feature
      .projectTimeTicketGroupingType();
  const ticketGroupTypeLabel = buildGroupTypeLabel(groupTypeTicketLabel,
      groupTypeTicket, !descriptionGroupingEnabled, featureId, projectName,
      logLines);
  groupTypeContainer.append(ticketGroupTypeLabel);

  const groupTypeDescriptionLabel = i18nService.getLocalizedStrings().feature
      .projectTimeDescriptionGroupingType();
  const groupTypeDescription = groupingService.GroupType.DESCRIPTION;
  const descriptionGroupTypeLabel = buildGroupTypeLabel(
      groupTypeDescriptionLabel, groupTypeDescription,
      descriptionGroupingEnabled, featureId, projectName, logLines);
  groupTypeContainer.append(descriptionGroupTypeLabel);

  return groupTypeForm;
}

/**
 * Creates a group type label
 *
 * @param {string} text label text
 * @param {string} groupType group type value
 * @param {boolean} enabled indicator whether the type is enabled
 * @param {string} featureId unique feature identifier
 * @param {string} projectName name of the project
 * @param {Array<LogLine>} logLines log line entries
 * @return {HTMLLabelElement} group type label element
 */
function buildGroupTypeLabel(text, groupType, enabled, featureId, projectName,
    logLines) {
  const groupTypeLabel = document.createElement('label');
  groupTypeLabel.classList.add('uk-margin-left');
  const groupTypeRadio = document.createElement('input');
  groupTypeRadio.classList.add('uk-radio', 'uk-margin-small-right');
  groupTypeRadio.type = 'radio';
  groupTypeRadio.name = 'groupType';
  groupTypeRadio.value = groupType;
  groupTypeRadio.checked = enabled;
  groupTypeRadio.addEventListener('change',
      (changeEvent) => handleProjectGroupTypeChange(featureId, projectName,
          changeEvent, logLines));
  groupTypeLabel.append(groupTypeRadio);

  const groupTypeText = document.createTextNode(text);
  groupTypeLabel.append(groupTypeText);

  return groupTypeLabel;
}

/**
 * Handles the project grouping type value change event
 *
 * @param {string} featureId unique feature identifier
 * @param {string} projectName name of the project, associated with the grouping
 * @param {Event} event change event
 * @param {Array<LogLine>} logLines log line entries
 */
async function handleProjectGroupTypeChange(featureId, projectName, event,
    logLines) {
  const inputElement = event.target;
  const groupTypeFromUser = inputElement.value;

  const projectElementId = convertProjectNameToElementId(projectName);
  const elementId = PROJECT_REGEX_INPUT_ID_PREFIX + projectElementId;
  const groupRegexElement = document.querySelector('#' + elementId);
  if (groupTypeFromUser === groupingService.GroupType.DESCRIPTION) {
    groupRegexElement.disabled = false;
  } else if (groupTypeFromUser === groupingService.GroupType.TICKET) {
    groupRegexElement.disabled = true;
  }

  await groupingService.saveCurrentGroupingType(featureId, projectName,
      groupTypeFromUser);
  regenerateProjectGroups(featureId, projectName, logLines);
}

/**
 * Creates a regex input element for the project
 *
 * @param {string} featureId unique feature identifier
 * @param {string} projectName name of the project
 * @param {Array<LogLine>} logLines log line entries
 * @param {boolean} enabled indicator whether the regex input is enabled
 * @return {Promise<HTMLInputElement>} promise for the regex input element
 */
async function buildRegexInputElement(featureId, projectName,
    logLines, enabled) {
  const groupRegexElement = document.createElement('input');
  const projectElementId = convertProjectNameToElementId(projectName);
  groupRegexElement.id = PROJECT_REGEX_INPUT_ID_PREFIX + projectElementId;
  groupRegexElement.classList.add('uk-input', 'uk-form-small',
      'uk-form-width-small');
  groupRegexElement.placeholder =
    i18nService.getLocalizedStrings().feature.projectTimeRegexPlaceholder();
  groupRegexElement.addEventListener('change',
      (changeEvent) => handleProjectRegexChange(featureId, projectName,
          changeEvent, logLines));

  const savedGroupRegex =
    await dataStorage.getGroupRegexByProject(featureId, projectName);
  groupRegexElement.value = savedGroupRegex || '';
  if (!enabled) {
    groupRegexElement.disabled = true;
  }

  return groupRegexElement;
}

/**
 * Creates a container with grouped project log entries
 *
 * @param {string} featureId unique feature identifier
 * @param {string} projectName name of the project
 * @param {Array<LogLine>} logLines log line entries
 * @return {Promise<HTMLDivElement>} promise for the project groups container
 */
async function buildProjectGroupsContainer(featureId, projectName, logLines) {
  const projectGroups = document.createElement('div');
  const projectElementId = convertProjectNameToElementId(projectName);
  projectGroups.id = PROJECT_GROUPS_CONTAINER_ID_PREFIX + projectElementId;

  const groupContainers = await buildProjectGroupContainers(featureId,
      projectName, logLines);
  projectGroups.append(...groupContainers);

  return projectGroups;
}

/**
 * Creates group containers for all log entry groups
 *
 * @param {string} featureId unique feature identifier
 * @param {string} projectName name of the project
 * @param {Array<LogLine>} logLines log line entries
 * @return {Promise<Array<HTMLDivElement>>} promise for the project group
 *  containers
 */
async function buildProjectGroupContainers(featureId, projectName, logLines) {
  const logLinesByGroupingKey =
    await groupingService.groupLogLinesByGroupKey(featureId, projectName,
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
 */
async function handleProjectRegexChange(featureId, projectName, event,
    logLines) {
  const inputElement = event.target;
  const regexFromUser = inputElement.value;
  const validRegex = validateRegexValue(regexFromUser, inputElement);
  if (!validRegex) {
    return;
  }

  await dataStorage.saveGroupRegexForProject(featureId, projectName,
      regexFromUser);
  await regenerateProjectGroups(featureId, projectName, logLines);
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
    const errorMessage = i18nService.getLocalizedStrings().feature
        .projectTimeRegexErrorPrefix + ' ' + regexError;
    regexInputElement.setCustomValidity(errorMessage);
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
    const message =
      i18nService.getLocalizedStrings().feature.projectTimeRegexNoGroupError();
    return new Error(message);
  }

  const message = i18nService.getLocalizedStrings().feature
      .projectTimeRegexTooManyGroupsError({actual: capturingGroupsAmount,
        expected: 1});
  return new Error(message);
}

/**
 * Regenerates project groups element
 *
 * Replaces existing project groups with new ones, designed for usage after
 *  changing the grouping key
 *
 * @param {string} featureId unique feature identifier
 * @param {string} projectName name of the project, associated with the regex
 * @param {Array<LogLine>} logLines log line entries
 */
async function regenerateProjectGroups(featureId, projectName, logLines) {
  const projectElementId = convertProjectNameToElementId(projectName);
  const selector = '#' + PROJECT_GROUPS_CONTAINER_ID_PREFIX + projectElementId;
  const projectGroupsContainer = document.querySelector(selector);
  if (!projectGroupsContainer) {
    return;
  }

  const projectGroups = await buildProjectGroupContainers(featureId,
      projectName, logLines);

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
  const groupTitle = groupName !== null ?
    groupName :
    i18nService.getLocalizedStrings().feature.projectTimeDefaultGroupName();
  groupSummaryTitleElement.textContent = groupTitle;
  groupSummaryContainer.append(groupSummaryTitleElement);

  const groupTimeElement = document.createElement('span');
  const totalGroupTimeUnits = logLines.reduce((accumulator, entry) =>
    accumulator + entry.timeUnit, 0);
  const localizedTimeString = timeUnitsToString(totalGroupTimeUnits);
  groupTimeElement.textContent = localizedTimeString;
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
  logDescription.textContent = logLine.description;
  container.append(logDescription);

  const logLineDetailsElement = document.createElement('span');
  const logDurationString = timeUnitsToString(logLine.timeUnit);
  const logDateString = isoDateToString(logLine.logDate);
  const logLineDetails = `${logDurationString} | ${logDateString}`;
  logLineDetailsElement.textContent = logLineDetails;
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

  return i18nService.getLocalizedStrings().feature.projectTimeDuration(
      {hours: hours, minutes: minutes});
}

/**
 * Converts the provided ISO date string into a human-readable one
 *
 * @param {string} isoDateString date string in the yyyy-mm-dd format
 * @return {string} localized date string
 */
function isoDateToString(isoDateString) {
  const dateParts = isoDateString.split('-');
  const utcDate = new Date(Date.UTC(dateParts[0], dateParts[1] - 1,
      dateParts[2]));

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
