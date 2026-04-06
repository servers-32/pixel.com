import { getCurrentLocale, localeToIntl } from '../i18n'

/** Текущая Intl-локаль интерфейса. */
export function getAppLocale(): string {
  return localeToIntl(getCurrentLocale())
}
