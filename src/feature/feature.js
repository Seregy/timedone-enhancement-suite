/* eslint valid-jsdoc: ["error", { "requireReturn": true }] */

/**
 * Feature interface
 *
 * @interface Feature
 */
export class Feature {
  /**
   * Returns a unique feature identifier
   * @return {string} feature ID
   */
  getId() {
    throw new Error('Not implemented');
  }

  /**
   * Returns a feature description
   *
   * Will be used for displaying the feature in the settings
   * @return {string} feature description
   */
  getDescription() {
    throw new Error('Not implemented');
  }

  /**
   * Returns whether the feature has been initialized
   *
   * Must return `true` after successful initialization
   *  and `false` after successful deregistration
   * @return {boolean} feature initilization status
   */
  isInitialized() {
    throw new Error('Not implemented');
  }

  /**
   * Initializes and enables the feature
   * @return {undefined}
   */
  async initialize() {
    throw new Error('Not implemented');
  }

  /**
   * Deregisters and disables the feature
   * @return {undefined}
   */
  async deregister() {
    throw new Error('Not implemented');
  }
}
