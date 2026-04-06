import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './InstallmentModal.module.css'
import { setPreferInstallmentCheckout } from '../utils/checkoutStorage'
import { computeInstallmentSchedule } from '../utils/installment'
import { formatMoney } from '../utils/formatMoney'

const TERMS = [12, 24, 36] as const

type Props = {
  open: boolean
  onClose: () => void
  productName: string
  price: number
}

export function InstallmentModal({ open, onClose, productName, price }: Props) {
  const navigate = useNavigate()
  const rows = useMemo(
    () =>
      TERMS.map((months) => {
        const s = computeInstallmentSchedule(price, months)
        return { months, ...s }
      }),
    [price],
  )

  if (!open) return null

  return (
    <div className={styles.root}>
      <button type="button" className={styles.backdrop} aria-label="Закрыть" onClick={onClose} />
      <div className={styles.modal} role="dialog" aria-modal aria-labelledby="inst-title">
        <div className={styles.head}>
          <h2 id="inst-title" className={styles.title}>
            Рассрочка 12% годовых
          </h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>
        <p className={styles.product}>{productName}</p>
        <p className={styles.priceLine}>
          Полная стоимость: <strong>{formatMoney(price)}</strong>
        </p>
        <p className={styles.hint}>
          Расчёт равных платежей (аннуитет) при 12% годовых, без учёта комиссий банка и страховок. Окончательное решение
          и оформление — у партнёрского банка после проверки заявки.
        </p>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Срок</th>
              <th>Платёж / мес.</th>
              <th>Переплата</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ months, monthlyPayment, overpaymentPercent }) => (
              <tr key={months}>
                <td>{months} мес.</td>
                <td className={styles.em}>{formatMoney(monthlyPayment)}</td>
                <td>
                  <span className={styles.overpay}>+{overpaymentPercent.toFixed(1)}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className={styles.note}>
          Первый взнос и комиссии банка уточняйте при оформлении. Условия могут отличаться — сверяйте с договором.
        </p>
        <div className={styles.actions}>
          <button type="button" className={styles.ok} onClick={onClose}>
            Понятно
          </button>
          <button
            type="button"
            className={styles.checkout}
            onClick={() => {
              onClose()
              setPreferInstallmentCheckout()
              navigate('/checkout')
            }}
          >
            Оформить в рассрочку
          </button>
        </div>
      </div>
    </div>
  )
}
