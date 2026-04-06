import { useMemo } from 'react'
import styles from './CartHints.module.css'
import { computeCartPromo, FREE_SHIPPING_THRESHOLD, ORDER_DISCOUNT_THRESHOLD } from '../utils/cartPromo'
import { formatMoney } from '../utils/formatMoney'

export function CartHints({ promo }: { promo: ReturnType<typeof computeCartPromo> }) {
  const pct = useMemo(
    () => Math.min(100, Math.round((promo.subtotal / FREE_SHIPPING_THRESHOLD) * 100)),
    [promo.subtotal],
  )

  return (
    <div className={styles.box}>
      {promo.freeShipUnlocked ? (
        <p className={styles.ok}>
          ✓ Бесплатная доставка от {formatMoney(FREE_SHIPPING_THRESHOLD)} — условие выполнено
        </p>
      ) : (
        <p className={styles.hint}>
          До бесплатной доставки осталось <strong>{formatMoney(promo.toFreeShip)}</strong>
        </p>
      )}
      {!promo.freeShipUnlocked ? (
        <div className={styles.bar} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div className={styles.barFill} style={{ width: `${pct}%` }} />
        </div>
      ) : null}

      {promo.discountUnlocked ? (
        <p className={styles.discountOk}>
          Скидка 10% на заказ от {formatMoney(ORDER_DISCOUNT_THRESHOLD)}: −{formatMoney(promo.discount)}
        </p>
      ) : (
        <p className={styles.hintMuted}>
          Добавьте ещё {formatMoney(promo.toDiscount)} — и получите скидку 10% на весь заказ
        </p>
      )}
    </div>
  )
}
