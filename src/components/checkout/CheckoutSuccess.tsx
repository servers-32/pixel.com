import { Link, useParams } from 'react-router-dom'
import styles from './CheckoutFlow.module.css'
import { useShop } from '../../context/useShop'
import { formatMoney } from '../../utils/formatMoney'
import { useI18n } from '../../i18n'

export function CheckoutSuccess() {
  const { locale } = useI18n()
  const { orderId } = useParams<{ orderId: string }>()
  const { getOrder, currentUser } = useShop()
  const order = orderId ? getOrder(orderId) : undefined

  if (!order) {
    return (
      <div className={styles.successWrap}>
        <h1 className={styles.successTitle}>{locale === 'en' ? 'Order not found' : locale === 'uk' ? 'Замовлення не знайдено' : 'Заказ не найден'}</h1>
        <p className={styles.successText}>
          {locale === 'en'
            ? 'The link may be outdated or the order was placed in another browser. Check the “My orders” section or the catalog.'
            : locale === 'uk'
              ? 'Можливо, посилання застаріло або замовлення оформлено в іншому браузері. Перевірте розділ «Мої замовлення» або каталог.'
              : 'Возможно, ссылка устарела или заказ оформлен в другом браузере. Проверьте раздел «Мои заказы» или каталог.'}
        </p>
        <div className={styles.successActions}>
          <Link to="/catalog" className={styles.linkPrimary}>
            {locale === 'en' ? 'To catalog' : locale === 'uk' ? 'До каталогу' : 'В каталог'}
          </Link>
          {currentUser ? (
            <Link to="/orders" className={styles.linkSecondary}>
              {locale === 'en' ? 'My orders' : locale === 'uk' ? 'Мої замовлення' : 'Мои заказы'}
            </Link>
          ) : null}
        </div>
      </div>
    )
  }

  const email = order.customer.email
  const payLabel =
    order.paymentMethod === 'installment'
      ? [
          `${locale === 'en' ? 'Installments for' : locale === 'uk' ? 'Розстрочка на' : 'Рассрочка на'} ${order.installmentMonths ?? '—'} ${locale === 'en' ? 'mo.' : locale === 'uk' ? 'міс.' : 'мес.'}`,
          order.installmentAnnualRatePercent != null ? `${order.installmentAnnualRatePercent}% ${locale === 'en' ? 'annual' : locale === 'uk' ? 'річних' : 'годовых'}` : null,
          order.installmentMonthlyPayment != null ? `~${formatMoney(order.installmentMonthlyPayment)}/${locale === 'en' ? 'mo.' : locale === 'uk' ? 'міс.' : 'мес.'}` : null,
          locale === 'en' ? 'application with partner bank' : locale === 'uk' ? 'заявка в банку-партнері' : 'заявка в банке-партнёре',
        ]
          .filter(Boolean)
          .join(' · ')
      : order.paymentMethod === 'card'
        ? `${locale === 'en' ? 'Bank card' : locale === 'uk' ? 'Банківська картка' : 'Банковская карта'}${order.cardLast4 ? ` •••• ${order.cardLast4}` : ''}`
        : locale === 'en'
          ? 'Not specified'
          : locale === 'uk'
            ? 'Не вказано'
            : 'Не указан'

  return (
    <div className={styles.successWrap}>
      <div className={styles.successIcon} aria-hidden>
        ✓
      </div>
      <h1 className={styles.successTitle}>{locale === 'en' ? 'Order received' : locale === 'uk' ? 'Замовлення прийнято' : 'Заказ принят'}</h1>
      <p className={styles.successText}>
        {locale === 'en'
          ? 'Thanks for your purchase! Confirmation and order details were sent to '
          : locale === 'uk'
            ? 'Дякуємо за покупку! Підтвердження та деталі замовлення надіслані на '
            : 'Спасибо за покупку! Подтверждение и детали заказа отправлены на '}{' '}
        <strong>{email}</strong>.{' '}
        {locale === 'en'
          ? 'If you do not see the email in your inbox, check the spam folder. The order is also available in “My orders” for signed-in users.'
          : locale === 'uk'
            ? 'Якщо листа немає у «Вхідних», перевірте папку «Спам». Замовлення також доступне в розділі «Мої замовлення» для авторизованих користувачів.'
            : 'Если письма нет во «Входящих», проверьте папку «Спам». Заказ также доступен в разделе «Мои заказы» для авторизованных пользователей.'}
      </p>

      <div className={styles.successBox}>
        <h3>{locale === 'en' ? 'Order number' : locale === 'uk' ? 'Номер замовлення' : 'Номер заказа'}</h3>
        <p className={styles.mono}>{order.id}</p>
      </div>
      <div className={styles.successBox}>
        <h3>{locale === 'en' ? 'Payment' : locale === 'uk' ? 'Оплата' : 'Оплата'}</h3>
        <p>{payLabel}</p>
        <p>
          {locale === 'en' ? 'Amount:' : locale === 'uk' ? 'Сума:' : 'Сумма:'} <strong className={styles.mono}>{formatMoney(order.total)}</strong>
        </p>
        {order.loyaltyPointsEarned != null && order.loyaltyPointsEarned > 0 ? (
          <p>
            {locale === 'en' ? 'Points earned:' : locale === 'uk' ? 'Нараховано балів:' : 'Начислено баллов:'} <strong>{order.loyaltyPointsEarned}</strong>
            {order.loyaltyPointsSpent != null && order.loyaltyPointsSpent > 0
              ? ` · ${locale === 'en' ? 'spent' : locale === 'uk' ? 'списано' : 'списано'}: ${order.loyaltyPointsSpent}`
              : ''}
          </p>
        ) : order.loyaltyPointsSpent != null && order.loyaltyPointsSpent > 0 ? (
          <p>{locale === 'en' ? 'Points spent:' : locale === 'uk' ? 'Списано балів:' : 'Списано баллов:'} {order.loyaltyPointsSpent}</p>
        ) : null}
      </div>
      <div className={styles.successBox}>
        <h3>{locale === 'en' ? 'Delivery' : locale === 'uk' ? 'Доставка' : 'Доставка'}</h3>
        <p>
          {order.customer.name}, {order.customer.phone}
          <br />
          {[order.customer.city, order.customer.address].filter(Boolean).join(', ')}
          {order.customer.zip ? `, ${order.customer.zip}` : ''}
        </p>
      </div>

      <div className={styles.successActions}>
        <Link to="/catalog" className={styles.linkPrimary}>
          {locale === 'en' ? 'Continue shopping' : locale === 'uk' ? 'Продовжити покупки' : 'Продолжить покупки'}
        </Link>
        {currentUser ? (
          <Link to="/orders" className={styles.linkSecondary}>
            {locale === 'en' ? 'My orders' : locale === 'uk' ? 'Мої замовлення' : 'Мои заказы'}
          </Link>
        ) : (
          <Link to="/login" className={styles.linkSecondary}>
            {locale === 'en' ? 'Sign in to view orders' : locale === 'uk' ? 'Увійти й бачити замовлення' : 'Войти и видеть заказы'}
          </Link>
        )}
      </div>
    </div>
  )
}
