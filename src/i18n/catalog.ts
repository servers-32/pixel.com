import type { Product, ProductBadge, ProductSpecSection } from '../types'
import type { Locale } from './index'

export type CategoryId =
  | 'smartphones'
  | 'laptops'
  | 'audio'
  | 'accessories'
  | 'tablets'
  | 'tvs'
  | 'home-tech'
  | 'photo-video'
  | 'games-consoles'
  | 'other'

const CATEGORY_IDS: Record<string, CategoryId> = {
  Смартфоны: 'smartphones',
  Ноутбуки: 'laptops',
  Аудио: 'audio',
  Аксессуары: 'accessories',
  Планшеты: 'tablets',
  Телевизоры: 'tvs',
  'Техника для дома': 'home-tech',
  'Фото и видео': 'photo-video',
  'Игры и консоли': 'games-consoles',
}

const CATEGORY_LABELS: Record<CategoryId, Record<Locale, string>> = {
  smartphones: { ru: 'Смартфоны', uk: 'Смартфони', en: 'Smartphones' },
  laptops: { ru: 'Ноутбуки', uk: 'Ноутбуки', en: 'Laptops' },
  audio: { ru: 'Аудио', uk: 'Аудіо', en: 'Audio' },
  accessories: { ru: 'Аксессуары', uk: 'Аксесуари', en: 'Accessories' },
  tablets: { ru: 'Планшеты', uk: 'Планшети', en: 'Tablets' },
  tvs: { ru: 'Телевизоры', uk: 'Телевізори', en: 'TVs' },
  'home-tech': { ru: 'Техника для дома', uk: 'Техніка для дому', en: 'Home appliances' },
  'photo-video': { ru: 'Фото и видео', uk: 'Фото та відео', en: 'Photo and video' },
  'games-consoles': { ru: 'Игры и консоли', uk: 'Ігри та консолі', en: 'Games and consoles' },
  other: { ru: 'Прочее', uk: 'Інше', en: 'Other' },
}

const BADGE_LABELS: Record<ProductBadge, Record<Locale, string>> = {
  sale: { ru: 'Акция', uk: 'Акція', en: 'Sale' },
  new: { ru: 'Новинка', uk: 'Новинка', en: 'New' },
  hit: { ru: 'Хит', uk: 'Хіт', en: 'Best seller' },
}

const SECTION_TITLE_MAP: Record<string, Record<Locale, string>> = {
  'Общие характеристики': { ru: 'Общие характеристики', uk: 'Загальні характеристики', en: 'General specifications' },
  'Магазин и логистика': { ru: 'Магазин и логистика', uk: 'Магазин і логістика', en: 'Store and logistics' },
  Экран: { ru: 'Экран', uk: 'Екран', en: 'Display' },
  'Платформа и память': { ru: 'Платформа и память', uk: 'Платформа та памʼять', en: 'Platform and memory' },
  Камеры: { ru: 'Камеры', uk: 'Камери', en: 'Cameras' },
  'Связь и сенсоры': { ru: 'Связь и сенсоры', uk: "Зв'язок і сенсори", en: 'Connectivity and sensors' },
  Питание: { ru: 'Питание', uk: 'Живлення', en: 'Power' },
  Корпус: { ru: 'Корпус', uk: 'Корпус', en: 'Body' },
  Комплектация: { ru: 'Комплектация', uk: 'Комплектація', en: 'Box contents' },
  'Производительность и охлаждение': {
    ru: 'Производительность и охлаждение',
    uk: 'Продуктивність і охолодження',
    en: 'Performance and cooling',
  },
  'Дисплей и графика': { ru: 'Дисплей и графика', uk: 'Дисплей і графіка', en: 'Display and graphics' },
  'Порты и расширение': { ru: 'Порты и расширение', uk: 'Порти та розширення', en: 'Ports and expansion' },
  'Размеры и вес (ориентир)': { ru: 'Размеры и вес (ориентир)', uk: 'Розміри та вага (орієнтир)', en: 'Size and weight (approx.)' },
  'Дисплей и стилус': { ru: 'Дисплей и стилус', uk: 'Дисплей і стилус', en: 'Display and stylus' },
  'Память и накопитель': { ru: 'Память и накопитель', uk: "Пам'ять і накопичувач", en: 'Memory and storage' },
  Аксессуары: { ru: 'Аксессуары', uk: 'Аксесуари', en: 'Accessories' },
  'Габариты (ориентир)': { ru: 'Габариты (ориентир)', uk: 'Габарити (орієнтир)', en: 'Dimensions (approx.)' },
  'Звук и кодеки': { ru: 'Звук и кодеки', uk: 'Звук і кодеки', en: 'Sound and codecs' },
  'Микрофоны и звонки': { ru: 'Микрофоны и звонки', uk: 'Мікрофони та дзвінки', en: 'Microphones and calls' },
  'Комплектация и срок службы': {
    ru: 'Комплектация и срок службы',
    uk: 'Комплектація та строк служби',
    en: 'Contents and service life',
  },
  Эксплуатация: { ru: 'Эксплуатация', uk: 'Експлуатація', en: 'Usage' },
  Совместимость: { ru: 'Совместимость', uk: 'Сумісність', en: 'Compatibility' },
  'Ресурс и износ': { ru: 'Ресурс и износ', uk: 'Ресурс і знос', en: 'Service life and wear' },
  'Упаковка и хранение': { ru: 'Упаковка и хранение', uk: 'Упаковка та зберігання', en: 'Packaging and storage' },
  'Размеры (ориентир)': { ru: 'Размеры (ориентир)', uk: 'Розміри (орієнтир)', en: 'Dimensions (approx.)' },
}

const SPEC_KEY_MAP: Record<string, Record<Locale, string>> = {
  Наличие: { ru: 'Наличие', uk: 'Наявність', en: 'Availability' },
  'Срок доставки': { ru: 'Срок доставки', uk: 'Термін доставки', en: 'Delivery time' },
  Гарантия: { ru: 'Гарантия', uk: 'Гарантія', en: 'Warranty' },
  Экран: { ru: 'Экран', uk: 'Екран', en: 'Display' },
  Форм: { ru: 'Форм-фактор', uk: 'Форм-фактор', en: 'Form factor' },
  Память: { ru: 'Память', uk: "Пам'ять", en: 'Memory' },
  Аккумулятор: { ru: 'Аккумулятор', uk: 'Акумулятор', en: 'Battery' },
  Процессор: { ru: 'Процессор', uk: 'Процесор', en: 'Processor' },
  Накопитель: { ru: 'Накопитель', uk: 'Накопичувач', en: 'Storage' },
  SSD: { ru: 'SSD', uk: 'SSD', en: 'SSD' },
  RAM: { ru: 'RAM', uk: 'RAM', en: 'RAM' },
  ОЗУ: { ru: 'ОЗУ', uk: 'ОЗП', en: 'RAM' },
  Видеокарта: { ru: 'Видеокарта', uk: 'Відеокарта', en: 'Graphics card' },
  Bluetooth: { ru: 'Bluetooth', uk: 'Bluetooth', en: 'Bluetooth' },
  GPS: { ru: 'GPS', uk: 'GPS', en: 'GPS' },
  NFC: { ru: 'NFC', uk: 'NFC', en: 'NFC' },
  'Быстрая зарядка': { ru: 'Быстрая зарядка', uk: 'Швидке заряджання', en: 'Fast charging' },
  Защита: { ru: 'Защита', uk: 'Захист', en: 'Protection' },
  'Влагозащита': { ru: 'Влагозащита', uk: 'Вологозахист', en: 'Water resistance' },
  Подсветка: { ru: 'Подсветка', uk: 'Підсвічування', en: 'Backlight' },
  'Тип переключателей': { ru: 'Тип переключателей', uk: 'Тип перемикачів', en: 'Switch type' },
  Цена: { ru: 'Цена', uk: 'Ціна', en: 'Price' },
  Артикул: { ru: 'Артикул', uk: 'Артикул', en: 'SKU' },
  Бренд: { ru: 'Бренд', uk: 'Бренд', en: 'Brand' },
  Категория: { ru: 'Категория', uk: 'Категорія', en: 'Category' },
  Состояние: { ru: 'Состояние', uk: 'Стан', en: 'Condition' },
  Цвет: { ru: 'Цвет', uk: 'Колір', en: 'Color' },
}

const VALUE_EXACT_MAP: Record<string, Record<Locale, string>> = {
  'На складе': { ru: 'На складе', uk: 'На складі', en: 'In stock' },
  Да: { ru: 'Да', uk: 'Так', en: 'Yes' },
  Нет: { ru: 'Нет', uk: 'Ні', en: 'No' },
  Новый: { ru: 'Новый', uk: 'Новий', en: 'New' },
  Ожидается: { ru: 'Ожидается', uk: 'Очікується', en: 'Expected' },
}

const VALUE_REPLACEMENTS: { from: RegExp; to: Record<Locale, string> }[] = [
  { from: /\bСмартфон\b/g, to: { ru: 'Смартфон', uk: 'Смартфон', en: 'Smartphone' } },
  { from: /\bНоутбук\b/g, to: { ru: 'Ноутбук', uk: 'Ноутбук', en: 'Laptop' } },
  { from: /\bНаушники\b/g, to: { ru: 'Наушники', uk: 'Навушники', en: 'Headphones' } },
  { from: /\bКолонка\b/g, to: { ru: 'Колонка', uk: 'Колонка', en: 'Speaker' } },
  { from: /\bПланшет\b/g, to: { ru: 'Планшет', uk: 'Планшет', en: 'Tablet' } },
  { from: /\bТелевизор\b/g, to: { ru: 'Телевизор', uk: 'Телевізор', en: 'TV' } },
  { from: /\bУмные часы\b/g, to: { ru: 'Умные часы', uk: 'Розумний годинник', en: 'Smart watch' } },
  { from: /\bКлавиатура механическая\b/g, to: { ru: 'Клавиатура механическая', uk: 'Клавіатура механічна', en: 'Mechanical keyboard' } },
  { from: /\bМонитор\b/g, to: { ru: 'Монитор', uk: 'Монітор', en: 'Monitor' } },
  { from: /\bПылесос\b/g, to: { ru: 'Пылесос', uk: 'Пилосос', en: 'Vacuum cleaner' } },
  { from: /\bКамера\b/g, to: { ru: 'Камера', uk: 'Камера', en: 'Camera' } },
  { from: /\bЭкшн-камера\b/g, to: { ru: 'Экшн-камера', uk: 'Екшн-камера', en: 'Action camera' } },
  { from: /\bИгровая консоль\b/g, to: { ru: 'Игровая консоль', uk: 'Ігрова консоль', en: 'Game console' } },
  { from: /\bИгровой ноутбук\b/g, to: { ru: 'Игровой ноутбук', uk: 'Ігровий ноутбук', en: 'Gaming laptop' } },
  { from: /\bРобот-пылесос\b/g, to: { ru: 'Робот-пылесос', uk: 'Робот-пилосос', en: 'Robot vacuum' } },
  { from: /\bПортативная акустика\b/g, to: { ru: 'Портативная акустика', uk: 'Портативна акустика', en: 'Portable speaker' } },
  { from: /\bФотоаппарат\b/g, to: { ru: 'Фотоаппарат', uk: 'Фотоапарат', en: 'Camera' } },
]

function replaceName(value: string, locale: Locale): string {
  let next = value
  for (const rule of VALUE_REPLACEMENTS) {
    next = next.replace(rule.from, rule.to[locale])
  }
  if (locale === 'uk') return next.replace(/ГБ/g, 'ГБ')
  return next
}

function translateValue(raw: string, locale: Locale): string {
  if (locale === 'ru') return raw
  const exact = VALUE_EXACT_MAP[raw]
  if (exact) return exact[locale]
  return raw
    .replace(/На складе/g, locale === 'uk' ? 'На складі' : 'In stock')
    .replace(/Да/g, locale === 'uk' ? 'Так' : 'Yes')
    .replace(/Нет/g, locale === 'uk' ? 'Ні' : 'No')
    .replace(/Новый/g, locale === 'uk' ? 'Новий' : 'New')
    .replace(/Ожидается/g, locale === 'uk' ? 'Очікується' : 'Expected')
    .replace(/Уточняйте/g, locale === 'uk' ? 'Уточнюйте' : 'Please уточняйте')
}

export function getCategoryId(category: string): CategoryId {
  return CATEGORY_IDS[category] ?? 'other'
}

export function localizeCategory(category: string, locale: Locale): string {
  return CATEGORY_LABELS[getCategoryId(category)][locale]
}

export function localizeBadge(badge: ProductBadge, locale: Locale): string {
  return BADGE_LABELS[badge][locale]
}

export function localizeSpecKey(key: string, locale: Locale): string {
  return SPEC_KEY_MAP[key]?.[locale] ?? key
}

export function localizeProductName(product: Product, locale: Locale): string {
  if (locale === 'ru') return product.name
  return replaceName(product.name, locale)
}

export function localizeProductSpecs(product: Product, locale: Locale): Record<string, string> {
  return Object.fromEntries(
    Object.entries(product.specs).map(([key, value]) => [localizeSpecKey(key, locale), translateValue(value, locale)]),
  )
}

function firstSpec(product: Product, keys: string[]): string | null {
  for (const key of keys) {
    if (product.specs[key]) return product.specs[key]
  }
  return null
}

export function localizeProductDescription(product: Product, locale: Locale): string {
  if (locale === 'ru') return product.description
  const name = localizeProductName(product, locale)
  const brand = product.brand
  const category = localizeCategory(product.category, locale)
  const screen = firstSpec(product, ['Экран'])
  const memory = firstSpec(product, ['Память', 'Накопитель', 'SSD'])
  const battery = firstSpec(product, ['Аккумулятор'])
  const processor = firstSpec(product, ['Процессор'])
  const topFeature = screen ?? memory ?? battery ?? processor ?? ''

  if (locale === 'uk') {
    return `${name} від ${brand} у категорії «${category}» створений для щоденного використання та стабільної роботи. Ключова характеристика моделі: ${topFeature || 'актуальна конфігурація для свого класу'}. Перед покупкою рекомендуємо уточнити комплектацію та ревізію партії.`
  }
  return `${name} by ${brand} in the “${category}” category is built for everyday use and stable performance. A key highlight of this model is ${topFeature || 'a well-balanced configuration for its class'}. Please confirm the exact package contents and revision before purchase.`
}

export function localizeLongDescription(product: Product, locale: Locale): string {
  if (locale === 'ru') return product.longDescription ?? product.description
  const name = localizeProductName(product, locale)
  const category = localizeCategory(product.category, locale)
  const warranty = firstSpec(product, ['Гарантия'])
  const delivery = firstSpec(product, ['Срок доставки'])
  const stock = product.inStock
  const warrantyLabel = locale === 'uk' ? 'Гарантія' : 'Warranty'
  const deliveryLabel = locale === 'uk' ? 'Доставка' : 'Delivery'
  const stockLabel = locale === 'uk' ? 'Наявність' : 'Availability'
  const stockValue = locale === 'uk' ? (stock ? 'У наявності' : 'Очікується') : stock ? 'In stock' : 'Expected'
  const intro =
    locale === 'uk'
      ? `${name} — модель у категорії «${category}», розрахована на повсякденні сценарії, мультимедіа та стабільну роботу протягом дня. Характеристики на сторінці мають інформаційний характер, тому перед оплатою радимо уточнити серію, ревізію та комплектацію.`
      : `${name} is a model in the “${category}” category built for everyday tasks, multimedia, and dependable day-to-day use. Specifications on this page are informational, so please confirm the exact revision, series, and package contents before payment.`
  const usage =
    locale === 'uk'
      ? 'Використовуйте сертифіковані аксесуари, уникайте перегріву та механічних ударів, а для транспортування обирайте чохол або фірмову упаковку. Це допоможе зберегти зовнішній вигляд і продовжити строк служби пристрою.'
      : 'Use certified accessories, avoid overheating and mechanical shocks, and carry the device in a case or original package whenever possible. This helps preserve the look of the device and extend its service life.'
  const service =
    locale === 'uk'
      ? `${warrantyLabel}: ${translateValue(warranty ?? 'Уточнюйте', locale)}. ${deliveryLabel}: ${translateValue(delivery ?? 'Уточнюйте', locale)}. ${stockLabel}: ${stockValue}.`
      : `${warrantyLabel}: ${translateValue(warranty ?? 'Please уточняйте', locale)}. ${deliveryLabel}: ${translateValue(delivery ?? 'Please уточняйте', locale)}. ${stockLabel}: ${stockValue}.`

  return `## ${locale === 'uk' ? 'Для кого ця модель' : 'Who this model is for'}\n\n${intro}\n\n## ${locale === 'uk' ? 'Експлуатація та догляд' : 'Use and care'}\n\n${usage}\n\n## ${locale === 'uk' ? 'Магазин і підтримка' : 'Store and support'}\n\n${service}`
}

export function localizeSpecSections(product: Product, locale: Locale): ProductSpecSection[] {
  const sections = product.specSections ?? []
  return sections.map((section) => ({
    title: SECTION_TITLE_MAP[section.title]?.[locale] ?? section.title,
    rows: section.rows.map((row) => ({
      key: localizeSpecKey(row.key, locale),
      value: translateValue(row.value, locale),
    })),
  }))
}

export function getLocalizedProductView(product: Product, locale: Locale) {
  return {
    ...product,
    name: localizeProductName(product, locale),
    categoryLabel: localizeCategory(product.category, locale),
    description: localizeProductDescription(product, locale),
    longDescription: localizeLongDescription(product, locale),
    specs: localizeProductSpecs(product, locale),
    specSections: localizeSpecSections(product, locale),
  }
}

export function getProductSearchText(product: Product, locale: Locale): string {
  const view = getLocalizedProductView(product, locale)
  const specsText = Object.values(view.specs).join(' ')
  return `${view.name} ${product.brand} ${product.sku} ${view.description} ${view.categoryLabel} ${specsText}`.toLowerCase()
}
