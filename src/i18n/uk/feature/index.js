/* eslint-disable max-len */
// @ts-check

/**
 * @typedef { import('../../i18n-types.js').NamespaceFeatureTranslation } NamespaceFeatureTranslation
 */

/** @type { NamespaceFeatureTranslation } */
const ukFeature = {
  projectTimeDuration: '{hours:number} год. {minutes:number} хв.',
  projectTimeDefaultGroupName: 'Без групи',
  projectTimeRegexPlaceholder: 'Regex',
  projectTimeRegexDescription: 'Регулярний вираз для групування записів. Має містити рівно одну групу захоплення.',
  projectTimeRegexErrorPrefix: 'Помилка в регулярному виразі.',
  projectTimeRegexTooManyGroupsError: 'Забагато груп захоплення в виразі: реальна кількість - {actual:number}, очікувана - {expected:number}',
  projectTimeRegexNoGroupError: 'Вираз має містити групу захоплення',
};

export default ukFeature;
