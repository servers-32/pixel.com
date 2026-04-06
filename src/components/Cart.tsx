import { Link } from 'react-router-dom'
import { LoyaltyPointsBlock } from './LoyaltyPointsBlock'
import { SafeImage } from './SafeImage'
import { TrustMicroStrip } from './TrustMicroStrip'
import styles from './Cart.module.css'
import { useShop } from '../context/useShop'
import { formatMoney } from '../utils/formatMoney'
import { productPrimaryImage } from '../utils/productImages'
import { useI18n } from '../i18n'
import { getLocalizedProductView } from '../i18n/catalog'

export function Cart() {
  const { locale, t } = useI18n()
  const {
    cart,
    getProduct,
    setLineQuantity,
    removeFromCart,
    cartSubtotal,
    cartDiscount,
    cartLoyaltyDiscount,
    cartTotal,
    cartPromo,
  } = useShop()

  if (cart.length === 0) {
    return (
      <div className={styles.wrap}>
        <h1 className={`${styles.title} heading-display`}>{t('common.cart')}</h1>
        <div className="empty-state">
          <span className="empty-state-icon" aria-hidden>
            🛒
          </span>
          <p className="empty-state-title">
            {locale === 'en' ? 'Your cart is empty' : locale === 'uk' ? 'Кошик порожній' : 'Корзина пуста'}
          </p>
          <p className="empty-state-text">
            {locale === 'en'
              ? 'Add products from the catalog — your selection will be saved in this browser.'
              : locale === 'uk'
                ? 'Додайте товари з каталогу — вибір збережеться в цьому браузері.'
                : 'Добавьте товары из каталога — выбор сохранится в этом браузере.'}
          </p>
          <div className="empty-state-actions">
            <Link to="/catalog" className="empty-state-btn">
              {locale === 'en' ? 'Go to catalog' : locale === 'uk' ? 'Перейти до каталогу' : 'Перейти в каталог'}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.wrap}>
      <h1 className={`${styles.title} heading-display`}>{t('common.cart')}</h1>
      <ul className={styles.list}>
        {cart.map((line) => {
          const p = getProduct(line.productId)
          if (!p) return null
          const view = getLocalizedProductView(p, locale)
          const lineTotal = p.price * line.quantity
          return (
            <li key={line.productId} className={styles.row}>
              <div className={styles.thumb}>
                <SafeImage src={productPrimaryImage(p)} alt="" layout="thumb" />
              </div>
              <div className={styles.info}>
                <div className={styles.infoName}>{view.name}</div>
                <div className={styles.infoPrice}>
                  {formatMoney(p.price)} × {line.quantity} = {formatMoney(lineTotal)}
                </div>
              </div>
              <div className={styles.controls}>
                <div className={styles.qty}>
                  <button
                    type="button"
                    aria-label={locale === 'en' ? 'Decrease quantity' : locale === 'uk' ? 'Зменшити кількість' : 'Уменьшить количество'}
                    onClick={() => setLineQuantity(line.productId, line.quantity - 1)}
                  >
                    −
                  </button>
                  <span>{line.quantity}</span>
                  <button
                    type="button"
                    aria-label={locale === 'en' ? 'Increase quantity' : locale === 'uk' ? 'Збільшити кількість' : 'Увеличить количество'}
                    onClick={() => setLineQuantity(line.productId, line.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <button type="button" className={styles.remove} onClick={() => removeFromCart(line.productId)}>
                  {locale === 'en' ? 'Remove' : locale === 'uk' ? 'Видалити' : 'Удалить'}
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      <LoyaltyPointsBlock />

      <div className={styles.footer}>
        <div className={styles.summary}>
          <div className={styles.sumRow}>
            <span>{locale === 'en' ? 'Items' : locale === 'uk' ? 'Товари' : 'Товары'}</span>
            <span>{formatMoney(cartSubtotal)}</span>
          </div>
          {cartPromo.discount > 0 ? (
            <div className={styles.sumRow}>
              <span>{locale === 'en' ? 'Promo discount' : locale === 'uk' ? 'Знижка за акцією' : 'Скидка по акции'}</span>
              <span className={styles.disc}>−{formatMoney(cartDiscount)}</span>
            </div>
          ) : null}
          {cartLoyaltyDiscount > 0 ? (
            <div className={styles.sumRow}>
              <span>{locale === 'en' ? 'Bonus discount' : locale === 'uk' ? 'Знижка балами' : 'Скидка баллами'}</span>
              <span className={styles.disc}>−{formatMoney(cartLoyaltyDiscount)}</span>
            </div>
          ) : null}
          <div className={styles.totalLabel}>{locale === 'en' ? 'Total' : locale === 'uk' ? 'До оплати' : 'К оплате'}</div>
          <div className={styles.totalValue}>{formatMoney(cartTotal)}</div>
        </div>
        <div className={styles.checkoutCol}>
          <Link to="/checkout" className={styles.checkout}>
            {locale === 'en' ? 'Checkout' : locale === 'uk' ? 'Оформити замовлення' : 'Оформить заказ'}
          </Link>
          <TrustMicroStrip variant="compact" />
        </div>
      </div>
    </div>
  )
}
