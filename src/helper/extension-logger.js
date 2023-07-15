import storageService from './storage-service.js';

const LOGGING_DATA_STORAGE_KEY = 'logging';

/**
 * Logs an extension-specific message using the info level
 *
 * Message will be displayed only if the logging is enabled for the extension
 *
 * @param {string} message message to be logged
 * @param {Array<object>} objects additional objects to be logged
 */
function info(message, objects) {
  storageService.getGlobalData(LOGGING_DATA_STORAGE_KEY)
      .then((debugData) => {
        if (debugData.enabled) {
          printMessage(console.log, message, objects);
        }
      });
}

/**
 * Function that accepts a message for logging
 *
 * @callback logger
 * @param {string} message message to be logged
 * @param {Array<object>} objects additional objects to be logged
 */

/**
 * Prints the message using the provided logger
 *
 * @param {logger} logger logger for printing the message
 * @param {string} message message to be printed
 * @param {Array<object>} objects additional objects to be logged
 */
function printMessage(logger, message, objects) {
  logger(message, objects);
}

export default {info};
