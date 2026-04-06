import { useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LoyaltyPointsBlock } from './LoyaltyPointsBlock'
import { SafeImage } from './SafeImage'
import { CartHints } from './CartHints'
import styles from './CartDrawer.module.css'
import { useShop } from '../context/useShop'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { formatMoney } from '../utils/formatMoney'
import { productPrimaryImage } from '../utils/productImages'
import { useI18n } from '../i18n'
import { getLocalizedProductView } from '../i18n/catalog'

export function CartDrawer() {
  const { locale, t } = useI18n()
  const {
    cartDrawerOpen,
    closeCartDrawer,
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
  const navigate = useNavigate()
  const panelRef = useRef<HTMLDivElement>(null)
  useFocusTrap(cartDrawerOpen, panelRef)

  if (!cartDrawerOpen) return null

  return (
    <div className={styles.root}>
      <button
        type="button"
        className={styles.backdrop}
        aria-label={locale === 'en' ? 'Close cart' : locale === 'uk' ? 'Закрити кошик' : 'Закрыть корзину'}
        onClick={closeCartDrawer}
      />
      <div ref={panelRef} className={styles.panel} role="dialog" aria-modal aria-labelledby="cart-drawer-title">
        <div className={styles.head}>
          <h2 id="cart-drawer-title" className={styles.title}>
            {t('common.cart')}
          </h2>
          <button
            type="button"
            className={styles.close}
            onClick={closeCartDrawer}
            aria-label={locale === 'en' ? 'Close' : locale === 'uk' ? 'Закрити' : 'Закрыть'}
          >
            ×
          </button>
        </div>

        {cart.length === 0 ? (
          <div className={styles.empty}>
            <p>{locale === 'en' ? 'Cart is empty' : locale === 'uk' ? 'Кошик порожній' : 'Корзина пуста'}</p>
            <Link to="/catalog" className={styles.linkBtn} viewTransition onClick={closeCartDrawer}>
              {locale === 'en' ? 'Go to catalog' : locale === 'uk' ? 'Перейти до каталогу' : 'Перейти в каталог'}
            </Link>
          </div>
        ) : (
          <>
            <CartHints promo={cartPromo} />
            <ul className={styles.list}>
              {cart.map((line) => {
                const p = getProduct(line.productId)
                if (!p) return null
                const view = getLocalizedProductView(p, locale)
                return (
                  <li key={line.productId} className={styles.row}>
                    <Link to={`/product/${p.id}`} className={styles.thumb} viewTransition onClick={closeCartDrawer}>
                      <SafeImage src={productPrimaryImage(p)} alt="" loading="lazy" />
                    </Link>
                    <div className={styles.info}>
                      <Link to={`/product/${p.id}`} className={styles.name} viewTransition onClick={closeCartDrawer}>
                        {view.name}
                      </Link>
                      <div className={styles.price}>{formatMoney(p.price)}</div>
                      <div className={styles.qty}>
                        <button type="button" onClick={() => setLineQuantity(line.productId, line.quantity - 1)}>
                          −
                        </button>
                        <span>{line.quantity}</span>
                        <button type="button" onClick={() => setLineQuantity(line.productId, line.quantity + 1)}>
                          +
                        </button>
                      </div>
                    </div>
                    <button type="button" className={styles.remove} onClick={() => removeFromCart(line.productId)}>
                      {locale === 'en' ? 'Remove' : locale === 'uk' ? 'Видалити' : 'Удалить'}
                    </button>
                  </li>
                )
              })}
            </ul>
            <div className={styles.loyaltyWrap}>
              <LoyaltyPointsBlock compact />
            </div>
            <div className={styles.footer}>
              {cartDiscount > 0 || cartLoyaltyDiscount > 0 ? (
                <div className={styles.sumRow}>
                  <span>{locale === 'en' ? 'Items' : locale === 'uk' ? 'Товари' : 'Товары'}</span>
                  <span>{formatMoney(cartSubtotal)}</span>
                </div>
              ) : null}
              {cartDiscount > 0 ? (
                <div className={styles.sumRow}>
                  <span>{locale === 'en' ? 'Discount' : locale === 'uk' ? 'Знижка' : 'Скидка'}</span>
                  <span className={styles.disc}>−{formatMoney(cartDiscount)}</span>
                </div>
              ) : null}
              {cartLoyaltyDiscount > 0 ? (
                <div className={styles.sumRow}>
                  <span>{locale === 'en' ? 'Points' : locale === 'uk' ? 'Бали' : 'Баллы'}</span>
                  <span className={styles.disc}>−{formatMoney(cartLoyaltyDiscount)}</span>
                </div>
              ) : null}
              <div className={styles.totalRow}>
                <span>{locale === 'en' ? 'Total' : locale === 'uk' ? 'До оплати' : 'К оплате'}</span>
                <strong>{formatMoney(cartTotal)}</strong>
              </div>
              <button
                type="button"
                className={styles.checkout}
                onClick={() => {
                  closeCartDrawer()
                  navigate('/checkout', { viewTransition: true })
                }}
              >
                {locale === 'en' ? 'Checkout' : locale === 'uk' ? 'Оформити замовлення' : 'Оформить заказ'}
              </button>
              <Link to="/cart" className={styles.fullCart} viewTransition onClick={closeCartDrawer}>
                {locale === 'en' ? 'Open full cart' : locale === 'uk' ? 'Відкрити кошик повністю' : 'Открыть корзину полностью'}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
