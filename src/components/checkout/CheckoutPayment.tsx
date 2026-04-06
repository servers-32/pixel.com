import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './CheckoutFlow.module.css'
import { useShop } from '../../context/useShop'
import type { OrderPaymentMethod } from '../../types'
import {
  clearShippingDraft,
  consumePreferInstallmentCheckout,
  loadShippingDraft,
} from '../../utils/checkoutStorage'
import { computeInstallmentSchedule, INSTALLMENT_ANNUAL_RATE_PERCENT } from '../../utils/installment'
import { formatMoney } from '../../utils/formatMoney'
import { useI18n } from '../../i18n'

const INSTALLMENT_MONTHS = [12, 24, 36] as const

function onlyDigits(s: string) {
  return s.replace(/\D/g, '')
}

function formatCardInput(raw: string) {
  const d = onlyDigits(raw).slice(0, 16)
  return d.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

function draftToCustomer() {
  const d = loadShippingDraft()
  if (!d) return null
  return {
    name: d.name,
    email: d.email,
    phone: d.phone,
    address: d.address,
    city: d.city || undefined,
    zip: d.zip || undefined,
    deliveryNote: d.deliveryNote || undefined,
  }
}

export function CheckoutPayment() {
  const { locale } = useI18n()
  const navigate = useNavigate()
  const { cartTotal, cartPromo, cartLoyaltyDiscount, placeOrder, checkoutBusy } = useShop()
  const [payMode, setPayMode] = useState<OrderPaymentMethod>(() =>
    consumePreferInstallmentCheckout() ? 'installment' : 'card',
  )
  const [months, setMonths] = useState<(typeof INSTALLMENT_MONTHS)[number]>(12)

  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (!loadShippingDraft()) {
      navigate('/checkout', { replace: true })
    }
  }, [navigate])

  const installment = useMemo(
    () => computeInstallmentSchedule(cartTotal, months),
    [cartTotal, months],
  )

  function validateCard(): boolean {
    const num = onlyDigits(cardNumber)
    if (num.length < 16) {
      setFormError(locale === 'en' ? 'Enter a 16-digit card number' : locale === 'uk' ? 'Введіть номер картки (16 цифр)' : 'Введите номер карты (16 цифр)')
      return false
    }
    const exp = expiry.trim()
    const m = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(exp)
    if (!m) {
      setFormError(locale === 'en' ? 'Expiry date must be in MM/YY format' : locale === 'uk' ? 'Термін дії у форматі ММ/РР' : 'Срок действия в формате ММ/ГГ')
      return false
    }
    const mm = Number(m[1])
    const yy = Number(m[2])
    const now = new Date()
    const curY = now.getFullYear() % 100
    const curM = now.getMonth() + 1
    if (yy < curY || (yy === curY && mm < curM)) {
      setFormError(locale === 'en' ? 'Card has expired' : locale === 'uk' ? 'Термін дії картки минув' : 'Срок действия карты истёк')
      return false
    }
    if (onlyDigits(cvc).length < 3) {
      setFormError(locale === 'en' ? 'Enter CVC/CVV' : locale === 'uk' ? 'Вкажіть CVC/CVV' : 'Укажите CVC/CVV')
      return false
    }
    if (cardName.trim().length < 3) {
      setFormError(locale === 'en' ? 'Enter the cardholder name as printed' : locale === 'uk' ? "Ім'я на картці, як надруковано" : 'Имя на карте, как напечатано')
      return false
    }
    setFormError('')
    return true
  }

  async function handlePay(ev: React.FormEvent) {
    ev.preventDefault()
    const customer = draftToCustomer()
    if (!customer) {
      navigate('/checkout', { replace: true })
      return
    }

    if (payMode === 'card') {
      if (!validateCard()) return
      const last4 = onlyDigits(cardNumber).slice(-4)
      const order = await placeOrder(customer, { paymentMethod: 'card', cardLast4: last4 })
      if (!order) {
        setFormError(locale === 'en' ? 'Cart is empty or an error occurred. Refresh the page.' : locale === 'uk' ? 'Кошик порожній або сталася помилка. Оновіть сторінку.' : 'Корзина пуста или произошла ошибка. Обновите страницу.')
        return
      }
      clearShippingDraft()
      navigate(`/checkout/success/${order.id}`, { replace: true })
      return
    }

    setFormError('')
    const order = await placeOrder(customer, { paymentMethod: 'installment', installmentMonths: months })
    if (!order) {
      setFormError(locale === 'en' ? 'Cart is empty or an error occurred.' : locale === 'uk' ? 'Кошик порожній або сталася помилка.' : 'Корзина пуста или произошла ошибка.')
      return
    }
    clearShippingDraft()
    navigate(`/checkout/success/${order.id}`, { replace: true })
  }

  function onExpiryInput(v: string) {
    const d = onlyDigits(v).slice(0, 4)
    if (d.length <= 2) setExpiry(d)
    else setExpiry(`${d.slice(0, 2)}/${d.slice(2)}`)
  }

  return (
    <>
      <h1 className={styles.title}>{locale === 'en' ? 'Payment' : locale === 'uk' ? 'Оплата' : 'Оплата'}</h1>
      <p className={styles.sub}>
        {locale === 'en' ? 'Payment is processed over a secure connection. Total:' : locale === 'uk' ? 'Оплата проходить через захищене зʼєднання. До оплати:' : 'Оплата проходит через защищённое соединение. К оплате:'}{' '}
        <strong className={styles.mono}>{formatMoney(cartTotal)}</strong>
        {cartPromo.discount > 0 || cartLoyaltyDiscount > 0 ? (
          <>
            {' '}
            (
            {cartPromo.discount > 0 ? <>{locale === 'en' ? 'discount' : locale === 'uk' ? 'знижка' : 'скидка'} {formatMoney(cartPromo.discount)}</> : null}
            {cartPromo.discount > 0 && cartLoyaltyDiscount > 0 ? ', ' : null}
            {cartLoyaltyDiscount > 0 ? <>{locale === 'en' ? 'points' : locale === 'uk' ? 'бали' : 'баллы'} −{formatMoney(cartLoyaltyDiscount)}</> : null} {locale === 'en' ? 'applied' : locale === 'uk' ? 'враховано' : 'учтены'})
          </>
        ) : null}
        .
      </p>

      <form className={styles.form} onSubmit={(e) => void handlePay(e)}>
        <div className={styles.payMethods} role="tablist" aria-label={locale === 'en' ? 'Payment method' : locale === 'uk' ? 'Спосіб оплати' : 'Способ оплаты'}>
          <button
            type="button"
            role="tab"
            aria-selected={payMode === 'card'}
            className={`${styles.payTab} ${payMode === 'card' ? styles.payTabOn : ''}`}
            onClick={() => {
              setPayMode('card')
              setFormError('')
            }}
          >
            {locale === 'en' ? 'Bank card' : locale === 'uk' ? 'Банківська картка' : 'Банковская карта'}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={payMode === 'installment'}
            className={`${styles.payTab} ${payMode === 'installment' ? styles.payTabOn : ''}`}
            onClick={() => {
              setPayMode('installment')
              setFormError('')
            }}
          >
            {locale === 'en' ? 'Installments' : locale === 'uk' ? 'Розстрочка' : 'Рассрочка'} {INSTALLMENT_ANNUAL_RATE_PERCENT}% {locale === 'en' ? 'annual' : locale === 'uk' ? 'річних' : 'годовых'}
          </button>
        </div>

        {payMode === 'card' ? (
          <>
            <p className={styles.cardHint}>
              {locale === 'en'
                ? 'Enter your card details. After clicking “Pay”, the request will be sent to a payment gateway with 3-D Secure support.'
                : locale === 'uk'
                  ? 'Вкажіть дані картки. Після натискання «Оплатити» запит піде в платіжний шлюз із підтримкою 3-D Secure.'
                  : 'Укажите данные карты. После нажатия «Оплатить» запрос уйдёт в платёжный шлюз с поддержкой 3-D Secure.'}
            </p>
            <div className={styles.field}>
              <label htmlFor="ch-card-name">{locale === 'en' ? 'Name on card' : locale === 'uk' ? "Ім'я на картці" : 'Имя на карте'}</label>
              <input
                id="ch-card-name"
                value={cardName}
                onChange={(e) => setCardName(e.target.value.toUpperCase())}
                autoComplete="cc-name"
                placeholder="IVAN IVANOV"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="ch-card-num">{locale === 'en' ? 'Card number' : locale === 'uk' ? 'Номер картки' : 'Номер карты'}</label>
              <input
                id="ch-card-num"
                inputMode="numeric"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardInput(e.target.value))}
                autoComplete="cc-number"
                placeholder="0000 0000 0000 0000"
              />
            </div>
            <div className={styles.grid2}>
              <div className={styles.field}>
                <label htmlFor="ch-exp">{locale === 'en' ? 'Expiry (MM/YY)' : locale === 'uk' ? 'Термін (ММ/РР)' : 'Срок (ММ/ГГ)'}</label>
                <input
                  id="ch-exp"
                  inputMode="numeric"
                  value={expiry}
                  onChange={(e) => onExpiryInput(e.target.value)}
                  autoComplete="cc-exp"
                  placeholder="12/28"
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="ch-cvc">CVC</label>
                <input
                  id="ch-cvc"
                  inputMode="numeric"
                  value={cvc}
                  onChange={(e) => setCvc(onlyDigits(e.target.value).slice(0, 4))}
                  autoComplete="cc-csc"
                  placeholder="•••"
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <p className={styles.cardHint}>
              {locale === 'en'
                ? 'Choose the installment term. The application is reviewed by a partner bank; after approval the payment schedule will appear in your account and in the agreement.'
                : locale === 'uk'
                  ? 'Виберіть строк розстрочки. Заявку розглядає банк-партнер; після схвалення графік платежів відобразиться в особистому кабінеті та в договорі.'
                  : 'Выберите срок рассрочки. Заявку рассматривает банк-партнёр; после одобрения график платежей отобразится в личном кабинете и в договоре.'}
            </p>
            <div className={styles.installmentSummary}>
              <div className={styles.installmentLabel}>{locale === 'en' ? 'Installment term:' : locale === 'uk' ? 'Строк розстрочки:' : 'Срок рассрочки:'}</div>
              <div className={styles.installmentTerms}>
                {INSTALLMENT_MONTHS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`${styles.termBtn} ${months === m ? styles.termBtnOn : ''}`}
                    onClick={() => setMonths(m)}
                  >
                    {m} {locale === 'en' ? 'mo.' : locale === 'uk' ? 'міс.' : 'мес.'}
                  </button>
                ))}
              </div>
              {locale === 'en' ? 'Payment:' : locale === 'uk' ? 'Платіж:' : 'Платёж:'}{' '}
              <strong className={styles.mono}>{formatMoney(installment.monthlyPayment)}</strong> / {locale === 'en' ? 'mo.' : locale === 'uk' ? 'міс.' : 'мес.'} ·{' '}
              {locale === 'en' ? 'Goods total:' : locale === 'uk' ? 'До оплати за товари:' : 'К оплате за товары:'}{' '}
              <strong className={styles.mono}>{formatMoney(cartTotal)}</strong> · {locale === 'en' ? 'Bank total for' : locale === 'uk' ? 'До повернення банку за' : 'К возврату банку за'} {months}{' '}
              {locale === 'en' ? 'mo.:' : locale === 'uk' ? 'міс.:' : 'мес.:'} <strong className={styles.mono}>{formatMoney(installment.totalPayable)}</strong> ({locale === 'en' ? 'overpayment' : locale === 'uk' ? 'переплата' : 'переплата'}{' '}
              {installment.overpaymentPercent.toFixed(1)}% {locale === 'en' ? 'at' : locale === 'uk' ? 'при ставці' : 'при ставке'} {INSTALLMENT_ANNUAL_RATE_PERCENT}% {locale === 'en' ? 'annual' : locale === 'uk' ? 'річних' : 'годовых'}).
            </div>
          </>
        )}

        {formError ? <div className={styles.error}>{formError}</div> : null}

        <div className={styles.actions}>
          <button type="button" className={styles.back} onClick={() => navigate('/checkout')} disabled={checkoutBusy}>
            {locale === 'en' ? 'Back: delivery' : locale === 'uk' ? 'Назад: доставка' : 'Назад: доставка'}
          </button>
          <button type="submit" className={styles.submit} disabled={checkoutBusy}>
            {checkoutBusy
              ? locale === 'en'
                ? 'Processing…'
                : locale === 'uk'
                  ? 'Обробка…'
                  : 'Обработка…'
              : payMode === 'card'
                ? locale === 'en'
                  ? 'Pay now'
                  : locale === 'uk'
                    ? 'Оплатити'
                    : 'Оплатить'
                : locale === 'en'
                  ? 'Confirm installment order'
                  : locale === 'uk'
                    ? 'Підтвердити замовлення в розстрочку'
                    : 'Подтвердить заказ в рассрочку'}
          </button>
        </div>
      </form>
    </>
  )
}
