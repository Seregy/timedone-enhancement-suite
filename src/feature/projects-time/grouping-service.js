import dataStorage from './data/projects-time-data-storage.js';
import collectionService from './collection-service.js';
import extensionLogger from '../../helper/extension-logger.js';

/**
 * @typedef {import('./../../api/api-client.js').LogLine} LogLine
 */

/**
 * Groups log lines by a grouping key
 *
 * Grouping key is extracted by a regular expression, associated with the
 *  project. Two log line entries will be grouped together if regular expression
 *  matches the same substring in the line description.
 *
 * @param {string} featureId ID of the projects-time feature
 * @param {string} projectName name of the project, associated with the
 * log lines
 * @param {Array<LogLine>} logLines log lines to group
 * @return {Promise<Map<string, Array<LogLine>>>} promise for the log lines
 *  grouped by a grouping key
 */
async function groupLogLinesByGroupKey(featureId, projectName, logLines) {
  const currentGroupingType =
    await getCurrentGroupingType(featureId, projectName);

  if (currentGroupingType === GroupType.DESCRIPTION) {
    const groupRegexValue = await dataStorage.getGroupRegexByProject(featureId,
        projectName);
    const groupRegex = groupRegexValue ? new RegExp(groupRegexValue) : null;

    return groupLogLinesByRegex(logLines, groupRegex);
  }

  return groupLogLinesByTicket(logLines);
}

/**
 * Returns current grouping type for the project
 *
 * @param {string} featureId ID of the projects-time feature
 * @param {string} projectName name of the project to get the grouping type for
 * @return {Promise<string>} promise for the grouping type
 */
async function getCurrentGroupingType(featureId, projectName) {
  const type = await dataStorage.getGroupTypeByProject(featureId, projectName);

  return type ? mapToValidGroupType(featureId, type) : GroupType.DESCRIPTION;
}

/**
 * Saves a new grouping type for the project
 *
 * @param {string} featureId unique feature identifier
 * @param {string} projectName project name to save the grouping type for
 * @param {string} newGroupingType grouping type value to save
 */
async function saveCurrentGroupingType(featureId, projectName,
    newGroupingType) {
  const groupingTypeToSave = mapToValidGroupType(featureId, newGroupingType);
  await dataStorage.saveGroupTypeForProject(featureId, projectName,
      groupingTypeToSave);
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
  return collectionService.groupToMap(logLines,
      (logLine) => extractGroupingKey(logLine, regex));
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
 * Groups log lines by the ticket value
 *
 * @param {Array<LogLine>} logLines log lines to group
 * @return {Promise<Map<string, Array<LogLine>>>} promise for the log lines
 *  grouped by a ticket
 */
function groupLogLinesByTicket(logLines) {
  return collectionService.groupToMap(logLines,
      (logLine) => extractTicketValue(logLine));
}

/**
 * Extracts the ticket value from the log line entry
 *
 * @param {LogLine} logLine log line to extract the ticket from
 * @return {string | null} extracted ticket value or null if it's not present
 *  in the entry
 */
function extractTicketValue(logLine) {
  const ticketValue = logLine.ticket;
  if (!ticketValue) {
    return null;
  }

  return ticketValue.trim();
}

/**
 * Transforms a group type string into a valid type value
 *
 * Invalid values will be replaced with a default group type
 *
 * @param {string} featureId unique feature identifier
 * @param {string} originalGroupType potentially invalid group type value
 * @return {string} valid group type value
 */
function mapToValidGroupType(featureId, originalGroupType) {
  if (originalGroupType === GroupType.DESCRIPTION ||
        originalGroupType === GroupType.TICKET) {
    return originalGroupType;
  }

  extensionLogger.infoFeature(featureId,
      `Group type '${originalGroupType}' is invalid and will be substituted`);

  return GroupType.DESCRIPTION;
}

const GroupType = {
  DESCRIPTION: 'description',
  TICKET: 'ticket',
};

export default {groupLogLinesByGroupKey, getCurrentGroupingType,
  saveCurrentGroupingType, GroupType};
