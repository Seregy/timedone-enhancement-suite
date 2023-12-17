import {jwtDecode} from 'jwt-decode';

const API_PREFIX = 'https://timedone.gdnext.com/backend/api';

/**
 * @typedef LogLine
 * @type {object}
 * @property {string} description log line description
 * @property {string} logDate log line date in the yyyy-mm-dd format
 * @property {number} timeUnit integer amount of time units,
 *  1 unit is 30 minutes
 * @property {Project} userProject
 */

/**
 * @typedef Project
 * @type {object}
 * @property {string} projectName project name
 */

/**
 * Fetches user lines for a current user
 *
 * @param {Date} dateFrom starting date to fetch the lines, should be in UTC
 * @param {Date} dateTo ending date to fetch the lines, should be in UTC
 * @return {Promise<Array<LogLine>>} promise for the log lines
 */
async function getUserLogLines(dateFrom, dateTo) {
  const token = localStorage.access_token;
  const userId = jwtDecode(token).sub;
  const dateFromIso = toIsoDate(dateFrom);
  const dateToIso = toIsoDate(dateTo);
  const url = `${API_PREFIX}/v1/lines/users/${userId}` +
   `?dateFrom=${dateFromIso}&dateTo=${dateToIso}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  return await response.json();
}

/**
 * Converts a date object into an ISO date string
 * @param {Date} date date object to convert, should be in UTC
 * @return {string} date string in the yyyy-mm-dd format
 */
function toIsoDate(date) {
  return date.toISOString().split('T')[0];
}

export default {getUserLogLines};
