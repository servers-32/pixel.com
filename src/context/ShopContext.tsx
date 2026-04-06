import { useCallback, useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from 'react'
import { PRODUCTS, getBrands, getCategories } from '../data/mockData'
import { mockDelay } from '../services/mockApi'
import { computeCartPromo } from '../utils/cartPromo'
import {
  moneyDiscountFromPoints,
  maxPointsApplicable,
  pointsEarnedForPaidAmount,
} from '../utils/loyalty'
import {
  computeInstallmentSchedule,
  INSTALLMENT_ANNUAL_RATE_PERCENT,
} from '../utils/installment'
import { ShopContext } from './shopContextBase'
import { randomId } from '../utils/randomId'
import { normalizeProduct, normalizeProductList } from '../utils/productNormalize'
import { clearStoredToken, getAdminApiKey, getStoredToken, isApiEnabled, setStoredToken } from '../config/api'
import * as shopApi from '../services/shopApi'
import type { ShopContextValue } from './shopContext.types'
import { useI18n } from '../i18n'
import { getProductSearchText } from '../i18n/catalog'
import type {
  CartLine,
  Customer,
  Order,
  OrderLine,
  PlaceOrderPayment,
  Product,
  ShopUser,
  SortOption,
  ThemeMode,
  ThemePreference,
  ToastItem,
  ToastVariant,
} from '../types'

const STORAGE_KEY = 'electronics-shop-v1'
const PERSIST_VERSION = 4

/** REST API + MongoDB: см. server/README.md и VITE_API_URL */
const useRemoteApi = isApiEnabled()

type Persisted = {
  persistVersion?: number
  cart: CartLine[]
  orders: Order[]
  theme: ThemeMode
  themePreference?: ThemePreference
  favoriteIds?: string[]
  recentProductIds?: string[]
  users: ShopUser[]
  sessionUserId: string | null
  compareIds: string[]
  products?: Product[]
}

function computePriceBounds(products: Product[]): { min: number; max: number } {
  if (products.length === 0) return { min: 0, max: 0 }
  const prices = products.map((p) => p.price)
  return { min: Math.min(...prices), max: Math.max(...prices) }
}

function loadPersisted(): Persisted | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as Partial<Persisted> & { cart?: CartLine[]; orders?: Order[]; products?: unknown }
    if (!Array.isArray(p.cart) || !Array.isArray(p.orders)) return null
    const productsParsed = Array.isArray(p.products) ? normalizeProductList(p.products) : []
    const pr = p as Partial<Persisted>
    const themePreference: ThemePreference | undefined =
      pr.themePreference === 'system' || pr.themePreference === 'light' || pr.themePreference === 'dark'
        ? pr.themePreference
        : undefined
    const favoriteIds = Array.isArray(pr.favoriteIds)
      ? pr.favoriteIds.filter((x: unknown): x is string => typeof x === 'string')
      : []
    const recentProductIds = Array.isArray(pr.recentProductIds)
      ? pr.recentProductIds.filter((x: unknown): x is string => typeof x === 'string')
      : []
    return {
      cart: p.cart,
      orders: p.orders,
      theme: p.theme === 'dark' ? 'dark' : 'light',
      themePreference,
      favoriteIds,
      recentProductIds,
      users: useRemoteApi ? [] : Array.isArray(p.users) ? p.users : [],
      sessionUserId: useRemoteApi ? null : typeof p.sessionUserId === 'string' ? p.sessionUserId : null,
      compareIds: Array.isArray(p.compareIds) ? p.compareIds.filter((x) => typeof x === 'string') : [],
      products: useRemoteApi ? undefined : productsParsed.length > 0 ? productsParsed : undefined,
    }
  } catch {
    return null
  }
}

/**
 * Каталог из localStorage раньше полностью подменял `mockData`, поэтому новые товары в коде не появлялись у пользователя.
 * Подмешиваем новые id из актуального PRODUCTS; по совпадающим id оставляем сохранённую версию (правки в админке).
 * Товары только в localStorage (созданные вручную) дописываются в конец.
 */
function mergePersistedWithDefaults(defaults: Product[], persisted: Product[] | undefined): Product[] {
  if (!persisted || persisted.length === 0) return structuredClone(defaults)
  const persistedById = new Map(persisted.map((p) => [p.id, p]))
  const defaultIds = new Set(defaults.map((d) => d.id))
  const merged: Product[] = []
  for (const d of defaults) {
    merged.push(persistedById.get(d.id) ?? d)
  }
  for (const p of persisted) {
    if (!defaultIds.has(p.id)) merged.push(p)
  }
  return normalizeProductList(merged)
}

const INITIAL = (() => {
  try {
    const persisted = loadPersisted()
    const products = useRemoteApi
      ? []
      : persisted?.products && persisted.products.length > 0
        ? mergePersistedWithDefaults(PRODUCTS, persisted.products)
        : structuredClone(PRODUCTS)
    return {
      persisted,
      products,
      bounds: computePriceBounds(products),
    }
  } catch (e) {
    console.error('[Shop] Не удалось восстановить данные из localStorage, используем каталог по умолчанию.', e)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
    const products = structuredClone(PRODUCTS)
    return {
      persisted: null,
      products,
      bounds: computePriceBounds(products),
    }
  }
})()

function soldStats(orders: Order[]): Map<string, { qty: number; revenue: number }> {
  const m = new Map<string, { qty: number; revenue: number }>()
  for (const o of orders) {
    for (const l of o.lines) {
      const cur = m.get(l.productId) ?? { qty: 0, revenue: 0 }
      cur.qty += l.quantity
      cur.revenue += l.price * l.quantity
      m.set(l.productId, cur)
    }
  }
  return m
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const { locale } = useI18n()
  const [products, setProducts] = useState<Product[]>(() => INITIAL.products)
  const [cart, setCart] = useState<CartLine[]>(() => INITIAL.persisted?.cart ?? [])
  const [orders, setOrders] = useState<Order[]>(() => INITIAL.persisted?.orders ?? [])
  const [users, setUsers] = useState<ShopUser[]>(() => (useRemoteApi ? [] : INITIAL.persisted?.users ?? []))
  const [sessionUserId, setSessionUserId] = useState<string | null>(() =>
    useRemoteApi ? null : (INITIAL.persisted?.sessionUserId ?? null),
  )
  const [compareIds, setCompareIds] = useState<string[]>(() => INITIAL.persisted?.compareIds ?? [])
  const [themePreference, setThemePreference] = useState<ThemePreference>(() => {
    const p = INITIAL.persisted
    if (!p) return 'system'
    if (p.themePreference === 'system' || p.themePreference === 'light' || p.themePreference === 'dark') {
      return p.themePreference
    }
    return p.theme === 'dark' ? 'dark' : 'light'
  })
  const [systemDark, setSystemDark] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches,
  )
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => INITIAL.persisted?.favoriteIds ?? [])
  const [recentProductIds, setRecentProductIds] = useState<string[]>(() => INITIAL.persisted?.recentProductIds ?? [])
  const [searchQuery, setSearchQuery] = useState('')
  /** Черновик фильтров в сайдбаре; в список попадают только значения после «Поиск» */
  const [categoryDraft, setCategoryDraft] = useState('all')
  const [brandDraft, setBrandDraft] = useState('all')
  const [minPriceDraftStr, setMinPriceDraftStr] = useState('')
  const [maxPriceDraftStr, setMaxPriceDraftStr] = useState('')
  const [draftSliderMin, setDraftSliderMin] = useState(0)
  const [draftSliderMax, setDraftSliderMax] = useState(() => INITIAL.bounds.max)
  const [minRatingDraft, setMinRatingDraft] = useState(0)
  /** Применённые фильтры каталога */
  const [categoryApplied, setCategoryApplied] = useState('all')
  const [brandApplied, setBrandApplied] = useState('all')
  const [appliedMinPrice, setAppliedMinPrice] = useState<number | null>(null)
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<number | null>(null)
  const [appliedMinRating, setAppliedMinRating] = useState(0)
  const [appliedSearchQuery, setAppliedSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('popularity')
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false)
  const [cartBusy, setCartBusy] = useState(false)
  const [checkoutBusy, setCheckoutBusy] = useState(false)
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [cartBump, setCartBump] = useState(0)
  const [loyaltyPointsToSpendRaw, setLoyaltyPointsToSpendRaw] = useState(0)

  const theme: ThemeMode = useMemo(
    () => (themePreference === 'system' ? (systemDark ? 'dark' : 'light') : themePreference),
    [themePreference, systemDark],
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const fn = () => setSystemDark(mq.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])

  const priceBounds = useMemo(() => computePriceBounds(products), [products])

  useEffect(() => {
    if (products.length === 0) return
    const { min, max } = priceBounds
    setDraftSliderMin((x) => Math.min(Math.max(x, min), max))
    setDraftSliderMax((x) => Math.min(Math.max(x, min), max))
  }, [products, priceBounds])

  const categories = useMemo(() => getCategories(products), [products])
  const brands = useMemo(() => getBrands(products), [products])

  useEffect(() => {
    if (sessionUserId && !users.some((u) => u.id === sessionUserId)) {
      setSessionUserId(null)
    }
  }, [sessionUserId, users])

  const currentUser = useMemo(
    () => (sessionUserId ? users.find((u) => u.id === sessionUserId) ?? null : null),
    [sessionUserId, users],
  )

  const myOrders = useMemo(() => {
    if (!currentUser) return []
    return orders.filter((o) => o.userId === currentUser.id)
  }, [orders, currentUser])

  useEffect(() => {
    const payload: Persisted = {
      persistVersion: PERSIST_VERSION,
      cart,
      orders,
      theme,
      themePreference,
      favoriteIds,
      recentProductIds,
      users: useRemoteApi ? [] : users,
      sessionUserId: useRemoteApi ? null : sessionUserId,
      compareIds,
      products: useRemoteApi ? [] : products,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }, [cart, orders, theme, themePreference, favoriteIds, recentProductIds, users, sessionUserId, compareIds, products])

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#020617' : '#f5f6f8')
  }, [theme])

  useEffect(() => {
    if (!cartDrawerOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCartDrawerOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [cartDrawerOpen])

  const pushToast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = randomId()
    setToasts((t) => [...t.slice(-2), { id, message, variant }])
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id))
    }, 3400)
  }, [])

  useEffect(() => {
    if (!useRemoteApi) return
    let cancelled = false
    shopApi
      .fetchProducts()
      .then((list) => {
        if (cancelled) return
        const next = normalizeProductList(list.filter(Boolean))
        if (next.length > 0) setProducts(next)
        else {
          setProducts(structuredClone(PRODUCTS))
          pushToast('Каталог пуст на сервере — показан локальный', 'info')
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProducts(structuredClone(PRODUCTS))
          pushToast('Нет связи с сервером — локальный каталог', 'error')
        }
      })
    return () => {
      cancelled = true
    }
  }, [pushToast])

  useEffect(() => {
    if (!useRemoteApi) return
    const token = getStoredToken()
    if (!token) return
    let cancelled = false
    ;(async () => {
      const user = await shopApi.fetchMe(token)
      if (cancelled || !user) return
      setUsers([user])
      setSessionUserId(user.id)
      try {
        const o = await shopApi.fetchMyOrders(token)
        if (!cancelled) setOrders(o)
      } catch {
        /* оставляем заказы из localStorage */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const cycleTheme = useCallback(() => {
    setThemePreference((prev) => {
      if (prev === 'system') return 'light'
      if (prev === 'light') return 'dark'
      return 'system'
    })
  }, [])

  /** Ссылки с главной / шапки — сразу и черновик, и применённый фильтр */
  const setCategoryFilter = useCallback((c: string) => {
    setCategoryDraft(c)
    setCategoryApplied(c)
  }, [])

  const setCategoryFilterWithSearch = useCallback((c: string, search: string) => {
    setCategoryDraft(c)
    setCategoryApplied(c)
    setBrandDraft('all')
    setBrandApplied('all')
    const q = search.trim()
    setSearchQuery(q)
    setAppliedSearchQuery(q)
  }, [])

  const setBrandFilter = useCallback((b: string) => {
    setBrandDraft(b)
    setBrandApplied(b)
  }, [])

  const applyCatalogFilters = useCallback((opts?: { searchOverride?: string }) => {
    setCategoryApplied(categoryDraft)
    setBrandApplied(brandDraft)
    const parseP = (s: string): number | null => {
      const t = s.trim().replace(',', '.')
      if (t === '') return null
      const n = Number(t)
      return Number.isFinite(n) ? n : null
    }
    let minP = parseP(minPriceDraftStr)
    let maxP = parseP(maxPriceDraftStr)
    if (minP != null && minP <= 0) minP = null
    if (maxP != null && maxP <= 0) maxP = null
    if (minP == null && draftSliderMin > priceBounds.min) minP = draftSliderMin
    if (maxP == null && draftSliderMax < priceBounds.max) maxP = draftSliderMax
    setAppliedMinPrice(minP)
    setAppliedMaxPrice(maxP)
    setAppliedMinRating(minRatingDraft)
    const q = (opts?.searchOverride ?? searchQuery).trim()
    setAppliedSearchQuery(q)
  }, [
    categoryDraft,
    brandDraft,
    minPriceDraftStr,
    maxPriceDraftStr,
    draftSliderMin,
    draftSliderMax,
    priceBounds.min,
    priceBounds.max,
    minRatingDraft,
    searchQuery,
  ])

  const toggleFavorite = useCallback((productId: string) => {
    setFavoriteIds((prev) =>
      prev.includes(productId) ? prev.filter((x) => x !== productId) : [...prev, productId],
    )
  }, [])

  const isFavorite = useCallback((id: string) => favoriteIds.includes(id), [favoriteIds])

  const recordProductView = useCallback((productId: string) => {
    setRecentProductIds((prev) => {
      const next = [productId, ...prev.filter((x) => x !== productId)]
      return next.slice(0, 15)
    })
  }, [])

  const stats = useMemo(() => soldStats(orders), [orders])

  const filteredProducts = useMemo(() => {
    const q = appliedSearchQuery.trim().toLowerCase()
    let list = products.filter((p) => {
      if (categoryApplied !== 'all' && p.category !== categoryApplied) return false
      if (brandApplied !== 'all' && p.brand !== brandApplied) return false
      if (appliedMinPrice != null && p.price < appliedMinPrice) return false
      if (appliedMaxPrice != null && p.price > appliedMaxPrice) return false
      if (p.rating < appliedMinRating) return false
      if (q) {
        const hay = getProductSearchText(p, locale)
        if (!hay.includes(q)) return false
      }
      return true
    })

    const pop = (id: string) => stats.get(id)?.qty ?? 0

    list = [...list].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price
        case 'price-desc':
          return b.price - a.price
        case 'rating':
          return b.rating - a.rating
        case 'popularity':
        default:
          return pop(b.id) - pop(a.id) || b.rating - a.rating
      }
    })
    return list
  }, [
    products,
    appliedSearchQuery,
    categoryApplied,
    brandApplied,
    appliedMinPrice,
    appliedMaxPrice,
    appliedMinRating,
    sortBy,
    stats,
    locale,
  ])

  const filterSignature = useMemo(
    () =>
      [
        categoryApplied,
        brandApplied,
        appliedMinPrice,
        appliedMaxPrice,
        appliedMinRating,
        sortBy,
        appliedSearchQuery.trim(),
      ].join('|'),
    [categoryApplied, brandApplied, appliedMinPrice, appliedMaxPrice, appliedMinRating, sortBy, appliedSearchQuery],
  )

  const getProduct = useCallback((id: string) => products.find((p) => p.id === id), [products])

  const getOrder = useCallback((id: string) => orders.find((o) => o.id === id), [orders])

  const cartSubtotal = useMemo(() => {
    let sum = 0
    for (const line of cart) {
      const p = products.find((x) => x.id === line.productId)
      if (p) sum += p.price * line.quantity
    }
    return sum
  }, [cart, products])

  const cartPromo = useMemo(() => computeCartPromo(cartSubtotal), [cartSubtotal])
  const cartDiscount = cartPromo.discount
  const cartPromoTotal = cartPromo.total

  const maxLoyaltyPointsApplicable = useMemo(() => {
    if (!currentUser) return 0
    return maxPointsApplicable(currentUser.loyaltyPoints ?? 0, cartPromoTotal)
  }, [currentUser, cartPromoTotal])

  const loyaltyPointsToSpend = Math.min(loyaltyPointsToSpendRaw, maxLoyaltyPointsApplicable)

  const cartLoyaltyDiscount = useMemo(() => {
    const raw = moneyDiscountFromPoints(loyaltyPointsToSpend)
    return Math.min(raw, cartPromoTotal)
  }, [loyaltyPointsToSpend, cartPromoTotal])

  const cartTotal = useMemo(
    () => Math.max(0, Math.round((cartPromoTotal - cartLoyaltyDiscount) * 100) / 100),
    [cartPromoTotal, cartLoyaltyDiscount],
  )

  const loyaltyPointsBalance = currentUser?.loyaltyPoints ?? 0

  const cartTotalQty = useMemo(() => cart.reduce((s, l) => s + l.quantity, 0), [cart])

  useEffect(() => {
    setLoyaltyPointsToSpendRaw((x) => Math.min(x, maxLoyaltyPointsApplicable))
  }, [maxLoyaltyPointsApplicable])

  useEffect(() => {
    if (!currentUser) setLoyaltyPointsToSpendRaw(0)
  }, [currentUser])

  const setLoyaltyPointsToSpend = useCallback((n: number) => {
    setLoyaltyPointsToSpendRaw(Math.max(0, Math.floor(Number.isFinite(n) ? n : 0)))
  }, [])

  const openCartDrawer = useCallback(() => setCartDrawerOpen(true), [])
  const closeCartDrawer = useCallback(() => setCartDrawerOpen(false), [])

  const toggleCompare = useCallback(
    (productId: string) => {
      setCompareIds((prev) => {
        if (prev.includes(productId)) return prev.filter((x) => x !== productId)
        if (prev.length >= 3) {
          pushToast('В сравнении не больше 3 товаров', 'error')
          return prev
        }
        return [...prev, productId]
      })
    },
    [pushToast],
  )

  const clearCompare = useCallback(() => setCompareIds([]), [])

  const isInCompare = useCallback((id: string) => compareIds.includes(id), [compareIds])

  const updateProduct = useCallback(
    (id: string, patch: Partial<Product>) => {
      if (useRemoteApi && getAdminApiKey()) {
        void shopApi
          .adminPatchProduct(id, patch)
          .then((updated) => {
            const n = normalizeProduct(updated)
            if (n) setProducts((prev) => prev.map((p) => (p.id === id ? n : p)))
          })
          .catch((e: unknown) => {
            pushToast(e instanceof Error ? e.message : 'Ошибка сохранения товара', 'error')
          })
        return
      }
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p
          const merged = { ...p, ...patch, specs: patch.specs ?? p.specs } as Product
          /** Одно фото: в patch только `image`, без `images` — иначе в merge остаётся старый `images[]` и картинки не меняются */
          if (
            !Object.prototype.hasOwnProperty.call(patch, 'images') &&
            Object.prototype.hasOwnProperty.call(patch, 'image')
          ) {
            delete merged.images
          }
          return normalizeProduct(merged) ?? p
        }),
      )
    },
    [pushToast],
  )

  const addProduct = useCallback(
    (product: Product) => {
      const n = normalizeProduct(product)
      if (!n) {
        pushToast('Не удалось сохранить товар', 'error')
        return
      }
      if (useRemoteApi && getAdminApiKey()) {
        void shopApi
          .adminCreateProduct(n)
          .then((created) => {
            const c = normalizeProduct(created)
            if (!c) {
              pushToast('Некорректный ответ сервера', 'error')
              return
            }
            setProducts((prev) => {
              if (prev.some((x) => x.id === c.id)) return prev
              return [...prev, c]
            })
            pushToast('Товар добавлен', 'success')
          })
          .catch((e: unknown) => {
            pushToast(e instanceof Error ? e.message : 'Ошибка добавления', 'error')
          })
        return
      }
      let added = false
      setProducts((prev) => {
        if (prev.some((x) => x.id === n.id)) return prev
        added = true
        return [...prev, n]
      })
      if (added) pushToast('Товар добавлен', 'success')
      else pushToast('Товар с таким ID уже есть', 'error')
    },
    [pushToast],
  )

  const deleteProduct = useCallback(
    (id: string, silent?: boolean) => {
      if (useRemoteApi && getAdminApiKey()) {
        void shopApi
          .adminDeleteProduct(id)
          .then(() => {
            setProducts((prev) => prev.filter((p) => p.id !== id))
            setCart((prev) => prev.filter((l) => l.productId !== id))
            setCompareIds((prev) => prev.filter((x) => x !== id))
            if (!silent) pushToast('Товар удалён', 'info')
          })
          .catch((e: unknown) => {
            pushToast(e instanceof Error ? e.message : 'Ошибка удаления', 'error')
          })
        return
      }
      setProducts((prev) => prev.filter((p) => p.id !== id))
      setCart((prev) => prev.filter((l) => l.productId !== id))
      setCompareIds((prev) => prev.filter((x) => x !== id))
      if (!silent) pushToast('Товар удалён', 'info')
    },
    [pushToast],
  )

  const replaceAllProducts = useCallback(
    (list: Product[]) => {
      if (useRemoteApi) {
        pushToast('При подключённом API каталог на сервере; массовая замена отключена', 'info')
        return
      }
      const next = normalizeProductList(list)
      if (next.length === 0) {
        pushToast('Нет валидных товаров в списке', 'error')
        return
      }
      setProducts(next)
      const ids = new Set(next.map((p) => p.id))
      setCart((c) => c.filter((l) => ids.has(l.productId)))
      setCompareIds((c) => c.filter((id) => ids.has(id)))
      pushToast(`Каталог заменён (${next.length} поз.)`, 'success')
    },
    [pushToast],
  )

  const resetProductsToDefault = useCallback(() => {
    if (useRemoteApi) {
      pushToast('Сброс каталога недоступен при API — обновите данные в MongoDB или отключите VITE_API_URL', 'info')
      return
    }
    const next = structuredClone(PRODUCTS)
    setProducts(next)
    setCart([])
    setCompareIds([])
    const b = computePriceBounds(next)
    setDraftSliderMin(b.min)
    setDraftSliderMax(b.max)
    setMinPriceDraftStr('')
    setMaxPriceDraftStr('')
    setAppliedMinPrice(null)
    setAppliedMaxPrice(null)
    pushToast('Каталог восстановлен к исходному составу', 'success')
  }, [pushToast])

  const adjustAllPricesByPercent = useCallback(
    (percent: number) => {
      if (useRemoteApi) {
        pushToast('Массовое изменение цен при API не поддерживается', 'info')
        return
      }
      const m = 1 + percent / 100
      setProducts((prev) =>
        prev.map((p) => ({
          ...p,
          price: Math.max(0, Math.round(p.price * m)),
          listPrice:
            p.listPrice != null && p.listPrice > 0 ? Math.max(0, Math.round(p.listPrice * m)) : undefined,
        })),
      )
      pushToast(`Цены изменены на ${percent > 0 ? '+' : ''}${percent}%`, 'success')
    },
    [pushToast],
  )

  const addToCart = useCallback(
    async (productId: string, qty = 1) => {
      const p0 = products.find((x) => x.id === productId)
      if (p0 && !p0.inStock) {
        pushToast('Товар временно нет в наличии', 'error')
        return
      }
      setCartBusy(true)
      await mockDelay(180)
      const p = products.find((x) => x.id === productId)
      setCart((prev) => {
        const i = prev.findIndex((l) => l.productId === productId)
        if (i === -1) return [...prev, { productId, quantity: qty }]
        const next = [...prev]
        next[i] = { ...next[i], quantity: next[i].quantity + qty }
        return next
      })
      setCartBusy(false)
      setCartBump((b) => b + 1)
      pushToast(p ? `${p.name} — в корзине` : 'Добавлено в корзину', 'success')
    },
    [pushToast, products],
  )

  const setLineQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) {
      setCart((prev) => prev.filter((l) => l.productId !== productId))
      return
    }
    setCart((prev) => {
      const i = prev.findIndex((l) => l.productId === productId)
      if (i === -1) return [...prev, { productId, quantity }]
      const next = [...prev]
      next[i] = { ...next[i], quantity }
      return next
    })
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((l) => l.productId !== productId))
    pushToast('Товар убран из корзины', 'info')
  }, [pushToast])

  const clearCart = useCallback(() => {
    setCart([])
    setLoyaltyPointsToSpendRaw(0)
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      if (useRemoteApi) {
        const res = await shopApi.loginRequest(email, password)
        if ('error' in res) return res.error
        setStoredToken(res.token)
        setUsers([res.user])
        setSessionUserId(res.user.id)
        try {
          const o = await shopApi.fetchMyOrders(res.token)
          setOrders(o)
        } catch {
          setOrders([])
        }
        pushToast(`С возвращением, ${res.user.name}!`, 'success')
        return null
      }
      await mockDelay(320)
      const normalized = email.trim().toLowerCase()
      const u = users.find((x) => x.email.toLowerCase() === normalized)
      if (!u || u.password !== password) return 'Неверный email или пароль'
      setSessionUserId(u.id)
      pushToast(`С возвращением, ${u.name}!`, 'success')
      return null
    },
    [users, pushToast],
  )

  const register = useCallback(
    async (data: { email: string; password: string; name: string; phone: string }) => {
      const email = data.email.trim().toLowerCase()
      if (data.password.length < 6) return 'Пароль не короче 6 символов'
      if (useRemoteApi) {
        const res = await shopApi.registerRequest({
          email,
          password: data.password,
          name: data.name.trim(),
          phone: data.phone.trim(),
        })
        if ('error' in res) return res.error
        setStoredToken(res.token)
        setUsers([res.user])
        setSessionUserId(res.user.id)
        try {
          const o = await shopApi.fetchMyOrders(res.token)
          setOrders(o)
        } catch {
          setOrders([])
        }
        pushToast('Регистрация прошла успешно', 'success')
        return null
      }
      await mockDelay(400)
      if (users.some((x) => x.email.toLowerCase() === email)) return 'Аккаунт с таким email уже есть'
      const user: ShopUser = {
        id: randomId(),
        email,
        password: data.password,
        name: data.name.trim(),
        phone: data.phone.trim(),
        createdAt: new Date().toISOString(),
        loyaltyPoints: 0,
      }
      setUsers((prev) => [...prev, user])
      setSessionUserId(user.id)
      pushToast('Регистрация прошла успешно', 'success')
      return null
    },
    [users, pushToast],
  )

  const logout = useCallback(() => {
    if (useRemoteApi) clearStoredToken()
    setSessionUserId(null)
    setLoyaltyPointsToSpendRaw(0)
    pushToast('Вы вышли из аккаунта', 'info')
  }, [pushToast])

  const updateProfile = useCallback(
    async (patch: { name: string; phone: string; newPassword?: string }) => {
      if (!sessionUserId) return 'Не выполнен вход'
      const pw = patch.newPassword?.trim()
      if (pw && pw.length < 6) return 'Пароль не короче 6 символов'
      if (useRemoteApi) {
        const token = getStoredToken()
        if (!token) return 'Не выполнен вход'
        const r = await shopApi.patchProfileRequest(token, {
          name: patch.name.trim(),
          phone: patch.phone.trim(),
          newPassword: pw || undefined,
        })
        if (r && typeof r === 'object' && 'error' in r && r.error) return r.error
        const user = r as ShopUser
        setUsers([user])
        pushToast('Профиль сохранён', 'success')
        return null
      }
      await mockDelay(280)
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== sessionUserId) return u
          const next: ShopUser = {
            ...u,
            name: patch.name.trim(),
            phone: patch.phone.trim(),
          }
          if (pw) next.password = pw
          return next
        }),
      )
      pushToast('Профиль сохранён', 'success')
      return null
    },
    [sessionUserId, pushToast],
  )

  const placeOrder = useCallback(
    async (customer: Customer, payment?: PlaceOrderPayment) => {
      if (cart.length === 0) return null
      setCheckoutBusy(true)
      const lines: OrderLine[] = []
      let subtotal = 0
      for (const line of cart) {
        const p = products.find((x) => x.id === line.productId)
        if (!p) continue
        const sub = p.price * line.quantity
        subtotal += sub
        lines.push({
          productId: p.id,
          name: p.name,
          price: p.price,
          quantity: line.quantity,
        })
      }
      const promo = computeCartPromo(subtotal)
      const afterPromo = promo.total
      const balance = sessionUserId
        ? (users.find((u) => u.id === sessionUserId)?.loyaltyPoints ?? 0)
        : 0
      const maxSpend = sessionUserId ? maxPointsApplicable(balance, afterPromo) : 0
      const pointsSpent = Math.min(loyaltyPointsToSpendRaw, maxSpend)
      const rawLoyalty = moneyDiscountFromPoints(pointsSpent)
      const loyaltyDiscount = Math.min(rawLoyalty, afterPromo)
      const finalTotal = Math.max(0, Math.round((afterPromo - loyaltyDiscount) * 100) / 100)
      const earned = sessionUserId ? pointsEarnedForPaidAmount(finalTotal) : 0

      const inst =
        payment?.paymentMethod === 'installment' && payment.installmentMonths
          ? computeInstallmentSchedule(finalTotal, payment.installmentMonths)
          : null

      if (useRemoteApi) {
        try {
          const token = getStoredToken()
          const payload = shopApi.buildOrderPayload(customer, lines, finalTotal, {
            discount: promo.discount > 0 ? promo.discount : undefined,
            userId: sessionUserId ?? undefined,
            payment,
            loyaltyPointsSpent: pointsSpent > 0 ? pointsSpent : undefined,
            loyaltyPointsEarned: earned > 0 ? earned : undefined,
            loyaltyDiscount: loyaltyDiscount > 0 ? loyaltyDiscount : undefined,
            installmentAnnualRatePercent:
              payment?.paymentMethod === 'installment' ? INSTALLMENT_ANNUAL_RATE_PERCENT : undefined,
            installmentMonthlyPayment: inst ? inst.monthlyPayment : undefined,
            installmentTotalPayable: inst ? inst.totalPayable : undefined,
          })
          const created = await shopApi.createOrderRequest(payload, token)
          if (token) {
            const me = await shopApi.fetchMe(token)
            if (me) setUsers([me])
          }
          setOrders((prev) => [created, ...prev])
          setCart([])
          setLoyaltyPointsToSpendRaw(0)
          setCartDrawerOpen(false)
          setCheckoutBusy(false)
          return created
        } catch (e) {
          pushToast(e instanceof Error ? e.message : 'Ошибка оформления заказа', 'error')
          setCheckoutBusy(false)
          return null
        }
      }

      await mockDelay(payment?.paymentMethod === 'installment' ? 700 : 550)
      const order: Order = {
        id: randomId(),
        createdAt: new Date().toISOString(),
        customer,
        lines,
        total: finalTotal,
        discount: promo.discount > 0 ? promo.discount : undefined,
        userId: sessionUserId ?? undefined,
        paymentMethod: payment?.paymentMethod,
        installmentMonths: payment?.installmentMonths,
        installmentAnnualRatePercent:
          payment?.paymentMethod === 'installment' ? INSTALLMENT_ANNUAL_RATE_PERCENT : undefined,
        installmentMonthlyPayment: inst ? inst.monthlyPayment : undefined,
        installmentTotalPayable: inst ? inst.totalPayable : undefined,
        cardLast4: payment?.cardLast4,
        loyaltyPointsSpent: pointsSpent > 0 ? pointsSpent : undefined,
        loyaltyPointsEarned: earned > 0 ? earned : undefined,
        loyaltyDiscount: loyaltyDiscount > 0 ? loyaltyDiscount : undefined,
      }
      if (sessionUserId && (pointsSpent > 0 || earned > 0)) {
        setUsers((prev) =>
          prev.map((u) => {
            if (u.id !== sessionUserId) return u
            const next = (u.loyaltyPoints ?? 0) - pointsSpent + earned
            return { ...u, loyaltyPoints: Math.max(0, next) }
          }),
        )
      }
      setOrders((prev) => [order, ...prev])
      setCart([])
      setLoyaltyPointsToSpendRaw(0)
      setCartDrawerOpen(false)
      setCheckoutBusy(false)
      return order
    },
    [cart, sessionUserId, products, loyaltyPointsToSpendRaw, users, pushToast],
  )

  const resetFilters = useCallback(() => {
    setCategoryDraft('all')
    setBrandDraft('all')
    setCategoryApplied('all')
    setBrandApplied('all')
    setAppliedMinPrice(null)
    setAppliedMaxPrice(null)
    setAppliedMinRating(0)
    setAppliedSearchQuery('')
    setMinPriceDraftStr('')
    setMaxPriceDraftStr('')
    setDraftSliderMin(priceBounds.min)
    setDraftSliderMax(priceBounds.max)
    setMinRatingDraft(0)
    setSearchQuery('')
    setSortBy('popularity')
  }, [priceBounds.min, priceBounds.max])

  const reorderFromOrder = useCallback(
    async (orderId: string) => {
      const order = orders.find((o) => o.id === orderId)
      if (!order || order.lines.length === 0) {
        pushToast('Заказ не найден', 'error')
        return
      }
      setCartBusy(true)
      await mockDelay(220)
      let added = 0
      setCart((prev) => {
        const m = new Map(prev.map((l) => [l.productId, l.quantity]))
        for (const line of order.lines) {
          const p = products.find((x) => x.id === line.productId)
          if (!p || !p.inStock) continue
          m.set(line.productId, (m.get(line.productId) ?? 0) + line.quantity)
          added++
        }
        return Array.from(m.entries()).map(([productId, quantity]) => ({ productId, quantity }))
      })
      setCartBusy(false)
      setCartBump((b) => b + 1)
      if (added > 0) pushToast('Товары из заказа добавлены в корзину', 'success')
      else pushToast('Нет доступных позиций для повтора', 'info')
    },
    [orders, products, pushToast],
  )

  const value = useMemo<ShopContextValue>(
    () => ({
      products,
      categories,
      brands,
      filteredProducts,
      filterSignature,
      cart,
      cartTotalQty,
      cartSubtotal,
      cartDiscount,
      cartPromoTotal,
      cartLoyaltyDiscount,
      cartTotal,
      cartPromo,
      loyaltyPointsBalance,
      loyaltyPointsToSpend,
      maxLoyaltyPointsApplicable,
      setLoyaltyPointsToSpend,
      orders,
      myOrders,
      searchQuery,
      setSearchQuery,
      categoryFilter: categoryApplied,
      setCategoryFilter,
      setCategoryFilterWithSearch,
      brandFilter: brandApplied,
      setBrandFilter,
      categoryDraft,
      setCategoryDraft,
      brandDraft,
      setBrandDraft,
      minPriceDraftStr,
      setMinPriceDraftStr,
      maxPriceDraftStr,
      setMaxPriceDraftStr,
      draftSliderMin,
      setDraftSliderMin,
      draftSliderMax,
      setDraftSliderMax,
      minRatingDraft,
      setMinRatingDraft,
      appliedSearchQuery,
      applyCatalogFilters,
      priceBounds,
      sortBy,
      setSortBy,
      theme,
      themePreference,
      cycleTheme,
      favoriteIds,
      toggleFavorite,
      isFavorite,
      recentProductIds,
      recordProductView,
      getProduct,
      getOrder,
      addToCart,
      setLineQuantity,
      removeFromCart,
      clearCart,
      placeOrder,
      cartBusy,
      checkoutBusy,
      resetFilters,
      reorderFromOrder,
      currentUser,
      login,
      register,
      updateProfile,
      logout,
      toasts,
      pushToast,
      compareIds,
      toggleCompare,
      clearCompare,
      isInCompare,
      cartDrawerOpen,
      openCartDrawer,
      closeCartDrawer,
      cartBump,
      updateProduct,
      addProduct,
      deleteProduct,
      replaceAllProducts,
      resetProductsToDefault,
      adjustAllPricesByPercent,
    }),
    [
      products,
      categories,
      brands,
      filteredProducts,
      filterSignature,
      cart,
      cartTotalQty,
      cartSubtotal,
      cartDiscount,
      cartPromoTotal,
      cartLoyaltyDiscount,
      cartTotal,
      cartPromo,
      loyaltyPointsBalance,
      loyaltyPointsToSpend,
      maxLoyaltyPointsApplicable,
      setLoyaltyPointsToSpend,
      orders,
      myOrders,
      searchQuery,
      categoryApplied,
      brandApplied,
      categoryDraft,
      setCategoryDraft,
      brandDraft,
      setBrandDraft,
      minPriceDraftStr,
      setMinPriceDraftStr,
      maxPriceDraftStr,
      setMaxPriceDraftStr,
      draftSliderMin,
      setDraftSliderMin,
      draftSliderMax,
      setDraftSliderMax,
      minRatingDraft,
      setMinRatingDraft,
      appliedSearchQuery,
      applyCatalogFilters,
      setCategoryFilter,
      setCategoryFilterWithSearch,
      setBrandFilter,
      priceBounds,
      sortBy,
      theme,
      themePreference,
      cycleTheme,
      favoriteIds,
      toggleFavorite,
      isFavorite,
      recentProductIds,
      recordProductView,
      getProduct,
      getOrder,
      addToCart,
      setLineQuantity,
      removeFromCart,
      clearCart,
      placeOrder,
      cartBusy,
      checkoutBusy,
      resetFilters,
      reorderFromOrder,
      currentUser,
      login,
      register,
      updateProfile,
      logout,
      toasts,
      pushToast,
      compareIds,
      toggleCompare,
      clearCompare,
      isInCompare,
      cartDrawerOpen,
      openCartDrawer,
      closeCartDrawer,
      cartBump,
      updateProduct,
      addProduct,
      deleteProduct,
      replaceAllProducts,
      resetProductsToDefault,
      adjustAllPricesByPercent,
    ],
  )

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}
