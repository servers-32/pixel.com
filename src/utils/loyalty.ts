/**
 * Карта лояльности: 1 балл = 0,10 ₴ к оплате (как 0,10 $ за балл).
 * Начисление: 1 балл за каждые 10 ₴ фактически оплаченной суммы (пример: 1000 ₴ → 100 баллов ≈ 10 ₴ купоном).
 */
export const LOYALTY_POINT_VALUE = 0.1

/** Сколько единиц суммы заказа дают 1 балл (10 ₴ → 1 балл) */
export const LOYALTY_SPEND_PER_POINT = 10

export function moneyDiscountFromPoints(points: number): number {
  return Math.round(points * LOYALTY_POINT_VALUE * 100) / 100
}

/** Максимум баллов, которые можно списать с учётом суммы заказа и баланса */
export function maxPointsApplicable(balance: number, cartAfterPromo: number): number {
  if (cartAfterPromo <= 0 || balance <= 0) return 0
  const byCart = Math.floor((cartAfterPromo + 1e-9) / LOYALTY_POINT_VALUE)
  return Math.min(balance, byCart)
}

export function pointsEarnedForPaidAmount(amountPaid: number): number {
  if (amountPaid <= 0) return 0
  return Math.floor(amountPaid / LOYALTY_SPEND_PER_POINT)
}
