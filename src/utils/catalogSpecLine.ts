import type { Product } from '../types'
import { getCurrentLocale } from '../i18n'
import { getCategoryId, localizeProductSpecs, localizeSpecKey } from '../i18n/catalog'

/** Единый вид объёмов: «256 ГБ», не «256ГБ» / «512 Гб» */
export function normalizeSpecLabel(text: string): string {
  return String(text)
    .trim()
    .replace(/(\d+)\s*(ГБ|Гб|гб)(?!\s*\/)/gi, '$1 ГБ')
    .replace(/(\d+)\s*(GB|Gb)(?!\s*\/)/g, '$1 GB')
}

/** Добивает до 3 тегов сервисными строками — без «дырки» между чипами и рейтингом */
function padSpecTagsToThree(parts: string[], product: Product): string[] {
  const locale = getCurrentLocale()
  const s = localizeProductSpecs(product, locale)
  const out = [...parts]
  const seen = new Set(out.map((x) => x.trim().toLowerCase()))

  const tryAdd = (label: string) => {
    if (out.length >= 3) return
    const key = label.trim().toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    out.push(label)
  }

  const warrantyKey = localizeSpecKey('Гарантия', locale)
  const deliveryKey = localizeSpecKey('Срок доставки', locale)
  const w = s[warrantyKey]
  if (w) tryAdd(`${warrantyKey} ${w}`)
  const d = s[deliveryKey]
  if (d) tryAdd(`${locale === 'en' ? 'Delivery' : locale === 'uk' ? 'Доставка' : 'Доставка'} ${d}`)
  if (product.inStock) tryAdd(locale === 'en' ? 'In stock' : locale === 'uk' ? 'На складі' : 'На складе')

  return out.slice(0, 3).map(normalizeSpecLabel)
}

/** До 3 коротких характеристик для карточки каталога (теги / строка) */
export function catalogSpecParts(product: Product): string[] {
  const locale = getCurrentLocale()
  const rawSpecs = product.specs
  const s = localizeProductSpecs(product, locale)
  const cat = getCategoryId(product.category)

  let raw: string[] = []

  if (cat === 'smartphones') {
    raw = [rawSpecs['Экран'] || rawSpecs['Форм'], rawSpecs['Память'], rawSpecs['Аккумулятор']]
      .filter(Boolean)
      .slice(0, 3) as string[]
  } else if (cat === 'laptops') {
    raw = [rawSpecs['Процессор'], rawSpecs['RAM'] || rawSpecs['ОЗУ'], rawSpecs['Накопитель'] || rawSpecs['SSD'] || rawSpecs['Видеокарта']]
      .filter(Boolean)
      .slice(0, 3) as string[]
  } else if (cat === 'tablets') {
    raw = [rawSpecs['Экран'], rawSpecs['Память'], rawSpecs['Процессор']].filter(Boolean).slice(0, 3) as string[]
  } else if (cat === 'audio' || cat === 'tvs') {
    const entries = Object.entries(s).filter(([k]) => ![localizeSpecKey('Гарантия', locale), localizeSpecKey('Срок доставки', locale), localizeSpecKey('Наличие', locale)].includes(k))
    raw = entries
      .slice(0, 3)
      .map(([, v]) => String(v))
      .filter(Boolean)
  } else {
    const entries = Object.entries(s).filter(([k]) => ![localizeSpecKey('Гарантия', locale), localizeSpecKey('Срок доставки', locale), localizeSpecKey('Наличие', locale)].includes(k))
    raw = entries
      .slice(0, 3)
      .map(([, v]) => String(v))
      .filter(Boolean)
  }

  const normalized = raw.map(normalizeSpecLabel)
  return padSpecTagsToThree(normalized, product)
}

/** Краткая строка характеристик (легаси / подсказка) */
export function catalogSpecLine(product: Product): string | null {
  const parts = catalogSpecParts(product)
  return parts.length ? parts.join(' · ') : null
}

/** Три кратких блока для ряда иконок при наведении (как на маркетплейсах) */
export function catalogHoverChips(product: Product): { label: string; value: string }[] {
  const locale = getCurrentLocale()
  const parts = catalogSpecParts(product)
  const cat = getCategoryId(product.category)
  const labelsByCat: Record<string, string[]> = {
    laptops: ['Процессор', 'ОЗУ', 'Накопитель'],
    smartphones: ['Экран', 'Память', 'Аккумулятор'],
    tablets: ['Экран', 'Память', 'Процессор'],
    audio: ['Параметр', 'Параметр', 'Параметр'],
    tvs: ['Параметр', 'Параметр', 'Параметр'],
    'games-consoles': ['Параметр', 'Параметр', 'Параметр'],
    accessories: ['Параметр', 'Параметр', 'Параметр'],
  }
  const labels = labelsByCat[cat] ?? ['Характеристика', 'Характеристика', 'Характеристика']
  return parts.map((value, i) => ({
    label: labels[i] ? localizeSpecKey(labels[i], locale) : '—',
    value: value || '—',
  }))
}

/** Плотный текст характеристик под чипами (порядок важных полей первым) */
export function catalogHoverSpecLines(product: Product): string[] {
  const locale = getCurrentLocale()
  const s = localizeProductSpecs(product, locale)
  const hoverSkip = new Set([
    localizeSpecKey('Гарантия', locale),
    localizeSpecKey('Срок доставки', locale),
    localizeSpecKey('Наличие', locale),
  ])
  const priority = [
    localizeSpecKey('Экран', locale),
    localizeSpecKey('Процессор', locale),
    localizeSpecKey('RAM', locale),
    localizeSpecKey('ОЗУ', locale),
    localizeSpecKey('Память', locale),
    localizeSpecKey('Накопитель', locale),
    localizeSpecKey('SSD', locale),
    localizeSpecKey('Видеокарта', locale),
    localizeSpecKey('Аккумулятор', locale),
    'Bluetooth',
    locale === 'en' ? 'Wi-Fi' : 'Wi-Fi',
    'WiFi',
    'GPS',
    localizeSpecKey('Защита', locale),
  ]
  const lines: string[] = []
  const used = new Set<string>()
  for (const key of priority) {
    const v = s[key]
    if (v && !hoverSkip.has(key)) {
      lines.push(`${key}: ${v}`)
      used.add(key)
    }
  }
  for (const [k, v] of Object.entries(s)) {
    if (hoverSkip.has(k) || used.has(k)) continue
    lines.push(`${k}: ${v}`)
  }
  return lines.slice(0, 8)
}
