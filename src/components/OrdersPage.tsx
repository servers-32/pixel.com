import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styles from './OrdersPage.module.css'
import { useShop } from '../context/useShop'
import type { Order } from '../types'
import { formatMoney } from '../utils/formatMoney'
import { getAppLocale } from '../utils/locale'
import { useI18n } from '../i18n'

function formatWhen(iso: string) {
  return new Intl.DateTimeFormat(getAppLocale(), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

function OrderCard({ order }: { order: Order }) {
  const { locale } = useI18n()
  const [open, setOpen] = useState(false)
  const { reorderFromOrder, cartBusy } = useShop()
  const navigate = useNavigate()
  const [reorderBusy, setReorderBusy] = useState(false)

  async function handleReorder() {
    setReorderBusy(true)
    await reorderFromOrder(order.id)
    setReorderBusy(false)
    navigate('/cart')
  }

  return (
    <article className={styles.order}>
      <button type="button" className={styles.orderHead} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <div>
          <span className={styles.orderId}>№ {order.id.slice(0, 8)}</span>
          <span className={styles.orderDate}>{formatWhen(order.createdAt)}</span>
        </div>
        <div className={styles.orderRight}>
          <span className={styles.orderTotal}>{formatMoney(order.total)}</span>
          <span className={styles.chev} aria-hidden>
            {open ? '▴' : '▾'}
          </span>
        </div>
      </button>
      {open ? (
        <div className={styles.orderBody}>
          <p className={styles.customer}>
            {order.customer.name} · {order.customer.email}
          </p>
          <p className={styles.shipAddr}>
            {[order.customer.city, order.customer.address].filter(Boolean).join(', ')}
            {order.customer.zip ? ` · ${order.customer.zip}` : ''}
          </p>
          {order.loyaltyDiscount != null && order.loyaltyDiscount > 0 ? (
            <p className={styles.payLine}>
              {locale === 'en' ? 'Bonus discount:' : locale === 'uk' ? 'Знижка балами:' : 'Скидка баллами:'} −{formatMoney(order.loyaltyDiscount)}
            </p>
          ) : null}
          {order.loyaltyPointsEarned != null && order.loyaltyPointsEarned > 0 ? (
            <p className={styles.payLine}>
              {locale === 'en' ? 'Points earned:' : locale === 'uk' ? 'Нараховано балів:' : 'Начислено баллов:'} {order.loyaltyPointsEarned}
            </p>
          ) : null}
          {order.paymentMethod ? (
            <p className={styles.payLine}>
              {locale === 'en' ? 'Payment:' : locale === 'uk' ? 'Оплата:' : 'Оплата:'}{' '}
              {order.paymentMethod === 'installment'
                ? [
                    locale === 'en' ? 'Installments' : locale === 'uk' ? 'Розстрочка' : 'Рассрочка',
                    order.installmentMonths != null ? `${order.installmentMonths} ${locale === 'en' ? 'mo.' : locale === 'uk' ? 'міс.' : 'мес.'}` : null,
                    order.installmentAnnualRatePercent != null
                      ? `${order.installmentAnnualRatePercent}% ${locale === 'en' ? 'annual' : locale === 'uk' ? 'річних' : 'годовых'}`
                      : null,
                    order.installmentMonthlyPayment != null && order.installmentTotalPayable != null
                      ? locale === 'en'
                        ? `~${formatMoney(order.installmentMonthlyPayment)}/mo., total ~${formatMoney(order.installmentTotalPayable)}`
                        : locale === 'uk'
                          ? `~${formatMoney(order.installmentMonthlyPayment)}/міс., до повернення ~${formatMoney(order.installmentTotalPayable)}`
                          : `~${formatMoney(order.installmentMonthlyPayment)}/мес., к возврату ~${formatMoney(order.installmentTotalPayable)}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')
                : `${locale === 'en' ? 'Card' : locale === 'uk' ? 'Картка' : 'Карта'}${order.cardLast4 ? ` •••• ${order.cardLast4}` : ''}`}
            </p>
          ) : null}
          <ul className={styles.lines}>
            {order.lines.map((l) => (
              <li key={`${order.id}-${l.productId}`}>
                {l.name} × {l.quantity} — {formatMoney(l.price * l.quantity)}
              </li>
            ))}
          </ul>
          <button
            type="button"
            className={styles.reorderBtn}
            disabled={cartBusy || reorderBusy || order.lines.length === 0}
            onClick={() => void handleReorder()}
          >
            {locale === 'en' ? 'Repeat order' : locale === 'uk' ? 'Повторити замовлення' : 'Повторить заказ'}
          </button>
        </div>
      ) : null}
    </article>
  )
}

export function OrdersPage() {
  const { locale } = useI18n()
  const { myOrders, currentUser } = useShop()

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>{locale === 'en' ? 'My orders' : locale === 'uk' ? 'Мої замовлення' : 'Мои заказы'}</h1>
      {!currentUser ? (
        <div className={styles.empty}>
          <p>
            {locale === 'en'
              ? 'Sign in to see the orders placed under your account.'
              : locale === 'uk'
                ? 'Увійдіть, щоб бачити замовлення, оформлені під вашим акаунтом.'
                : 'Войдите, чтобы видеть заказы, оформленные под вашим аккаунтом.'}
          </p>
          <Link to="/login" className={styles.cta}>
            {locale === 'en' ? 'Sign in' : locale === 'uk' ? 'Увійти' : 'Войти'}
          </Link>
        </div>
      ) : myOrders.length === 0 ? (
        <div className={styles.empty}>
          <p>
            {locale === 'en'
              ? 'No orders yet — this is a good time to pick something from the catalog.'
              : locale === 'uk'
                ? 'Замовлень поки немає — саме час щось вибрати в каталозі.'
                : 'Заказов пока нет — самое время что-нибудь выбрать в каталоге.'}
          </p>
          <Link to="/catalog" className={styles.cta}>
            {locale === 'en' ? 'To catalog' : locale === 'uk' ? 'До каталогу' : 'В каталог'}
          </Link>
        </div>
      ) : (
        <div className={styles.list}>
          {myOrders.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      )}
    </div>
  )
}
