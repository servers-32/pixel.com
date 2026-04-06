import { useState } from 'react'

import { Link, useNavigate } from 'react-router-dom'

import styles from './AccountPage.module.css'

import { useShop } from '../context/useShop'
import { getAppLocale } from '../utils/locale'
import { useI18n } from '../i18n'

import { LOYALTY_POINT_VALUE, LOYALTY_SPEND_PER_POINT } from '../utils/loyalty'

import { formatMoneyFine } from '../utils/formatMoney'
import type { ShopUser } from '../types'



export function AccountPage() {
  const { locale } = useI18n()

  const navigate = useNavigate()

  const { currentUser, logout, updateProfile } = useShop()

  if (!currentUser) {

    return (

      <div className={styles.shell}>

        <div className={styles.card}>

          <h1 className={styles.title}>{locale === 'en' ? 'Account' : locale === 'uk' ? 'Особистий кабінет' : 'Личный кабинет'}</h1>

          <p className={styles.sub}>
            {locale === 'en'
              ? 'Sign in or register to save your orders in your profile.'
              : locale === 'uk'
                ? 'Увійдіть або зареєструйтеся, щоб зберігати замовлення у профілі.'
                : 'Войдите или зарегистрируйтесь, чтобы сохранять заказы в профиле.'}
          </p>

          <div className={styles.row}>

            <Link to="/login" className={styles.primary}>

              {locale === 'en' ? 'Sign in' : locale === 'uk' ? 'Увійти' : 'Войти'}

            </Link>

            <Link to="/register" className={styles.secondary}>

              {locale === 'en' ? 'Register' : locale === 'uk' ? 'Реєстрація' : 'Регистрация'}

            </Link>

          </div>

        </div>

      </div>

    )

  }



  const created = new Date(currentUser.createdAt).toLocaleDateString(getAppLocale(), {

    day: 'numeric',

    month: 'long',

    year: 'numeric',

  })



  const pts = currentUser.loyaltyPoints ?? 0

  const ptsMoney = pts * LOYALTY_POINT_VALUE



  return (

    <div className={styles.shell}>

      <div className={styles.card}>

        <div className={styles.profile}>

          <div className={styles.avatar} aria-hidden>

            {currentUser.name.slice(0, 1).toUpperCase()}

          </div>

          <div>

            <h1 className={styles.title}>{currentUser.name}</h1>

            <p className={styles.meta}>{currentUser.email}</p>

            <p className={styles.since}>{locale === 'en' ? `Customer since ${created}` : locale === 'uk' ? `Клієнт з ${created}` : `Клиент с ${created}`}</p>

          </div>

        </div>



        <section className={styles.loyaltyCard} aria-label={locale === 'en' ? 'Loyalty card' : locale === 'uk' ? 'Карта лояльності' : 'Карта лояльности'}>

          <div className={styles.loyaltyHead}>

            <span className={styles.loyaltyTitle}>{locale === 'en' ? 'Loyalty card' : locale === 'uk' ? 'Карта лояльності' : 'Карта лояльности'}</span>

            <span className={styles.loyaltyBadge}>Electric Bonus</span>

          </div>

          <div className={styles.loyaltyBalance}>

            <span className={styles.loyaltyPts}>{pts}</span>

            <span className={styles.loyaltyPtsLabel}>{locale === 'en' ? 'points' : locale === 'uk' ? 'балів' : 'баллов'}</span>

          </div>

          <p className={styles.loyaltyEq}>
            ≈ {formatMoneyFine(ptsMoney)} {locale === 'en' ? 'for future orders' : locale === 'uk' ? 'до оплати наступних замовлень' : 'к оплате следующих заказов'}
          </p>

          <p className={styles.loyaltyRule}>

            {locale === 'en'
              ? `1 point = ${formatMoneyFine(LOYALTY_POINT_VALUE)} · earn 1 point for every ${LOYALTY_SPEND_PER_POINT} ₴ paid (works like a coupon).`
              : locale === 'uk'
                ? `1 бал = ${formatMoneyFine(LOYALTY_POINT_VALUE)} · нарахування 1 бала за кожні ${LOYALTY_SPEND_PER_POINT} ₴ оплати (як купон).`
                : `1 балл = ${formatMoneyFine(LOYALTY_POINT_VALUE)} · начисление 1 балл за каждые ${LOYALTY_SPEND_PER_POINT} ₴ оплаты (как купон).`}

          </p>

        </section>



        <section className={styles.editSection} aria-labelledby="profile-edit-heading">

          <h2 id="profile-edit-heading" className={styles.editTitle}>

            {locale === 'en' ? 'Profile details' : locale === 'uk' ? 'Дані профілю' : 'Данные профиля'}

          </h2>
          <AccountProfileForm
            key={`${currentUser.id}-${currentUser.name}-${currentUser.phone}`}
            currentUser={currentUser}
            updateProfile={updateProfile}
          />

        </section>



        <nav className={styles.nav} aria-label="Разделы кабинета">

          <Link to="/orders" className={styles.navBtn}>

            {locale === 'en' ? 'My orders' : locale === 'uk' ? 'Мої замовлення' : 'Мои заказы'}

          </Link>

          <Link to="/catalog" className={styles.navBtn}>

            {locale === 'en' ? 'Go shopping' : locale === 'uk' ? 'Перейти до покупок' : 'Перейти к покупкам'}

          </Link>

          <Link to="/analytics" className={styles.navBtn}>

            {locale === 'en' ? 'Sales analytics' : locale === 'uk' ? 'Аналітика продажів' : 'Аналитика продаж'}

          </Link>

        </nav>



        <button

          type="button"

          className={styles.logout}

          onClick={() => {

            logout()

            navigate('/')

          }}

        >

          {locale === 'en' ? 'Sign out' : locale === 'uk' ? 'Вийти' : 'Выйти'}

        </button>

      </div>

    </div>

  )

}

type AccountProfileFormProps = {
  currentUser: ShopUser
  updateProfile: (patch: {
    name: string
    phone: string
    newPassword?: string
  }) => Promise<string | null>
}

function AccountProfileForm({ currentUser, updateProfile }: AccountProfileFormProps) {
  const { locale } = useI18n()
  const [name, setName] = useState(currentUser.name)
  const [phone, setPhone] = useState(currentUser.phone ?? '')
  const [newPassword, setNewPassword] = useState('')
  const [newPassword2, setNewPassword2] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    if (newPassword || newPassword2) {
      if (newPassword !== newPassword2) {
        setFormError(locale === 'en' ? 'Passwords do not match' : locale === 'uk' ? 'Паролі не збігаються' : 'Пароли не совпадают')
        return
      }
    }

    setSaving(true)
    const err = await updateProfile({
      name,
      phone,
      ...(newPassword.trim() ? { newPassword: newPassword.trim() } : {}),
    })
    setSaving(false)

    if (err) {
      setFormError(err)
      return
    }

    setNewPassword('')
    setNewPassword2('')
  }

  return (
    <form className={styles.form} onSubmit={(ev) => void handleSaveProfile(ev)}>
      {formError ? <p className={styles.formError}>{formError}</p> : null}

      <div className={styles.field}>
        <label htmlFor="acc-name">{locale === 'en' ? 'Name' : locale === 'uk' ? "Ім'я" : 'Имя'}</label>
        <input
          id="acc-name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className={styles.field}>
        <span className={styles.staticLabel}>Email</span>
        <p className={styles.staticValue}>{currentUser.email}</p>
      </div>

      <div className={styles.field}>
        <label htmlFor="acc-phone">{locale === 'en' ? 'Phone' : locale === 'uk' ? 'Телефон' : 'Телефон'}</label>
        <input
          id="acc-phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+380 …"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="acc-pass">{locale === 'en' ? 'New password' : locale === 'uk' ? 'Новий пароль' : 'Новый пароль'}</label>
        <input
          id="acc-pass"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder={locale === 'en' ? 'Leave empty if unchanged' : locale === 'uk' ? 'Залиште порожнім, якщо не змінюєте' : 'Оставьте пустым, если не меняете'}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="acc-pass2">{locale === 'en' ? 'Repeat password' : locale === 'uk' ? 'Повтор пароля' : 'Повтор пароля'}</label>
        <input
          id="acc-pass2"
          type="password"
          autoComplete="new-password"
          value={newPassword2}
          onChange={(e) => setNewPassword2(e.target.value)}
          placeholder={locale === 'en' ? 'Only if changing password' : locale === 'uk' ? 'Лише якщо змінюєте пароль' : 'Только если меняете пароль'}
        />
      </div>

      <button type="submit" className={styles.saveBtn} disabled={saving}>
        {saving
          ? locale === 'en'
            ? 'Saving…'
            : locale === 'uk'
              ? 'Збереження…'
              : 'Сохранение…'
          : locale === 'en'
            ? 'Save changes'
            : locale === 'uk'
              ? 'Зберегти зміни'
              : 'Сохранить изменения'}
      </button>
    </form>
  )
}

