import { setCookie } from '@tut/utils';
import { changeLanguage } from 'i18next';

import { TUT_LOCALE_COOKIE } from '@/const/locale';
import { type LocaleMode } from '@/types/locale';
import { getSystemLanguage } from '@/utils/client/systemLanguage';

export const resolveLang = (locale: LocaleMode) =>
  locale === 'auto' ? getSystemLanguage() : locale;

export const switchLang = (locale: LocaleMode) => {
  const lang = resolveLang(locale);

  changeLanguage(lang);
  document.documentElement.lang = lang;

  setCookie(TUT_LOCALE_COOKIE, locale === 'auto' ? undefined : locale, 365);
};
