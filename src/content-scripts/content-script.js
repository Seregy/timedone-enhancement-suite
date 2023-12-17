import featureInitializer from '../feature/feature-initializer.js';
import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons.js';
import storageService from '../helper/storage-service.js';
import i18nService from '../helper/i18n-service.js';

const APP_ROOT_SELECTOR = 'body app-root';
const APP_ROOT_MUTATION_OBSERVER = new MutationObserver(
    () => initWorklogContainerObserver());

/**
 * Initializes all features
 */
async function initializeFeatures() {
  await featureInitializer.reinitializeFeatures();
}

/**
 * Initializes worklog container mutation observer
 */
function initWorklogContainerObserver() {
  disableAppRootObserver();

  initializeFeatures();

  enableAppRootObserver();
}

/**
 * Initializes the extension
 */
function initializeExtension() {
  UIkit.use(Icons);
  i18nService.initialize();

  initWorklogContainerObserver();
  storageService.addFeatureSettingsChangeListener(initializeFeatures);
}

/**
 * Enables app root mutation observer
 */
function enableAppRootObserver() {
  const rootElement = document.querySelector(APP_ROOT_SELECTOR);
  APP_ROOT_MUTATION_OBSERVER.observe(rootElement, {childList: true});
}

/**
 * Disables app root mutation observer
 */
function disableAppRootObserver() {
  APP_ROOT_MUTATION_OBSERVER.disconnect();
}

initializeExtension();
