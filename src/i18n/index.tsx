import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type Locale = 'ru' | 'uk' | 'en'

type Params = Record<string, string | number>

const STORAGE_KEY = 'ec-lang'
const DEFAULT_LOCALE: Locale = 'uk'

const HTML_LANG: Record<Locale, string> = {
  ru: 'ru',
  uk: 'uk',
  en: 'en',
}

const MESSAGES = {
  ru: {
    common: {
      home: 'Главная',
      catalog: 'Каталог',
      contacts: 'Контакты',
      delivery: 'Доставка',
      about: 'О магазине',
      find: 'Найти',
      close: 'Закрыть',
      back: 'Назад',
      done: 'Готово',
      filters: 'Фильтры',
      resetFilters: 'Сбросить фильтры',
      reviews: 'отзывов',
      noReviews: 'Нет отзывов',
      inStock: 'Готово к отправке',
      outOfStock: 'Нет в наличии',
      expected: 'Ожидается поступление',
      addToCart: 'В корзину',
      wishlist: 'Избранное',
      compare: 'Сравнение',
      account: 'Личный кабинет',
      orders: 'Мои заказы',
      cart: 'Корзина',
      theme: 'Тема',
      search: 'Поиск',
      skipToContent: 'К основному содержимому',
      sections: 'Разделы',
      categories: 'Категории',
      products: 'Товары',
      allCategories: 'Все категории',
      allBrands: 'Все бренды',
      currencyCode: 'грн',
      freeDelivery: 'Бесплатная доставка',
      article: 'Артикул {sku}',
      code: 'Код: {sku}',
      bonusPoints: '{count} бонусов',
      shownResults: 'Показано {shown} из {total}{suffix}',
      searchSuffix: ' по запросу',
      noResultsTitle: 'Ничего не нашлось',
      noResultsText: 'По заданным условиям товаров нет. Измените фильтры или поиск.',
      openProduct: '{name} — открыть карточку',
      clearSearch: 'Очистить поле поиска',
    },
    seo: {
      defaultTitle: 'PiXEL — техника и электроника',
      home: 'Главная — PiXEL — техника и электроника',
      catalog: 'Каталог — PiXEL — техника и электроника',
      cart: 'Корзина — PiXEL — техника и электроника',
      checkout: 'Оформление заказа — PiXEL — техника и электроника',
      login: 'Вход — PiXEL — техника и электроника',
      register: 'Регистрация — PiXEL — техника и электроника',
      account: 'Личный кабинет — PiXEL — техника и электроника',
      orders: 'Мои заказы — PiXEL — техника и электроника',
      about: 'О магазине — PiXEL — техника и электроника',
      delivery: 'Доставка — PiXEL — техника и электроника',
      contacts: 'Контакты — PiXEL — техника и электроника',
      analytics: 'Аналитика — PiXEL — техника и электроника',
      admin: 'Админка — PiXEL — техника и электроника',
      notFound: 'Страница не найдена — PiXEL — техника и электроника',
      productMissing: 'Товар не найден — PiXEL — техника и электроника',
      productTitle: '{name} — PiXEL',
    },
  },
  uk: {
    common: {
      home: 'Головна',
      catalog: 'Каталог',
      contacts: 'Контакти',
      delivery: 'Доставка',
      about: 'Про магазин',
      find: 'Знайти',
      close: 'Закрити',
      back: 'Назад',
      done: 'Готово',
      filters: 'Фільтри',
      resetFilters: 'Скинути фільтри',
      reviews: 'відгуків',
      noReviews: 'Немає відгуків',
      inStock: 'Готово до відправлення',
      outOfStock: 'Немає в наявності',
      expected: 'Очікується надходження',
      addToCart: 'До кошика',
      wishlist: 'Обране',
      compare: 'Порівняння',
      account: 'Особистий кабінет',
      orders: 'Мої замовлення',
      cart: 'Кошик',
      theme: 'Тема',
      search: 'Пошук',
      skipToContent: 'Перейти до основного вмісту',
      sections: 'Розділи',
      categories: 'Категорії',
      products: 'Товари',
      allCategories: 'Усі категорії',
      allBrands: 'Усі бренди',
      currencyCode: 'грн',
      freeDelivery: 'Безкоштовна доставка',
      article: 'Артикул {sku}',
      code: 'Код: {sku}',
      bonusPoints: '{count} бонусів',
      shownResults: 'Показано {shown} з {total}{suffix}',
      searchSuffix: ' за запитом',
      noResultsTitle: 'Нічого не знайдено',
      noResultsText: 'За заданими умовами товарів немає. Змініть фільтри або пошук.',
      openProduct: '{name} — відкрити картку',
      clearSearch: 'Очистити поле пошуку',
    },
    seo: {
      defaultTitle: 'PiXEL — техніка та електроніка',
      home: 'Головна — PiXEL — техніка та електроніка',
      catalog: 'Каталог — PiXEL — техніка та електроніка',
      cart: 'Кошик — PiXEL — техніка та електроніка',
      checkout: 'Оформлення замовлення — PiXEL — техніка та електроніка',
      login: 'Вхід — PiXEL — техніка та електроніка',
      register: 'Реєстрація — PiXEL — техніка та електроніка',
      account: 'Особистий кабінет — PiXEL — техніка та електроніка',
      orders: 'Мої замовлення — PiXEL — техніка та електроніка',
      about: 'Про магазин — PiXEL — техніка та електроніка',
      delivery: 'Доставка — PiXEL — техніка та електроніка',
      contacts: 'Контакти — PiXEL — техніка та електроніка',
      analytics: 'Аналітика — PiXEL — техніка та електроніка',
      admin: 'Адмінка — PiXEL — техніка та електроніка',
      notFound: 'Сторінку не знайдено — PiXEL — техніка та електроніка',
      productMissing: 'Товар не знайдено — PiXEL — техніка та електроніка',
      productTitle: '{name} — PiXEL',
    },
  },
  en: {
    common: {
      home: 'Home',
      catalog: 'Catalog',
      contacts: 'Contacts',
      delivery: 'Delivery',
      about: 'About store',
      find: 'Find',
      close: 'Close',
      back: 'Back',
      done: 'Done',
      filters: 'Filters',
      resetFilters: 'Reset filters',
      reviews: 'reviews',
      noReviews: 'No reviews yet',
      inStock: 'Ready to ship',
      outOfStock: 'Out of stock',
      expected: 'Expected soon',
      addToCart: 'Add to cart',
      wishlist: 'Wishlist',
      compare: 'Compare',
      account: 'Account',
      orders: 'My orders',
      cart: 'Cart',
      theme: 'Theme',
      search: 'Search',
      skipToContent: 'Skip to main content',
      sections: 'Sections',
      categories: 'Categories',
      products: 'Products',
      allCategories: 'All categories',
      allBrands: 'All brands',
      currencyCode: 'UAH',
      freeDelivery: 'Free delivery',
      article: 'SKU {sku}',
      code: 'Code: {sku}',
      bonusPoints: '{count} bonus points',
      shownResults: 'Showing {shown} of {total}{suffix}',
      searchSuffix: ' for search',
      noResultsTitle: 'Nothing found',
      noResultsText: 'No products match your current filters. Try changing filters or search.',
      openProduct: '{name} — open product page',
      clearSearch: 'Clear search field',
    },
    seo: {
      defaultTitle: 'PiXEL — tech and electronics',
      home: 'Home — PiXEL — tech and electronics',
      catalog: 'Catalog — PiXEL — tech and electronics',
      cart: 'Cart — PiXEL — tech and electronics',
      checkout: 'Checkout — PiXEL — tech and electronics',
      login: 'Sign in — PiXEL — tech and electronics',
      register: 'Register — PiXEL — tech and electronics',
      account: 'Account — PiXEL — tech and electronics',
      orders: 'My orders — PiXEL — tech and electronics',
      about: 'About store — PiXEL — tech and electronics',
      delivery: 'Delivery — PiXEL — tech and electronics',
      contacts: 'Contacts — PiXEL — tech and electronics',
      analytics: 'Analytics — PiXEL — tech and electronics',
      admin: 'Admin — PiXEL — tech and electronics',
      notFound: 'Page not found — PiXEL — tech and electronics',
      productMissing: 'Product not found — PiXEL — tech and electronics',
      productTitle: '{name} — PiXEL',
    },
  },
} as const

type MessageTree = (typeof MESSAGES)[Locale]
type TranslateFn = (key: string, params?: Params) => string

type I18nContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: TranslateFn
}

const I18nContext = createContext<I18nContextValue | null>(null)

function interpolate(template: string, params?: Params): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? `{${name}}`))
}

function getByPath(tree: MessageTree, key: string): string | null {
  const parts = key.split('.')
  let current: unknown = tree
  for (const part of parts) {
    if (!current || typeof current !== 'object' || !(part in current)) return null
    current = (current as Record<string, unknown>)[part]
  }
  return typeof current === 'string' ? current : null
}

export function readStoredLocale(): Locale {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    if (value === 'ru' || value === 'uk' || value === 'en') return value
  } catch {
    /* ignore */
  }
  return DEFAULT_LOCALE
}

let currentLocale: Locale = DEFAULT_LOCALE

export function getCurrentLocale(): Locale {
  return currentLocale
}

export function localeToIntl(locale: Locale): string {
  if (locale === 'en') return 'en-US'
  if (locale === 'ru') return 'ru-UA'
  return 'uk-UA'
}

export function translate(key: string, locale: Locale = currentLocale, params?: Params): string {
  const direct = getByPath(MESSAGES[locale], key)
  if (direct) return interpolate(direct, params)
  const fallback = getByPath(MESSAGES.ru, key)
  return interpolate(fallback ?? key, params)
}

function syncDocument(locale: Locale) {
  currentLocale = locale
  document.documentElement.lang = HTML_LANG[locale]
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const value = readStoredLocale()
    currentLocale = value
    return value
  })

  useEffect(() => {
    syncDocument(locale)
  }, [locale])

  const setLocale = useCallback((next: Locale) => {
    currentLocale = next
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
    setLocaleState(next)
  }, [])

  const t = useCallback<TranslateFn>((key, params) => translate(key, locale, params), [locale])

  const value = useMemo<I18nContextValue>(() => ({ locale, setLocale, t }), [locale, setLocale, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const value = useContext(I18nContext)
  if (!value) throw new Error('useI18n must be used within I18nProvider')
  return value
}
