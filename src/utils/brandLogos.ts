/**
 * Логотипы через Simple Icons CDN (SVG, официальные цвета брендов).
 * Локальные SVG в `public/brands/` — для «своих» брендов и запасной витрины.
 * Для брендов без записи — компонент покажет монограмму.
 */
const BRAND_LOCAL: Record<string, string> = {
  TechLine: '/brands/techline.svg',
  Vortex: '/brands/vortex.svg',
  SonicWave: '/brands/sonicwave.svg',
  WearMax: '/brands/wearmax.svg',
  Slate: '/brands/slate.svg',
  NeoGear: '/brands/neogear.svg',
  /** В Simple Icons нет или CDN стабильно отдаёт 404 — свои SVG */
  Canon: '/brands/canon.svg',
  Dyson: '/brands/dyson.svg',
  GoPro: '/brands/gopro.svg',
}

/** Запасной хостинг SVG Simple Icons (если cdn.simpleicons.org не отдаёт файл) */
const SI_JSDELIVR = 'https://cdn.jsdelivr.net/npm/simple-icons@11.0.0/icons'

const SIMPLE_ICONS: Record<string, string> = {
  Apple: 'apple',
  Samsung: 'samsung',
  Sony: 'sony',
  Dyson: 'dyson',
  LG: 'lg',
  Xiaomi: 'xiaomi',
  Nintendo: 'nintendo',
  ASUS: 'asus',
  Dell: 'dell',
  Bose: 'bose',
  Microsoft: 'microsoft',
  Lenovo: 'lenovo',
  Huawei: 'huawei',
  Intel: 'intel',
  AMD: 'amd',
  NVIDIA: 'nvidia',
  OnePlus: 'oneplus',
  JBL: 'jbl',
  HP: 'hp',
  Acer: 'acer',
  MSI: 'msi',
  Razer: 'razer',
  Logitech: 'logitech',
  Anker: 'anker',
  Nothing: 'nothing',
  Marshall: 'marshall',
}

/** Две буквы монограммы для «своих» брендов */
export function getBrandMonogram(brand: string): string {
  const letters = brand.match(/[A-Z]/g)
  if (letters && letters.length >= 2) {
    return (letters[0] + letters[1]).toUpperCase()
  }
  return brand.slice(0, 2).toUpperCase()
}

export function getBrandSimpleIconSlug(brand: string): string | null {
  return SIMPLE_ICONS[brand] ?? null
}

/**
 * Несколько URL: сначала Simple Icons CDN, при ошибке загрузки — тот же slug с jsDelivr (там часть иконок есть,
 * когда основной CDN отдаёт 404).
 */
export function getBrandLogoUrls(brand: string): string[] {
  const local = BRAND_LOCAL[brand]
  if (local) return [local]

  const slug = getBrandSimpleIconSlug(brand)
  if (!slug) return []

  const s = slug.toLowerCase()
  return [`https://cdn.simpleicons.org/${s}`, `${SI_JSDELIVR}/${s}.svg`]
}

export function getBrandLogoSrc(brand: string): string | null {
  const urls = getBrandLogoUrls(brand)
  return urls[0] ?? null
}

export function isBrandLocalAsset(src: string | null): boolean {
  return Boolean(src?.startsWith('/brands/'))
}
