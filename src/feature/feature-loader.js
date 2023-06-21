import expandAll from './expand-all/expand-all.js';
import footerBackgroundFix from
  './footer-background-fix/footer-background-fix.js';
import projectAutoselectBugfix from
  './project-autoselect-bugfix/project-autoselect-bugfix.js';

/**
 * @typedef {import('./../feature/feature.js').Feature} Feature
 */

const features = [expandAll, footerBackgroundFix, projectAutoselectBugfix];
const featuresSorted = features.sort((first, second) =>
  first.getId().localeCompare(second.getId()));

/**
 * Returns all supported features
 * @return {Feature[]} supported features
 */
function getFeatures() {
  return featuresSorted;
}

export default {getFeatures};
