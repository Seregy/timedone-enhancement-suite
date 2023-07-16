import browser from 'webextension-polyfill';
import featureInitializer from '../feature/feature-initializer.js';
import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons.js';

/**
 * Initializes all enabled features
 */
function initializeFeatures() {
  featureInitializer.initializeFeatures();
}

/**
 * Handles the change to the feature settings
 *
 * @param {object} changes object describing the changes
 * @param {string} areaName name of the changed storage area
 */
function handleSettingsChanged(changes, areaName) {
  if (areaName === 'sync') {
    initializeFeatures();
  }
}

/**
 * Initializes the extension
 */
function initializeExtension() {
  UIkit.use(Icons);

  initializeFeatures();
  browser.storage.onChanged.addListener(handleSettingsChanged);
}

initializeExtension();
