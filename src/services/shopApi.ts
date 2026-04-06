import { getAdminApiKey, getApiBaseUrl, getStoredToken } from '../config/api'
import type { Customer, Order, PlaceOrderPayment, Product, ShopUser } from '../types'

type ApiError = { error?: string }

async function parseJson<T>(res: Response): Promise<T & ApiError> {
  const text = await res.text()
  try {
    return JSON.parse(text) as T & ApiError
  } catch {
    return { error: text || res.statusText } as T & ApiError
  }
}

function authHeader(token: string | null): HeadersInit {
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}

export async function fetchProducts(): Promise<Product[]> {
  const base = getApiBaseUrl()
  const res = await fetch(`${base}/api/products`)
  const data = await parseJson<{ products: Product[] }>(res)
  if (!res.ok) throw new Error(data.error || 'Ошибка загрузки каталога')
  return data.products ?? []
}

export async function loginRequest(email: string, password: string): Promise<{ token: string; user: ShopUser } | { error: string }> {
  const base = getApiBaseUrl()
  const res = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await parseJson<{ token: string; user: ShopUser }>(res)
  if (!res.ok) return { error: data.error || 'Ошибка входа' }
  return { token: data.token, user: mapApiUser(data.user) }
}

export async function registerRequest(body: {
  email: string
  password: string
  name: string
  phone: string
}): Promise<{ token: string; user: ShopUser } | { error: string }> {
  const base = getApiBaseUrl()
  const res = await fetch(`${base}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await parseJson<{ token: string; user: ShopUser }>(res)
  if (!res.ok) return { error: data.error || 'Ошибка регистрации' }
  return { token: data.token, user: mapApiUser(data.user) }
}

function mapApiUser(u: ShopUser & { password?: string }): ShopUser {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    phone: u.phone,
    createdAt: u.createdAt,
    loyaltyPoints: u.loyaltyPoints ?? 0,
    password: '',
  }
}

export async function fetchMe(token: string): Promise<ShopUser | null> {
  const base = getApiBaseUrl()
  const res = await fetch(`${base}/api/auth/me`, { headers: { ...authHeader(token) } })
  const data = await parseJson<{ user: ShopUser }>(res)
  if (!res.ok) return null
  return data.user ? mapApiUser(data.user) : null
}

export async function patchProfileRequest(
  token: string,
  patch: { name: string; phone: string; newPassword?: string },
): Promise<ShopUser | { error: string }> {
  const base = getApiBaseUrl()
  const res = await fetch(`${base}/api/auth/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body: JSON.stringify(patch),
  })
  const data = await parseJson<{ user: ShopUser }>(res)
  if (!res.ok) return { error: data.error || 'Ошибка сохранения' }
  return mapApiUser(data.user)
}

export async function fetchMyOrders(token: string): Promise<Order[]> {
  const base = getApiBaseUrl()
  const res = await fetch(`${base}/api/orders/my`, { headers: { ...authHeader(token) } })
  const data = await parseJson<{ orders: Order[] }>(res)
  if (!res.ok) throw new Error(data.error || 'Ошибка заказов')
  return data.orders ?? []
}

export async function createOrderRequest(
  order: Omit<Order, 'id' | 'createdAt'>,
  token: string | null,
): Promise<Order> {
  const base = getApiBaseUrl()
  const res = await fetch(`${base}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body: JSON.stringify(order),
  })
  const data = await parseJson<{ order: Order }>(res)
  if (!res.ok) throw new Error(data.error || 'Ошибка оформления')
  return data.order
}

/** Собрать тело заказа для API из данных чекаута (как в ShopContext.placeOrder) */
export function buildOrderPayload(
  customer: Customer,
  lines: Order['lines'],
  total: number,
  extras: {
    discount?: number
    userId?: string
    payment?: PlaceOrderPayment
    loyaltyPointsSpent?: number
    loyaltyPointsEarned?: number
    loyaltyDiscount?: number
    installmentAnnualRatePercent?: number
    installmentMonthlyPayment?: number
    installmentTotalPayable?: number
  },
): Omit<Order, 'id' | 'createdAt'> {
  const payment = extras.payment
  return {
    customer,
    lines,
    total,
    discount: extras.discount,
    userId: extras.userId,
    paymentMethod: payment?.paymentMethod,
    installmentMonths: payment?.installmentMonths,
    installmentAnnualRatePercent: extras.installmentAnnualRatePercent,
    installmentMonthlyPayment: extras.installmentMonthlyPayment,
    installmentTotalPayable: extras.installmentTotalPayable,
    cardLast4: payment?.cardLast4,
    loyaltyPointsSpent: extras.loyaltyPointsSpent,
    loyaltyPointsEarned: extras.loyaltyPointsEarned,
    loyaltyDiscount: extras.loyaltyDiscount,
  }
}

export async function adminCreateProduct(product: Product): Promise<Product> {
  const key = getAdminApiKey()
  if (!key) throw new Error('Нет VITE_ADMIN_API_KEY')
  const base = getApiBaseUrl()
  const res = await fetch(`${base}/api/admin/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Key': key },
    body: JSON.stringify(product),
  })
  const data = await parseJson<{ product: Product }>(res)
  if (!res.ok) throw new Error(data.error || 'Ошибка')
  return data.product
}

export async function adminPatchProduct(id: string, patch: Partial<Product>): Promise<Product> {
  const key = getAdminApiKey()
  if (!key) throw new Error('Нет VITE_ADMIN_API_KEY')
  const base = getApiBaseUrl()
  const res = await fetch(`${base}/api/admin/products/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Key': key },
    body: JSON.stringify(patch),
  })
  const data = await parseJson<{ product: Product }>(res)
  if (!res.ok) throw new Error(data.error || 'Ошибка')
  return data.product
}

export async function adminDeleteProduct(id: string): Promise<void> {
  const key = getAdminApiKey()
  if (!key) throw new Error('Нет VITE_ADMIN_API_KEY')
  const base = getApiBaseUrl()
  const res = await fetch(`${base}/api/admin/products/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { 'X-Admin-Key': key },
  })
  if (!res.ok) {
    const data = await parseJson<ApiError>(res)
    throw new Error(data.error || 'Ошибка удаления')
  }
}

export function getTokenForRequest(): string | null {
  return getStoredToken()
}
