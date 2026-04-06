import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BrandLogo } from './BrandLogo'
import styles from './Header.module.css'
import {
  IconCart,
  IconCompare,
  IconCreditCard,
  IconGrid,
  IconHeadset,
  IconHeart,
  IconHome,
  IconMonitor,
  IconMoon,
  IconReceipt,
  IconShield,
  IconSun,
  IconTruck,
  IconUser,
} from './HeaderIcons'
import { UserMenu } from './UserMenu'
import { SearchField } from './SearchField'
import { useShop } from '../context/useShop'
import { useI18n, type Locale } from '../i18n'

export function Header() {
  const {
    theme,
    themePreference,
    cycleTheme,
    cartTotalQty,
    compareIds,
    categories,
    setCategoryFilter,
    setBrandFilter,
    openCartDrawer,
  } = useShop()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const { locale: lang, setLocale: setLang } = useI18n()
  const [headerScrolled, setHeaderScrolled] = useState(false)

  const copy = {
    uk: {
      htmlLang: 'uk',
      city: 'Київ',
      deals: 'Акції',
      buyers: 'Покупцям',
      stores: 'Магазини',
      nationwide: 'По всій Україні',
      delivery: 'Доставка від 1 дня',
      languageAria: 'Мова',
      menu: 'Меню',
      catalog: 'Каталог',
      wishlist: 'Обране',
      compare: 'Порівняння',
      compareGoCatalog: 'Порівняння — перейти в каталог',
      compareSelected: (count: number) => `Порівняння, вибрано товарів: ${count}`,
      themeLabel: 'Тема',
      themeTitleSystem: (isDark: boolean) => `Тема як у системі (зараз ${isDark ? 'темна' : 'світла'}). Натисніть: світла`,
      themeTitleLight: 'Світла тема. Натисніть: темна',
      themeTitleDark: 'Темна тема. Натисніть: як у системі',
      themeAria: 'Перемкнути режим теми: система, світла, темна',
      cart: 'Кошик',
      cartAria: (count: number) => `Кошик, позицій: ${count}`,
      closeMenu: 'Закрити меню',
      close: 'Закрити',
      mainNav: 'Основне меню',
      home: 'Головна',
      account: 'Особистий кабінет',
      accountBottom: 'Мій акаунт',
      orders: 'Мої замовлення',
      deliveryMenu: 'Доставка',
      contacts: 'Контакти',
      about: 'Про магазин',
      analytics: 'Для бізнесу (аналітика)',
      admin: 'Адмінка каталогу',
      categories: 'Категорії',
    },
    ru: {
      htmlLang: 'ru',
      city: 'Киев',
      deals: 'Акции',
      buyers: 'Покупателям',
      stores: 'Магазины',
      nationwide: 'По всей Украине',
      delivery: 'Доставка от 1 дня',
      languageAria: 'Язык',
      menu: 'Меню',
      catalog: 'Каталог',
      wishlist: 'Избранное',
      compare: 'Сравнение',
      compareGoCatalog: 'Сравнение — перейти в каталог',
      compareSelected: (count: number) => `Сравнение, выбрано товаров: ${count}`,
      themeLabel: 'Тема',
      themeTitleSystem: (isDark: boolean) => `Тема как в системе (сейчас ${isDark ? 'тёмная' : 'светлая'}). Нажмите: светлая`,
      themeTitleLight: 'Светлая тема. Нажмите: тёмная',
      themeTitleDark: 'Тёмная тема. Нажмите: как в системе',
      themeAria: 'Переключить режим темы: система, светлая, тёмная',
      cart: 'Корзина',
      cartAria: (count: number) => `Корзина, позиций: ${count}`,
      closeMenu: 'Закрыть меню',
      close: 'Закрыть',
      mainNav: 'Основное меню',
      home: 'Главная',
      account: 'Личный кабинет',
      accountBottom: 'Мой аккаунт',
      orders: 'Мои заказы',
      deliveryMenu: 'Доставка',
      contacts: 'Контакты',
      about: 'О магазине',
      analytics: 'Для бизнеса (аналитика)',
      admin: 'Админка каталога',
      categories: 'Категории',
    },
    en: {
      htmlLang: 'en',
      city: 'Kyiv',
      deals: 'Deals',
      buyers: 'For customers',
      stores: 'Stores',
      nationwide: 'Across Ukraine',
      delivery: 'Delivery from 1 day',
      languageAria: 'Language',
      menu: 'Menu',
      catalog: 'Catalog',
      wishlist: 'Wishlist',
      compare: 'Compare',
      compareGoCatalog: 'Compare — go to catalog',
      compareSelected: (count: number) => `Compare, selected items: ${count}`,
      themeLabel: 'Theme',
      themeTitleSystem: (isDark: boolean) => `Theme follows system (currently ${isDark ? 'dark' : 'light'}). Click: light`,
      themeTitleLight: 'Light theme. Click: dark',
      themeTitleDark: 'Dark theme. Click: system',
      themeAria: 'Switch theme mode: system, light, dark',
      cart: 'Cart',
      cartAria: (count: number) => `Cart, items: ${count}`,
      closeMenu: 'Close menu',
      close: 'Close',
      mainNav: 'Main menu',
      home: 'Home',
      account: 'Account',
      accountBottom: 'My account',
      orders: 'My orders',
      deliveryMenu: 'Delivery',
      contacts: 'Contacts',
      about: 'About store',
      analytics: 'For business (analytics)',
      admin: 'Catalog admin',
      categories: 'Categories',
    },
  } as const
  const t = copy[lang]
  const inPath = (prefix: string) => location.pathname === prefix || location.pathname.startsWith(`${prefix}/`)

  useEffect(() => {
    const onScroll = () => setHeaderScrolled(window.scrollY > 6)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const setLangSave = (l: Locale) => setLang(l)

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <>
      <div className={`${styles.headerWrap} ${headerScrolled ? styles.headerWrapScrolled : ''}`}>
        <div className={styles.topBar}>
          <div className={styles.topBarInner}>
            <div className={styles.topBarLeft}>
              <span className={styles.topMuted}>{t.city}</span>
              <span className={styles.dot} aria-hidden>
                ·
              </span>
              <Link to="/catalog" className={styles.topLinkInline}>
                {t.deals}
              </Link>
              <span className={styles.dot} aria-hidden>
                ·
              </span>
              <Link to="/about" className={styles.topLinkInline}>
                {t.buyers}
              </Link>
              <span className={styles.dot} aria-hidden>
                ·
              </span>
              <Link to="/contacts" className={styles.topLinkInline}>
                {t.stores}
              </Link>
            </div>
            <div className={styles.topBarMid}>
              <span>{t.nationwide}</span>
              <span className={styles.dot} aria-hidden>
                ·
              </span>
              <span>{t.delivery}</span>
            </div>
            <div className={styles.topBarRight}>
              <div className={styles.lang} role="group" aria-label={t.languageAria}>
                <button
                  type="button"
                  className={lang === 'uk' ? styles.langOn : styles.langOff}
                  onClick={() => setLangSave('uk')}
                >
                  UA
                </button>
                <span className={styles.langSep} aria-hidden>
                  |
                </span>
                <button
                  type="button"
                  className={lang === 'ru' ? styles.langOn : styles.langOff}
                  onClick={() => setLangSave('ru')}
                >
                  RU
                </button>
                <span className={styles.langSep} aria-hidden>
                  |
                </span>
                <button
                  type="button"
                  className={lang === 'en' ? styles.langOn : styles.langOff}
                  onClick={() => setLangSave('en')}
                >
                  EN
                </button>
              </div>
              <a className={styles.topPhone} href="tel:+380800123456">
                0 800 123 456
              </a>
            </div>
          </div>
        </div>

        <header className={styles.header}>
          <div className={styles.row}>
            <button
              type="button"
              className={`${styles.menuBtn} ${menuOpen ? styles.menuBtnOpen : ''}`}
              aria-label={t.menu}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className={styles.burger} aria-hidden />
            </button>

            <BrandLogo variant="header" to="/" />

            <button
              type="button"
              className={styles.catalogBtn}
              onClick={() => navigate('/catalog', { viewTransition: true })}
            >
              <IconGrid />
              <span>{t.catalog}</span>
            </button>

            <SearchField className={styles.searchWrap} lang={lang} />

            <div className={styles.navCluster}>
              <UserMenu variant="header" />

              <Link to="/wishlist" className={styles.navItem} viewTransition aria-label={t.wishlist}>
                <span className={styles.navGlyph} aria-hidden>
                  <IconHeart />
                </span>
                <span className={styles.navLabel}>{t.wishlist}</span>
              </Link>

              {compareIds.length > 0 ? (
                <button
                  type="button"
                  className={styles.navItem}
                  aria-label={t.compareSelected(compareIds.length)}
                  onClick={() =>
                    document.getElementById('compare-dock')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                  }
                >
                  <span className={styles.navGlyph} aria-hidden>
                    <IconCompare />
                  </span>
                  <span className={styles.navLabel}>{t.compare}</span>
                  <span className={styles.navBadge}>{compareIds.length}</span>
                </button>
              ) : (
                <Link to="/catalog" className={styles.navItem} viewTransition aria-label={t.compareGoCatalog}>
                  <span className={styles.navGlyph} aria-hidden>
                    <IconCompare />
                  </span>
                  <span className={styles.navLabel}>{t.compare}</span>
                </Link>
              )}

              <button
                type="button"
                className={styles.navItem}
                onClick={cycleTheme}
                title={
                  themePreference === 'system'
                    ? t.themeTitleSystem(theme === 'dark')
                    : themePreference === 'light'
                      ? t.themeTitleLight
                      : t.themeTitleDark
                }
                aria-label={t.themeAria}
              >
                <span className={styles.navGlyph} aria-hidden>
                  {themePreference === 'system' ? <IconMonitor /> : themePreference === 'light' ? <IconSun /> : <IconMoon />}
                </span>
                <span className={styles.navLabel}>{t.themeLabel}</span>
              </button>

              <button
                type="button"
                className={`${styles.navItem} ${styles.navItemCart}`}
                aria-label={t.cartAria(cartTotalQty)}
                onClick={openCartDrawer}
              >
                <span className={styles.navGlyph} aria-hidden>
                  <IconCart />
                </span>
                <span className={styles.navLabel}>{t.cart}</span>
                {cartTotalQty > 0 ? (
                  <span key={cartTotalQty} className={styles.navBadge}>
                    {cartTotalQty > 99 ? '99+' : cartTotalQty}
                  </span>
                ) : null}
              </button>
            </div>
          </div>
        </header>
      </div>

      {menuOpen ? (
        <div className={styles.drawerRoot}>
          <button type="button" className={styles.drawerBackdrop} aria-label={t.closeMenu} onClick={() => setMenuOpen(false)} />
          <div className={styles.drawer}>
            <div className={styles.drawerHead}>
              <BrandLogo variant="drawer" to="/" onNavigate={() => setMenuOpen(false)} />
              <button type="button" className={styles.drawerClose} onClick={() => setMenuOpen(false)} aria-label={t.close}>
                ×
              </button>
            </div>
            <div className={styles.drawerScroll}>
              <nav className={styles.drawerNav} aria-label={t.mainNav}>
                <Link to="/account" onClick={() => setMenuOpen(false)} viewTransition>
                  <span className={styles.drawerNavIco} aria-hidden>
                    <IconUser />
                  </span>
                  <span>{t.account}</span>
                </Link>
                <Link to="/" onClick={() => setMenuOpen(false)}>
                  <span className={styles.drawerNavIco} aria-hidden>
                    <IconHome />
                  </span>
                  <span>{t.home}</span>
                </Link>
                <Link to="/catalog" onClick={() => setMenuOpen(false)} viewTransition>
                  <span className={styles.drawerNavIco} aria-hidden>
                    <IconGrid />
                  </span>
                  <span>{t.catalog}</span>
                </Link>
                <Link to="/wishlist" onClick={() => setMenuOpen(false)} viewTransition>
                  <span className={styles.drawerNavIco} aria-hidden>
                    <IconHeart />
                  </span>
                  <span>{t.wishlist}</span>
                </Link>
                <Link to="/orders" onClick={() => setMenuOpen(false)}>
                  <span className={styles.drawerNavIco} aria-hidden>
                    <IconReceipt />
                  </span>
                  <span>{t.orders}</span>
                </Link>
                <Link to="/cart" onClick={() => setMenuOpen(false)}>
                  <span className={styles.drawerNavIco} aria-hidden>
                    <IconCart />
                  </span>
                  <span>{t.cart}</span>
                </Link>
                <Link to="/delivery" onClick={() => setMenuOpen(false)}>
                  <span className={styles.drawerNavIco} aria-hidden>
                    <IconTruck />
                  </span>
                  <span>{t.deliveryMenu}</span>
                </Link>
                <Link to="/contacts" onClick={() => setMenuOpen(false)}>
                  <span className={styles.drawerNavIco} aria-hidden>
                    <IconHeadset />
                  </span>
                  <span>{t.contacts}</span>
                </Link>
                <Link to="/about" onClick={() => setMenuOpen(false)}>
                  <span className={styles.drawerNavIco} aria-hidden>
                    <IconShield />
                  </span>
                  <span>{t.about}</span>
                </Link>
                <Link to="/analytics" onClick={() => setMenuOpen(false)}>
                  <span className={styles.drawerNavIco} aria-hidden>
                    <IconMonitor />
                  </span>
                  <span>{t.analytics}</span>
                </Link>
                <Link to="/admin" onClick={() => setMenuOpen(false)}>
                  <span className={styles.drawerNavIco} aria-hidden>
                    <IconCreditCard />
                  </span>
                  <span>{t.admin}</span>
                </Link>
              </nav>

              <div className={styles.drawerCats}>
                <p className={styles.drawerCatsTitle} id="drawer-cats-heading">
                  {t.categories}
                </p>
                <ul className={styles.drawerCatsGrid} aria-labelledby="drawer-cats-heading">
                  {categories.map((c) => (
                    <li key={c}>
                      <button
                        type="button"
                        className={styles.drawerCatBtn}
                        onClick={() => {
                          setCategoryFilter(c)
                          setBrandFilter('all')
                          setMenuOpen(false)
                          navigate('/catalog', { viewTransition: true })
                        }}
                      >
                        {c}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <nav className={styles.mobileBottomNav} aria-label={t.mainNav}>
        <Link to="/" className={`${styles.mobileBottomItem} ${location.pathname === '/' ? styles.mobileBottomItemActive : ''}`} viewTransition>
          <span className={styles.mobileBottomIco} aria-hidden>
            <IconHome />
          </span>
          <span className={styles.mobileBottomLabel}>{t.home}</span>
        </Link>

        <Link
          to="/catalog"
          className={`${styles.mobileBottomItem} ${inPath('/catalog') ? styles.mobileBottomItemActive : ''}`}
          viewTransition
        >
          <span className={styles.mobileBottomIco} aria-hidden>
            <IconGrid />
          </span>
          <span className={styles.mobileBottomLabel}>{t.catalog}</span>
        </Link>

        <Link to="/wishlist" className={`${styles.mobileBottomItem} ${inPath('/wishlist') ? styles.mobileBottomItemActive : ''}`} viewTransition>
          <span className={styles.mobileBottomIco} aria-hidden>
            <IconHeart />
          </span>
          <span className={styles.mobileBottomLabel}>{t.wishlist}</span>
        </Link>

        <button
          type="button"
          className={`${styles.mobileBottomItem} ${inPath('/cart') ? styles.mobileBottomItemActive : ''}`}
          onClick={openCartDrawer}
          aria-label={t.cartAria(cartTotalQty)}
        >
          <span className={styles.mobileBottomIco} aria-hidden>
            <IconCart />
          </span>
          <span className={styles.mobileBottomLabel}>{t.cart}</span>
          {cartTotalQty > 0 ? (
            <span className={styles.mobileBottomBadge}>{cartTotalQty > 99 ? '99+' : cartTotalQty}</span>
          ) : null}
        </button>

        <Link
          to="/account"
          className={`${styles.mobileBottomItem} ${inPath('/account') || inPath('/login') || inPath('/register') ? styles.mobileBottomItemActive : ''}`}
          viewTransition
        >
          <span className={styles.mobileBottomIco} aria-hidden>
            <IconUser />
          </span>
          <span className={styles.mobileBottomLabel}>{t.accountBottom}</span>
        </Link>
      </nav>
    </>
  )
}
