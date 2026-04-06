import { useEffect, useRef, useState } from 'react'

import { Link, useNavigate } from 'react-router-dom'

import { IconUser, IconUserPlus } from './HeaderIcons'

import styles from './UserMenu.module.css'

import { useShop } from '../context/useShop'
import { useI18n } from '../i18n'



type UserMenuProps = {

  variant?: 'default' | 'header'

}



export function UserMenu({ variant = 'default' }: UserMenuProps) {
  const { locale, t } = useI18n()

  const navigate = useNavigate()

  const { currentUser, logout, loyaltyPointsBalance, openCartDrawer } = useShop()

  const [open, setOpen] = useState(false)

  const rootRef = useRef<HTMLDivElement>(null)



  useEffect(() => {

    function onDoc(e: MouseEvent) {

      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)

    }

    document.addEventListener('mousedown', onDoc)

    return () => document.removeEventListener('mousedown', onDoc)

  }, [])



  useEffect(() => {

    if (!open) return

    function onKey(e: KeyboardEvent) {

      if (e.key === 'Escape') setOpen(false)

    }

    window.addEventListener('keydown', onKey)

    return () => window.removeEventListener('keydown', onKey)

  }, [open])



  if (!currentUser) {

    if (variant === 'header') {

      return (

        <div className={styles.headerAccount} ref={rootRef}>

          <Link

            to="/account"

            className={styles.headerAccountLink}

            viewTransition

            aria-label={
              locale === 'en'
                ? 'Account — sign in or register'
                : locale === 'uk'
                  ? 'Особистий кабінет — увійти або зареєструватися'
                  : 'Личный кабинет — войти или зарегистрироваться'
            }

          >

            <span className={styles.headerNavIcon} aria-hidden>

              <IconUser />

            </span>

            <span className={styles.headerNavLabel}>{locale === 'en' ? 'Sign in' : locale === 'uk' ? 'Увійти' : 'Войти'}</span>

          </Link>

          <button

            type="button"

            className={styles.headerMenuChevron}

            aria-expanded={open}

            aria-haspopup="menu"

            aria-label={locale === 'en' ? 'Quick sign-in menu' : locale === 'uk' ? 'Швидкий вхід: меню' : 'Быстрый вход: меню'}

            onClick={(e) => {

              e.preventDefault()

              setOpen((v) => !v)

            }}

          >

            ▾

          </button>

          {open ? (

            <div className={styles.menu} role="menu">

              <Link to="/login" role="menuitem" className={styles.item} viewTransition onClick={() => setOpen(false)}>

                {locale === 'en' ? 'Sign in' : locale === 'uk' ? 'Увійти' : 'Войти'}

              </Link>

              <Link

                to="/register"

                role="menuitem"

                className={styles.item}

                viewTransition

                onClick={() => setOpen(false)}

              >

                {locale === 'en' ? 'Register' : locale === 'uk' ? 'Реєстрація' : 'Регистрация'}

              </Link>

            </div>

          ) : null}

        </div>

      )

    }

    return (

      <div className={styles.guest}>

        <button type="button" className={styles.loginBtn} onClick={() => navigate('/login')}>

          <span className={styles.btnIcon} aria-hidden>

            <IconUser />

          </span>

          {locale === 'en' ? 'Sign in' : locale === 'uk' ? 'Увійти' : 'Войти'}

        </button>

        <button type="button" className={styles.regBtn} onClick={() => navigate('/register')}>

          <span className={styles.btnIcon} aria-hidden>

            <IconUserPlus />

          </span>

          {locale === 'en' ? 'Register' : locale === 'uk' ? 'Реєстрація' : 'Регистрация'}

        </button>

      </div>

    )

  }



  if (variant === 'header') {

    return (

      <div className={styles.headerAccount} ref={rootRef}>

        <Link

          to="/account"

          className={styles.headerAccountLink}

          viewTransition

          aria-label={`${locale === 'en' ? 'Account' : locale === 'uk' ? 'Особистий кабінет' : 'Личный кабинет'}: ${currentUser.name.split(' ')[0]}`}

        >

          <span className={styles.avatarWrap}>

            <span className={styles.avatar} aria-hidden>

              {currentUser.name.slice(0, 1).toUpperCase()}

            </span>

            {loyaltyPointsBalance > 0 ? (

              <span className={styles.loyaltyDot} title={`${locale === 'en' ? 'Points' : locale === 'uk' ? 'Бали' : 'Баллы'}: ${loyaltyPointsBalance}`}>

                {loyaltyPointsBalance > 99 ? '99+' : loyaltyPointsBalance}

              </span>

            ) : null}

          </span>

          <span className={styles.headerNavLabel}>{currentUser.name.split(' ')[0]}</span>

        </Link>

        <button

          type="button"

          className={styles.headerMenuChevron}

          aria-expanded={open}

          aria-haspopup="menu"

          aria-label={locale === 'en' ? 'Account menu' : locale === 'uk' ? 'Меню акаунта' : 'Меню аккаунта'}

          onClick={(e) => {

            e.preventDefault()

            setOpen((v) => !v)

          }}

        >

          ▾

        </button>

        {open ? (

          <div className={styles.menu} role="menu">

            <button type="button" role="menuitem" className={styles.item} onClick={() => { setOpen(false); navigate('/account') }}>

              {locale === 'en' ? 'Profile' : locale === 'uk' ? 'Профіль' : 'Профиль'}

            </button>

            <button type="button" role="menuitem" className={styles.item} onClick={() => { setOpen(false); navigate('/wishlist') }}>

              {t('common.wishlist')}

            </button>

            <button type="button" role="menuitem" className={styles.item} onClick={() => { setOpen(false); navigate('/orders') }}>

              {locale === 'en' ? 'My orders' : locale === 'uk' ? 'Мої замовлення' : 'Мои заказы'}

            </button>

            <button

              type="button"

              role="menuitem"

              className={styles.item}

              onClick={() => {

                setOpen(false)

                openCartDrawer()

              }}

            >

              {t('common.cart')}

            </button>

            <button

              type="button"

              role="menuitem"

              className={styles.itemMuted}

              onClick={() => {

                setOpen(false)

                logout()

                navigate('/')

              }}

            >

              {locale === 'en' ? 'Sign out' : locale === 'uk' ? 'Вийти' : 'Выйти'}

            </button>

          </div>

        ) : null}

      </div>

    )

  }



  return (

    <div className={styles.wrap} ref={rootRef}>

      <button

        type="button"

        className={styles.trigger}

        aria-expanded={open}

        aria-haspopup="menu"

        onClick={() => setOpen((v) => !v)}

      >

        <span className={styles.userGlyph} aria-hidden>

          <IconUser />

        </span>

        <span className={styles.avatarWrap}>

          <span className={styles.avatar} aria-hidden>

            {currentUser.name.slice(0, 1).toUpperCase()}

          </span>

          {loyaltyPointsBalance > 0 ? (

            <span className={styles.loyaltyDot} title={`Баллы: ${loyaltyPointsBalance}`}>

              {loyaltyPointsBalance > 99 ? '99+' : loyaltyPointsBalance}

            </span>

          ) : null}

        </span>

        <span className={styles.name}>{currentUser.name.split(' ')[0]}</span>

        <span className={styles.chev} aria-hidden>

          ▾

        </span>

      </button>

      {open ? (

        <div className={styles.menu} role="menu">

          <button type="button" role="menuitem" className={styles.item} onClick={() => { setOpen(false); navigate('/account') }}>

            Профиль

          </button>

          <button type="button" role="menuitem" className={styles.item} onClick={() => { setOpen(false); navigate('/wishlist') }}>

            Избранное

          </button>

          <button type="button" role="menuitem" className={styles.item} onClick={() => { setOpen(false); navigate('/orders') }}>

            Мои заказы

          </button>

          <button

            type="button"

            role="menuitem"

            className={styles.item}

            onClick={() => {

              setOpen(false)

              openCartDrawer()

            }}

          >

            Корзина

          </button>

          <button

            type="button"

            role="menuitem"

            className={styles.itemMuted}

            onClick={() => {

              setOpen(false)

              logout()

              navigate('/')

            }}

          >

            Выйти

          </button>

        </div>

      ) : null}

    </div>

  )

}

