/**
 * @typedef {import('../feature/feature.js').Feature} Feature
 */

/**
 * Returns whether the provided feature should be enabled
 *
 * @param {Feature} feature to initialize
 * @param {Object.<string, boolean>} settings feature settings object with
 *  feature IDs as keys and their enabled status as values
 * @return {boolean} feature enabled status
 */
function isFeatureEnabled(feature, settings) {
  const featureId = feature.getId();
  const enabledInSettings = settings[featureId];

  if (enabledInSettings == null) {
    return feature.isEnabledByDefault();
  }

  return enabledInSettings;
}

export default {isFeatureEnabled};
