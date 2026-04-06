import { getAppLocale } from './locale'

/** Форматирование сумм в гривнах (Украина). */
export function formatMoney(amount: number): string {
  return new Intl.NumberFormat(getAppLocale(), {
    style: 'currency',
    currency: 'UAH',
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Для сумм с копейками (баллы лояльности и т.п.) */
export function formatMoneyFine(amount: number): string {
  return new Intl.NumberFormat(getAppLocale(), {
    style: 'currency',
    currency: 'UAH',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}
