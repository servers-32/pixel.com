import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import styles from './CheckoutFlow.module.css'
import { useShop } from '../../context/useShop'
import { useI18n } from '../../i18n'

function CheckoutSteps({ step }: { step: 1 | 2 | 3 }) {
  const { locale } = useI18n()
  return (
    <div className={styles.steps} aria-label={locale === 'en' ? 'Checkout steps' : locale === 'uk' ? 'Етапи оформлення' : 'Этапы оформления'}>
      <div className={`${styles.step} ${step >= 1 ? styles.stepActive : ''} ${step > 1 ? styles.stepDone : ''}`}>
        <span className={styles.stepNum}>{step > 1 ? '✓' : '1'}</span>
        <span>{locale === 'en' ? 'Delivery' : locale === 'uk' ? 'Доставка' : 'Доставка'}</span>
      </div>
      <div className={styles.stepLine} aria-hidden />
      <div className={`${styles.step} ${step >= 2 ? styles.stepActive : ''} ${step > 2 ? styles.stepDone : ''}`}>
        <span className={styles.stepNum}>{step > 2 ? '✓' : '2'}</span>
        <span>{locale === 'en' ? 'Payment' : locale === 'uk' ? 'Оплата' : 'Оплата'}</span>
      </div>
      <div className={styles.stepLine} aria-hidden />
      <div className={`${styles.step} ${step >= 3 ? styles.stepActive : ''}`}>
        <span className={styles.stepNum}>3</span>
        <span>{locale === 'en' ? 'Done' : locale === 'uk' ? 'Готово' : 'Готово'}</span>
      </div>
    </div>
  )
}

export function CheckoutLayout() {
  const { locale } = useI18n()
  const { cart } = useShop()
  const loc = useLocation()
  const navigate = useNavigate()
  const isSuccess = loc.pathname.includes('/checkout/success')

  const step: 1 | 2 | 3 = isSuccess ? 3 : loc.pathname.includes('/payment') ? 2 : 1

  if (!isSuccess && cart.length === 0) {
    return (
      <div className={styles.layout}>
        <h1 className={styles.title}>{locale === 'en' ? 'Checkout' : locale === 'uk' ? 'Оформлення' : 'Оформление'}</h1>
        <p className={styles.sub}>
          {locale === 'en'
            ? 'Your cart is empty — add products before payment.'
            : locale === 'uk'
              ? 'Кошик порожній — додайте товари перед оплатою.'
              : 'Корзина пуста — добавьте товары перед оплатой.'}
        </p>
        <button type="button" className={styles.back} onClick={() => navigate('/catalog')}>
          {locale === 'en' ? 'To catalog' : locale === 'uk' ? 'До каталогу' : 'В каталог'}
        </button>
      </div>
    )
  }

  return (
    <div className={styles.layout}>
      {!isSuccess ? <CheckoutSteps step={step} /> : null}
      <Outlet />
    </div>
  )
}
