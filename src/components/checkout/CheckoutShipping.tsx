import type { FormEvent } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './CheckoutFlow.module.css'
import { useShop } from '../../context/useShop'
import type { ShippingDraft } from '../../utils/checkoutStorage'
import { loadShippingDraft, saveShippingDraft } from '../../utils/checkoutStorage'
import { formatMoney } from '../../utils/formatMoney'
import { useI18n } from '../../i18n'

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type FieldErr = Partial<Record<keyof ShippingDraft | 'form', string>>

export function CheckoutShipping() {
  const { locale } = useI18n()
  const navigate = useNavigate()
  const { cartSubtotal, cartTotal, cartPromo, cartLoyaltyDiscount, currentUser } = useShop()
  const [name, setName] = useState(() => {
    const s = loadShippingDraft()
    if (s) return s.name
    return currentUser?.name ?? ''
  })
  const [email, setEmail] = useState(() => {
    const s = loadShippingDraft()
    if (s) return s.email
    return currentUser?.email ?? ''
  })
  const [phone, setPhone] = useState(() => {
    const s = loadShippingDraft()
    if (s) return s.phone
    return currentUser?.phone ?? ''
  })
  const [city, setCity] = useState(() => loadShippingDraft()?.city ?? '')
  const [address, setAddress] = useState(() => loadShippingDraft()?.address ?? '')
  const [zip, setZip] = useState(() => loadShippingDraft()?.zip ?? '')
  const [deliveryNote, setDeliveryNote] = useState(() => loadShippingDraft()?.deliveryNote ?? '')
  const [errors, setErrors] = useState<FieldErr>({})

  function validate(): boolean {
    const e: FieldErr = {}
    if (name.trim().length < 2) e.name = locale === 'en' ? 'Enter first and last name' : locale === 'uk' ? "Вкажіть ім'я та прізвище" : 'Укажите имя и фамилию'
    if (!emailRe.test(email.trim())) e.email = locale === 'en' ? 'Invalid email' : locale === 'uk' ? 'Некоректний email' : 'Некорректный email'
    if (phone.trim().length < 6) e.phone = locale === 'en' ? 'Enter phone number' : locale === 'uk' ? 'Вкажіть телефон' : 'Укажите телефон'
    if (city.trim().length < 2) e.city = locale === 'en' ? 'Enter city' : locale === 'uk' ? 'Вкажіть місто' : 'Укажите город'
    if (address.trim().length < 6) e.address = locale === 'en' ? 'Street, house, apartment / office' : locale === 'uk' ? 'Вулиця, будинок, квартира / офіс' : 'Улица, дом, квартира / офис'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleContinue(ev: FormEvent) {
    ev.preventDefault()
    if (!validate()) return
    const draft: ShippingDraft = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      city: city.trim(),
      address: address.trim(),
      zip: zip.trim(),
      deliveryNote: deliveryNote.trim(),
    }
    saveShippingDraft(draft)
    navigate('/checkout/payment')
  }

  return (
    <>
      <h1 className={styles.title}>{locale === 'en' ? 'Delivery' : locale === 'uk' ? 'Доставка' : 'Доставка'}</h1>
      <p className={styles.sub}>
        {locale === 'en' ? 'Enter your contact details and address. Items total:' : locale === 'uk' ? 'Вкажіть контакти й адресу. Товарів на:' : 'Укажите контакты и адрес. Товаров на:'}{' '}
        <strong className={styles.mono}>{formatMoney(cartSubtotal)}</strong>
        {cartPromo.discount > 0 || cartLoyaltyDiscount > 0 ? (
          <>
            {' '}
            (
            {cartPromo.discount > 0 ? <>{locale === 'en' ? 'discount' : locale === 'uk' ? 'знижка' : 'скидка'} {formatMoney(cartPromo.discount)}</> : null}
            {cartPromo.discount > 0 && cartLoyaltyDiscount > 0 ? ', ' : null}
            {cartLoyaltyDiscount > 0 ? <>{locale === 'en' ? 'points' : locale === 'uk' ? 'бали' : 'баллы'} −{formatMoney(cartLoyaltyDiscount)}</> : null}{' '}
            {locale === 'en' ? 'applied → total' : locale === 'uk' ? 'враховано → до оплати' : 'учтены → к оплате'}{' '}
            <strong className={styles.mono}>{formatMoney(cartTotal)}</strong>)
          </>
        ) : null}
        .
      </p>

      <form className={styles.form} onSubmit={handleContinue}>
        <div className={styles.grid2}>
          <div className={styles.field}>
            <label htmlFor="co-name">{locale === 'en' ? 'First and last name' : locale === 'uk' ? "Ім'я та прізвище" : 'Имя и фамилия'}</label>
            <input id="co-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            {errors.name ? <div className={styles.error}>{errors.name}</div> : null}
          </div>
          <div className={styles.field}>
            <label htmlFor="co-email">Email</label>
            <input
              id="co-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            {errors.email ? <div className={styles.error}>{errors.email}</div> : null}
          </div>
        </div>

        <div className={styles.grid2}>
          <div className={styles.field}>
            <label htmlFor="co-phone">{locale === 'en' ? 'Phone' : locale === 'uk' ? 'Телефон' : 'Телефон'}</label>
            <input id="co-phone" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
            {errors.phone ? <div className={styles.error}>{errors.phone}</div> : null}
          </div>
          <div className={styles.field}>
            <label htmlFor="co-city">{locale === 'en' ? 'City' : locale === 'uk' ? 'Місто' : 'Город'}</label>
            <input id="co-city" value={city} onChange={(e) => setCity(e.target.value)} autoComplete="address-level2" />
            {errors.city ? <div className={styles.error}>{errors.city}</div> : null}
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="co-address">{locale === 'en' ? 'Address' : locale === 'uk' ? 'Адреса' : 'Адрес'}</label>
          <input
            id="co-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            autoComplete="street-address"
          />
          {errors.address ? <div className={styles.error}>{errors.address}</div> : null}
        </div>

        <div className={styles.grid2}>
          <div className={styles.field}>
            <label htmlFor="co-zip">{locale === 'en' ? 'ZIP code (optional)' : locale === 'uk' ? 'Індекс (необовʼязково)' : 'Индекс (необязательно)'}</label>
            <input id="co-zip" value={zip} onChange={(e) => setZip(e.target.value)} autoComplete="postal-code" />
          </div>
          <div className={styles.field}>
            <label htmlFor="co-note">{locale === 'en' ? 'Courier note' : locale === 'uk' ? "Коментар кур'єру" : 'Комментарий курьеру'}</label>
            <textarea
              id="co-note"
              value={deliveryNote}
              onChange={(e) => setDeliveryNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {errors.form ? <div className={styles.error}>{errors.form}</div> : null}

        <div className={styles.actions}>
          <button type="button" className={styles.back} onClick={() => navigate('/cart')}>
            {locale === 'en' ? 'Back to cart' : locale === 'uk' ? 'Назад до кошика' : 'Назад в корзину'}
          </button>
          <button type="submit" className={styles.submit}>
            {locale === 'en' ? 'Next: payment' : locale === 'uk' ? 'Далі: оплата' : 'Далее: оплата'}
          </button>
        </div>
      </form>
    </>
  )
}
