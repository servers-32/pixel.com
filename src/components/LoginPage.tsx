import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import authStyles from './AuthLayout.module.css'
import { useShop } from '../context/useShop'
import { useI18n } from '../i18n'

export function LoginPage() {
  const { locale } = useI18n()
  const navigate = useNavigate()
  const { login } = useShop()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    const err = await login(email, password)
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
        <h1 className={authStyles.title}>{locale === 'en' ? 'Sign in' : locale === 'uk' ? 'Вхід' : 'Вход'}</h1>
        <p className={authStyles.sub}>
          {locale === 'en'
            ? 'Sign in to see your order history and complete purchases faster.'
            : locale === 'uk'
              ? 'Увійдіть, щоб бачити історію замовлень і швидше оформлювати покупки.'
              : 'Войдите, чтобы видеть историю заказов и быстрее оформлять покупки.'}
        </p>

        {error ? <p className={authStyles.error}>{error}</p> : null}

        <form onSubmit={(e) => void handleSubmit(e)}>
          <div className={authStyles.field}>
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={authStyles.field}>
            <label htmlFor="login-pass">{locale === 'en' ? 'Password' : locale === 'uk' ? 'Пароль' : 'Пароль'}</label>
            <input
              id="login-pass"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <p className={authStyles.hint}>
            {locale === 'en'
              ? 'No account yet? Register and your orders will be linked to your profile.'
              : locale === 'uk'
                ? 'Ще немає акаунта? Зареєструйтеся — замовлення будуть привʼязані до профілю.'
                : 'Нет аккаунта? Зарегистрируйтесь — заказы будут привязаны к профилю.'}
          </p>
          <button type="submit" className={authStyles.submit} disabled={busy}>
            {busy ? (locale === 'en' ? 'Signing in…' : locale === 'uk' ? 'Входимо…' : 'Входим…') : locale === 'en' ? 'Sign in' : locale === 'uk' ? 'Увійти' : 'Войти'}
          </button>
        </form>

        <p className={authStyles.footer}>
          {locale === 'en' ? 'No account yet? ' : locale === 'uk' ? 'Ще немає акаунта? ' : 'Нет аккаунта? '}
          <Link to="/register">{locale === 'en' ? 'Register' : locale === 'uk' ? 'Реєстрація' : 'Регистрация'}</Link>
        </p>
      </div>
    </div>
  )
}
