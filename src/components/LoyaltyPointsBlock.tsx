import { Link } from 'react-router-dom'
import styles from './LoyaltyPointsBlock.module.css'
import { useShop } from '../context/useShop'
import { LOYALTY_POINT_VALUE, LOYALTY_SPEND_PER_POINT } from '../utils/loyalty'
import { formatMoneyFine } from '../utils/formatMoney'

type Props = {
  /** компактный вид для выезжающей корзины */
  compact?: boolean
}

export function LoyaltyPointsBlock({ compact }: Props) {
  const {
    currentUser,
    loyaltyPointsBalance,
    loyaltyPointsToSpend,
    maxLoyaltyPointsApplicable,
    setLoyaltyPointsToSpend,
    cartLoyaltyDiscount,
    cartPromoTotal,
  } = useShop()

  if (!currentUser) {
    return (
      <div className={`${styles.box} ${compact ? styles.compact : ''}`}>
        <div className={styles.title}>Карта лояльности</div>
        <p className={styles.hint}>
          Войдите в аккаунт — копите баллы и оплачивайте ими до{' '}
          {formatMoneyFine(LOYALTY_POINT_VALUE)} за балл. Начисление: 1 балл за каждые {LOYALTY_SPEND_PER_POINT}{' '}
          ₴ оплаты.
        </p>
        <div className={styles.links}>
          <Link to="/login" className={styles.link}>
            Войти
          </Link>
          <Link to="/register" className={styles.linkMuted}>
            Регистрация
          </Link>
        </div>
      </div>
    )
  }

  const canUse = maxLoyaltyPointsApplicable > 0 && cartPromoTotal > 0

  return (
    <div className={`${styles.box} ${compact ? styles.compact : ''}`}>
      <div className={styles.head}>
        <span className={styles.title}>Карта лояльности</span>
        <span className={styles.balance}>
          {loyaltyPointsBalance} б. · ≈ {formatMoneyFine(loyaltyPointsBalance * LOYALTY_POINT_VALUE)}
        </span>
      </div>
      <p className={styles.rule}>
        1 балл = {formatMoneyFine(LOYALTY_POINT_VALUE)} к оплате · 1 балл начисляется за каждые {LOYALTY_SPEND_PER_POINT}{' '}
        ₴ чека (например, 1000 ₴ → 100 б. ≈ {formatMoneyFine(100 * LOYALTY_POINT_VALUE)}).
      </p>
      {canUse ? (
        <>
          <div className={styles.row}>
            <label htmlFor="loyalty-points-spend">Списать баллов</label>
            <div className={styles.controls}>
              <input
                id="loyalty-points-spend"
                type="range"
                min={0}
                max={maxLoyaltyPointsApplicable}
                value={loyaltyPointsToSpend}
                onChange={(e) => setLoyaltyPointsToSpend(Number(e.target.value))}
              />
              <input
                className={styles.num}
                type="number"
                inputMode="numeric"
                min={0}
                max={maxLoyaltyPointsApplicable}
                value={loyaltyPointsToSpend}
                onChange={(e) => setLoyaltyPointsToSpend(Number(e.target.value))}
              />
            </div>
          </div>
          <button type="button" className={styles.maxBtn} onClick={() => setLoyaltyPointsToSpend(maxLoyaltyPointsApplicable)}>
            Максимум ({maxLoyaltyPointsApplicable} б.)
          </button>
        </>
      ) : cartPromoTotal > 0 ? (
        <p className={styles.muted}>
          {loyaltyPointsBalance <= 0 ? 'Баллы появятся после оплаченных заказов.' : 'Нельзя списать баллы на эту сумму.'}
        </p>
      ) : null}
      {cartLoyaltyDiscount > 0 ? (
        <div className={styles.discountLine}>
          Скидка баллами: −{formatMoneyFine(cartLoyaltyDiscount)}
        </div>
      ) : null}
    </div>
  )
}
