/* eslint-disable max-len */
// @ts-check

/**
 * @typedef { import('../../i18n-types.js').NamespaceFeatureTranslation } NamespaceFeatureTranslation
 */

/** @type { NamespaceFeatureTranslation } */
const ukFeature = {
  projectTimeDuration: '{hours:number} год. {minutes:number} хв.',
  projectTimeDefaultGroupName: 'Без групи',
  projectTimeGroupingTypeTitle: 'Групувати за:',
  projectTimeTicketGroupingType: 'номером задачі',
  projectTimeDescriptionGroupingType: 'описом',
  projectTimeRegexPlaceholder: 'Regex',
  projectTimeRegexDescription: 'Регулярний вираз для групування записів за описом. Має містити рівно одну групу захоплення.',
  projectTimeRegexErrorPrefix: 'Помилка в регулярному виразі.',
  projectTimeRegexTooManyGroupsError: 'Забагато груп захоплення в виразі: реальна кількість - {actual:number}, очікувана - {expected:number}',
  projectTimeRegexNoGroupError: 'Вираз має містити групу захоплення',
};

export default ukFeature;
