/* eslint-disable max-len */
// @ts-check

/**
 * @typedef { import('../../i18n-types').NamespaceFeatureTranslation  } NamespaceFeatureTranslation
 */

/** @type { NamespaceFeatureTranslation  } */
const enFeature = {
  projectTimeDuration: '{hours:number} h. {minutes:number} min.',
  projectTimeDefaultGroupName: 'Ungrouped',
  projectTimeRegexPlaceholder: 'Regex',
  projectTimeRegexDescription: 'Regular expression for grouping records. Must contain exactly one capture group.',
  projectTimeRegexErrorPrefix: 'Regular expression error.',
  projectTimeRegexTooManyGroupsError: 'Too many capture groups in the regular expression: actual amount - {actual:number}, expected - {expected:number}',
  projectTimeRegexNoGroupError: 'Regular expression must contain a capture group',
};

export default enFeature;
