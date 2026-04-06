export type ProductBadge = 'sale' | 'new' | 'hit'

/** Группа строк «характеристики как в крупных магазинах» (вкладка на карточке товара). */
export type ProductSpecSection = {
  title: string
  rows: { key: string; value: string }[]
}

export type Product = {
  id: string
  sku: string
  name: string
  brand: string
  price: number
  /** Зачёркнутая цена до скидки */
  listPrice?: number
  badge?: ProductBadge
  inStock: boolean
  category: string
  /** Основное фото (совпадает с images[0]) */
  image: string
  /** Дополнительные фото; если нет — используется только image */
  images?: string[]
  rating: number
  reviewsCount: number
  description: string
  /** Развёрнутое описание с подзаголовками через строку «\\n## Название блока» */
  longDescription?: string
  specs: Record<string, string>
  /** Сгруппированные характеристики; если нет — на карточке строятся из specs автоматически */
  specSections?: ProductSpecSection[]
}

/** Отзыв на странице товара */
export type ProductReview = {
  id: string
  authorName: string
  rating: number
  date: string
  title: string
  text: string
  verifiedPurchase: boolean
}

export type CartLine = {
  productId: string
  quantity: number
}

export type Customer = {
  name: string
  email: string
  phone: string
  address: string
  /** Город / населённый пункт */
  city?: string
  /** Индекс (если указан) */
  zip?: string
  /** Комментарий курьеру */
  deliveryNote?: string
}

export type OrderPaymentMethod = 'card' | 'installment'

/** Параметры оплаты при оформлении заказа */
export type PlaceOrderPayment = {
  paymentMethod: OrderPaymentMethod
  installmentMonths?: number
  cardLast4?: string
}

export type OrderLine = {
  productId: string
  name: string
  price: number
  quantity: number
}

export type Order = {
  id: string
  createdAt: string
  customer: Customer
  lines: OrderLine[]
  total: number
  userId?: string
  discount?: number
  /** Способ оплаты */
  paymentMethod?: OrderPaymentMethod
  /** Срок рассрочки в месяцах, если paymentMethod === installment */
  installmentMonths?: number
  /** Годовая ставка по рассрочке, % (например 12) */
  installmentAnnualRatePercent?: number
  /** Оценка ежемесячного платежа (грн) */
  installmentMonthlyPayment?: number
  /** Сумма к возврату за весь срок с учётом % (грн) */
  installmentTotalPayable?: number
  /** Последние 4 цифры карты (маскированно) */
  cardLast4?: string
  /** Списано баллов лояльности */
  loyaltyPointsSpent?: number
  /** Начислено баллов за заказ */
  loyaltyPointsEarned?: number
  /** Скидка баллами в ₴ */
  loyaltyDiscount?: number
}

export type SortOption = 'price-asc' | 'price-desc' | 'rating' | 'popularity'

export type ThemeMode = 'light' | 'dark'

/** Режим темы: как в ОС, фиксированно светлая или тёмная */
export type ThemePreference = 'system' | 'light' | 'dark'

export type ShopUser = {
  id: string
  email: string
  password: string
  name: string
  phone: string
  createdAt: string
  /** Баллы карты лояльности (1 балл = 0,10 ₴ к оплате) */
  loyaltyPoints?: number
}

export type ToastVariant = 'success' | 'error' | 'info'

export type ToastItem = {
  id: string
  message: string
  variant: ToastVariant
}
