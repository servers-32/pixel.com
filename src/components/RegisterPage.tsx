import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import authStyles from './AuthLayout.module.css'
import { useShop } from '../context/useShop'
import { useI18n } from '../i18n'

export function RegisterPage() {
  const { locale } = useI18n()
  const navigate = useNavigate()
  const { register } = useShop()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    const err = await register({ name, email, password, phone })
    setBusy(false)
    if (err) {
      setError(err)
      return
    }
    navigate('/account')
  }

  return (
    <div className={authStyles.shell}>
      <div className={authStyles.card}>
        <h1 className={authStyles.title}>{locale === 'en' ? 'Register' : locale === 'uk' ? 'Реєстрація' : 'Регистрация'}</h1>
        <p className={authStyles.sub}>
          {locale === 'en'
            ? 'Create an account to see your order history and complete purchases faster.'
            : locale === 'uk'
              ? 'Створіть акаунт, щоб бачити історію замовлень і швидше оформлювати покупки.'
              : 'Создайте аккаунт, чтобы видеть историю заказов и быстрее оформлять покупки.'}
        </p>

        {error ? <p className={authStyles.error}>{error}</p> : null}

        <form onSubmit={(e) => void handleSubmit(e)}>
          <div className={authStyles.field}>
            <label htmlFor="reg-name">{locale === 'en' ? 'Name' : locale === 'uk' ? "Ім'я" : 'Имя'}</label>
            <input
              id="reg-name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
            />
          </div>
          <div className={authStyles.field}>
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={authStyles.field}>
            <label htmlFor="reg-phone">{locale === 'en' ? 'Phone' : locale === 'uk' ? 'Телефон' : 'Телефон'}</label>
            <input
              id="reg-phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+380 …"
            />
          </div>
          <div className={authStyles.field}>
            <label htmlFor="reg-pass">{locale === 'en' ? 'Password' : locale === 'uk' ? 'Пароль' : 'Пароль'}</label>
            <input
              id="reg-pass"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <button type="submit" className={authStyles.submit} disabled={busy}>
            {busy
              ? locale === 'en'
                ? 'Creating…'
                : locale === 'uk'
                  ? 'Створюємо…'
                  : 'Создаём…'
              : locale === 'en'
                ? 'Create account'
                : locale === 'uk'
                  ? 'Створити акаунт'
                  : 'Создать аккаунт'}
          </button>
        </form>

        <p className={authStyles.footer}>
          {locale === 'en' ? 'Already have an account? ' : locale === 'uk' ? 'Вже є акаунт? ' : 'Уже есть аккаунт? '}
          <Link to="/login">{locale === 'en' ? 'Sign in' : locale === 'uk' ? 'Увійти' : 'Войти'}</Link>
        </p>
      </div>
    </div>
  )
}
