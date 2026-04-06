import type {
  CartLine,
  Customer,
  Order,
  PlaceOrderPayment,
  Product,
  ShopUser,
  SortOption,
  ThemeMode,
  ThemePreference,
  ToastItem,
  ToastVariant,
} from '../types'

export type ShopContextValue = {
  products: Product[]
  categories: string[]
  brands: string[]
  filteredProducts: Product[]
  filterSignature: string
  cart: CartLine[]
  cartTotalQty: number
  cartSubtotal: number
  cartDiscount: number
  /** Сумма после промо, до списания баллов */
  cartPromoTotal: number
  cartLoyaltyDiscount: number
  cartTotal: number
  cartPromo: ReturnType<typeof import('../utils/cartPromo').computeCartPromo>
  loyaltyPointsBalance: number
  loyaltyPointsToSpend: number
  maxLoyaltyPointsApplicable: number
  setLoyaltyPointsToSpend: (n: number) => void
  orders: Order[]
  myOrders: Order[]
  searchQuery: string
  setSearchQuery: (q: string) => void
  /** Текущий применённый фильтр (для главной и т.п.) */
  categoryFilter: string
  /** С главной/шапки — сразу применяет категорию */
  setCategoryFilter: (c: string) => void
  /** Подкатегории в сайдбаре главной: категория + поиск сразу в эффекте каталога */
  setCategoryFilterWithSearch: (category: string, search: string) => void
  brandFilter: string
  setBrandFilter: (b: string) => void
  categoryDraft: string
  setCategoryDraft: (c: string) => void
  brandDraft: string
  setBrandDraft: (b: string) => void
  minPriceDraftStr: string
  setMinPriceDraftStr: (s: string) => void
  maxPriceDraftStr: string
  setMaxPriceDraftStr: (s: string) => void
  draftSliderMin: number
  setDraftSliderMin: (n: number) => void
  draftSliderMax: number
  setDraftSliderMax: (n: number) => void
  minRatingDraft: number
  setMinRatingDraft: (n: number) => void
  appliedSearchQuery: string
  /** Применяет черновики фильтров к списку; searchOverride — если строка поиска ещё не попала в state (чипы в шапке). */
  applyCatalogFilters: (opts?: { searchOverride?: string }) => void
  priceBounds: { min: number; max: number }
  sortBy: SortOption
  setSortBy: (s: SortOption) => void
  theme: ThemeMode
  themePreference: ThemePreference
  /** Система → светлая → тёмная → система */
  cycleTheme: () => void
  favoriteIds: string[]
  toggleFavorite: (productId: string) => void
  isFavorite: (productId: string) => boolean
  recentProductIds: string[]
  recordProductView: (productId: string) => void
  getProduct: (id: string) => Product | undefined
  addToCart: (productId: string, qty?: number) => Promise<void>
  setLineQuantity: (productId: string, quantity: number) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  placeOrder: (customer: Customer, payment?: PlaceOrderPayment) => Promise<Order | null>
  getOrder: (id: string) => Order | undefined
  cartBusy: boolean
  checkoutBusy: boolean
  resetFilters: () => void
  reorderFromOrder: (orderId: string) => Promise<void>
  currentUser: ShopUser | null
  login: (email: string, password: string) => Promise<string | null>
  register: (data: { email: string; password: string; name: string; phone: string }) => Promise<string | null>
  /** Обновить имя, телефон и при необходимости пароль текущего пользователя */
  updateProfile: (patch: {
    name: string
    phone: string
    newPassword?: string
  }) => Promise<string | null>
  logout: () => void
  toasts: ToastItem[]
  pushToast: (message: string, variant?: ToastVariant) => void
  compareIds: string[]
  toggleCompare: (productId: string) => void
  clearCompare: () => void
  isInCompare: (productId: string) => boolean
  cartDrawerOpen: boolean
  openCartDrawer: () => void
  closeCartDrawer: () => void
  cartBump: number
  updateProduct: (id: string, patch: Partial<Product>) => void
  addProduct: (product: Product) => void
  deleteProduct: (id: string, silent?: boolean) => void
  replaceAllProducts: (list: Product[]) => void
  resetProductsToDefault: () => void
  adjustAllPricesByPercent: (percent: number) => void
}
