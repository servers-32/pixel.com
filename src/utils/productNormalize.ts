import type { Product, ProductBadge, ProductSpecSection } from '../types'
import { ensureProductDetail } from '../data/productDetailEnrich'

/** Подмена нежелательных Unsplash-кадров в сохранённом каталоге (localStorage / импорт). */
const IMAGE_URL_REPLACEMENTS: { test: (u: string) => boolean; to: string }[] = [
  {
    test: (u) => u.includes('photo-1511707171634'),
    to: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&h=800&fit=crop&q=80',
  },
  {
    test: (u) => u.includes('photo-1580910051074-3eb694886505'),
    to: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&h=800&fit=crop&q=80',
  },
]

function sanitizeImageUrl(url: string): string {
  for (const { test, to } of IMAGE_URL_REPLACEMENTS) {
    if (test(url)) return to
  }
  return url
}

const BADGES: ProductBadge[] = ['sale', 'new', 'hit']

function isBadge(x: unknown): x is ProductBadge {
  return typeof x === 'string' && (BADGES as string[]).includes(x)
}

/** Приводит сырые данные к валидному Product (для localStorage / импорта). */
export function normalizeProduct(p: Partial<Product> | Record<string, unknown>): Product | null {
  if (!p || typeof p !== 'object') return null
  const r = p as Partial<Product>
  if (typeof r.id !== 'string' || !r.id.trim()) return null

  let specs: Record<string, string> = {}
  if (r.specs && typeof r.specs === 'object' && !Array.isArray(r.specs)) {
    specs = Object.fromEntries(
      Object.entries(r.specs as Record<string, unknown>).filter(
        ([k, v]) => typeof k === 'string' && typeof v === 'string' && k.trim(),
      ),
    ) as Record<string, string>
  }
  if (Object.keys(specs).length === 0) {
    specs = { Наличие: 'На складе' }
  }

  const listRaw = r.listPrice as number | string | undefined | null
  let listNum = NaN
  if (listRaw != null) {
    if (typeof listRaw === 'string') {
      const t = listRaw.trim()
      if (t !== '') listNum = Number(t)
    } else {
      listNum = Number(listRaw)
    }
  }

  const rawImgs = Array.isArray(r.images)
    ? (r.images as unknown[])
        .filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
        .map((s) => sanitizeImageUrl(s.trim()))
    : []
  const single = sanitizeImageUrl(String(r.image ?? '').trim())
  const images = rawImgs.length > 0 ? rawImgs : single ? [single] : []
  const image = images[0] ?? ''

  let specSections: ProductSpecSection[] | undefined
  if (Array.isArray(r.specSections)) {
    const groups: ProductSpecSection[] = []
    for (const sec of r.specSections) {
      if (!sec || typeof sec !== 'object') continue
      const title = String((sec as { title?: unknown }).title ?? '').trim()
      const rowsRaw = (sec as { rows?: unknown }).rows
      if (!title || !Array.isArray(rowsRaw)) continue
      const rows: { key: string; value: string }[] = []
      for (const row of rowsRaw) {
        if (!row || typeof row !== 'object') continue
        const key = String((row as { key?: unknown }).key ?? '').trim()
        const value = String((row as { value?: unknown }).value ?? '').trim()
        if (key) rows.push({ key, value })
      }
      if (rows.length) groups.push({ title, rows })
    }
    if (groups.length) specSections = groups
  }

  const longRaw = r.longDescription
  const longDescription =
    typeof longRaw === 'string' && longRaw.trim() ? longRaw.trim() : undefined

  const out: Product = {
    id: r.id.trim(),
    sku: String(r.sku ?? '').trim() || '—',
    name: String(r.name ?? 'Без названия').trim() || 'Без названия',
    brand: String(r.brand ?? '').trim() || 'Бренд',
    price: Math.max(0, Math.round(Number(r.price)) || 0),
    listPrice: Number.isFinite(listNum) && listNum > 0 ? Math.round(listNum) : undefined,
    badge: isBadge(r.badge) ? r.badge : undefined,
    inStock: r.inStock !== false,
    category: String(r.category ?? 'Прочее').trim() || 'Прочее',
    image,
    rating: Math.min(5, Math.max(0, Number(r.rating) || 0)),
    reviewsCount: Math.max(0, Math.floor(Number(r.reviewsCount) || 0)),
    description: String(r.description ?? ''),
    specs,
  }
  if (images.length > 1) out.images = images
  if (specSections?.length) out.specSections = specSections
  if (longDescription) out.longDescription = longDescription
  return ensureProductDetail(out)
}

export function normalizeProductList(raw: unknown): Product[] {
  if (!Array.isArray(raw)) return []
  return raw.map((x) => normalizeProduct(x as Partial<Product>)).filter((x): x is Product => x !== null)
}
