/** Годовая ставка по рассрочке (доля, например 0.12 = 12%). */
export const INSTALLMENT_ANNUAL_RATE = 0.12

export const INSTALLMENT_ANNUAL_RATE_PERCENT = 12

export type InstallmentSchedule = {
  monthlyPayment: number
  totalPayable: number
  overpayment: number
  overpaymentPercent: number
}

/**
 * Равные ежемесячные платежи (аннуитет) при заданной годовой ставке.
 * Платёж округляется вверх до целой гривны; итог «к возврату» = платёж × срок.
 */
export function computeInstallmentSchedule(
  principal: number,
  months: number,
  annualRate: number = INSTALLMENT_ANNUAL_RATE,
): InstallmentSchedule {
  if (principal <= 0 || months <= 0) {
    return { monthlyPayment: 0, totalPayable: 0, overpayment: 0, overpaymentPercent: 0 }
  }
  const r = annualRate / 12
  let monthlyExact: number
  if (r <= 0) {
    monthlyExact = principal / months
  } else {
    monthlyExact = (principal * r) / (1 - (1 + r) ** -months)
  }
  const monthlyPayment = Math.ceil(monthlyExact)
  const totalPayable = monthlyPayment * months
  const overpayment = totalPayable - principal
  const overpaymentPercent = principal > 0 ? (overpayment / principal) * 100 : 0
  return { monthlyPayment, totalPayable, overpayment, overpaymentPercent }
}
