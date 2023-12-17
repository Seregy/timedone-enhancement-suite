/* eslint-disable max-len */
/**
 * @typedef { import('../i18n/i18n-types.js').TranslationFunctions } TranslationFunctions
 * @typedef { import('typesafe-i18n').LocaleTranslationFunctions<Locales, Translations, TranslationFunctions> } LocaleTranslationFunctions
 */ /* eslint-enable max-len */

import {i18n, isLocale, baseLocale} from '../i18n/i18n-util.js';
import {loadAllLocales} from '../i18n/i18n-util.sync.js';

const LOCALE_BY_LANGUAGE = {'en': 'en', 'ua': 'uk'};
/**
 * @type {LocaleTranslationFunctions}
 */
let i18nProvider;

/**
 * Initializes the service
 *
 * Must be executed before retrieving localized strings
 */
function initialize() {
  loadAllLocales();
  i18nProvider = i18n();
}

/**
 * Returns localized string functions
 *
 * @return {TranslationFunctions} localized string functions
 */
function getLocalizedStrings() {
  const currentLocale = getCurrentLocale();

  return i18nProvider[currentLocale];
}

/**
 * Returns current locale
 *
 * @return {string} current locale tag
 */
function getCurrentLocale() {
  const currentLanguage = localStorage.currentLanguage;
  const resolvedLocale = LOCALE_BY_LANGUAGE[currentLanguage];

  if (!isLocale(resolvedLocale)) {
    return baseLocale;
  }

  return resolvedLocale;
}

export default {initialize, getLocalizedStrings};
