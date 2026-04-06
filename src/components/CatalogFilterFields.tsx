import styles from './ProductList.module.css'
import { useI18n } from '../i18n'
import { localizeCategory } from '../i18n/catalog'

type Props = {
  idPrefix: string
  /** Для мобильного листа заголовок выносится в шапку панели */
  showTitle?: boolean
  categories: string[]
  brands: string[]
  categoryDraft: string
  setCategoryDraft: (v: string) => void
  brandDraft: string
  setBrandDraft: (v: string) => void
  minPriceDraftStr: string
  setMinPriceDraftStr: (v: string) => void
  maxPriceDraftStr: string
  setMaxPriceDraftStr: (v: string) => void
  draftSliderMin: number
  setDraftSliderMin: (v: number) => void
  draftSliderMax: number
  setDraftSliderMax: (v: number) => void
  priceBounds: { min: number; max: number }
  minRatingDraft: number
  setMinRatingDraft: (v: number) => void
  applyCatalogFilters: (opts?: { searchOverride?: string }) => void
  resetFilters: () => void
}

export function CatalogFilterFields({
  idPrefix,
  showTitle = true,
  categories,
  brands,
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
  priceBounds,
  minRatingDraft,
  setMinRatingDraft,
  applyCatalogFilters,
  resetFilters,
}: Props) {
  const { locale } = useI18n()
  const p = (s: string) => `${idPrefix}-${s}`

  const priceMetaInactive =
    minPriceDraftStr === '' &&
    maxPriceDraftStr === '' &&
    draftSliderMin <= priceBounds.min &&
    draftSliderMax >= priceBounds.max

  const displayMin = priceMetaInactive ? '0' : draftSliderMin.toLocaleString(locale === 'en' ? 'en-US' : locale === 'ru' ? 'ru-UA' : 'uk-UA')
  const displayMax = priceMetaInactive ? '0' : draftSliderMax.toLocaleString(locale === 'en' ? 'en-US' : locale === 'ru' ? 'ru-UA' : 'uk-UA')
  const t =
    locale === 'en'
      ? {
          title: 'Filters',
          category: 'Category',
          allCategories: 'All categories',
          brand: 'Brand',
          allBrands: 'All brands',
          price: 'Price, UAH',
          minPrice: 'Minimum price',
          maxPrice: 'Maximum price',
          from: 'from',
          to: 'to',
          lowerBound: 'Lower price limit',
          upperBound: 'Upper price limit',
          minRating: 'Min. rating',
          any: 'Any',
          search: 'Apply',
          reset: 'Reset filters',
        }
      : locale === 'uk'
        ? {
            title: 'Підбір',
            category: 'Категорія',
            allCategories: 'Усі категорії',
            brand: 'Бренд',
            allBrands: 'Усі бренди',
            price: 'Ціна, грн',
            minPrice: 'Мінімальна ціна',
            maxPrice: 'Максимальна ціна',
            from: 'від',
            to: 'до',
            lowerBound: 'Нижня межа ціни',
            upperBound: 'Верхня межа ціни',
            minRating: 'Мін. рейтинг',
            any: 'Будь-який',
            search: 'Пошук',
            reset: 'Скинути фільтри',
          }
        : {
            title: 'Подбор',
            category: 'Категория',
            allCategories: 'Все категории',
            brand: 'Бренд',
            allBrands: 'Все бренды',
            price: 'Цена, грн',
            minPrice: 'Минимальная цена',
            maxPrice: 'Максимальная цена',
            from: 'от',
            to: 'до',
            lowerBound: 'Нижняя граница цены',
            upperBound: 'Верхняя граница цены',
            minRating: 'Мин. рейтинг',
            any: 'Любой',
            search: 'Поиск',
            reset: 'Сбросить фильтры',
          }

  return (
    <>
      {showTitle ? <h2 className={styles.filtersTitle}>{t.title}</h2> : null}

      <div className={styles.field}>
        <label htmlFor={p('filter-cat')}>{t.category}</label>
        <select id={p('filter-cat')} value={categoryDraft} onChange={(e) => setCategoryDraft(e.target.value)}>
          <option value="all">{t.allCategories}</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {localizeCategory(c, locale)}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor={p('filter-brand')}>{t.brand}</label>
        <select id={p('filter-brand')} value={brandDraft} onChange={(e) => setBrandDraft(e.target.value)}>
          <option value="all">{t.allBrands}</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label>{t.price}</label>
        <div className={styles.priceRow}>
          <input
            type="text"
            inputMode="decimal"
            className={`${styles.priceInput} ${minPriceDraftStr === '' ? styles.priceInputGhost : ''}`}
            value={minPriceDraftStr}
            onChange={(e) => setMinPriceDraftStr(e.target.value)}
            placeholder="0"
            aria-label={t.minPrice}
            autoComplete="off"
          />
          <input
            type="text"
            inputMode="decimal"
            className={`${styles.priceInput} ${maxPriceDraftStr === '' ? styles.priceInputGhost : ''}`}
            value={maxPriceDraftStr}
            onChange={(e) => setMaxPriceDraftStr(e.target.value)}
            placeholder="0"
            aria-label={t.maxPrice}
            autoComplete="off"
          />
        </div>
        <div className={styles.priceSliderBlock}>
          <div className={styles.priceSliderMeta}>
            <span className={priceMetaInactive ? styles.priceSliderMetaInactive : undefined}>
              {t.from} {displayMin}
            </span>
            <span className={priceMetaInactive ? styles.priceSliderMetaInactive : undefined}>
              {t.to} {displayMax}
            </span>
          </div>
          <div className={styles.priceSliderTracks}>
            <label className={styles.priceSliderLabel}>
              <span className="visually-hidden">{t.lowerBound}</span>
              <input
                type="range"
                className={styles.priceRange}
                min={priceBounds.min}
                max={priceBounds.max}
                value={draftSliderMin}
                onChange={(e) => {
                  const v = Number(e.target.value)
                  const nextMin = Math.min(v, draftSliderMax)
                  setDraftSliderMin(nextMin)
                  setMinPriceDraftStr(String(nextMin))
                }}
              />
            </label>
            <label className={styles.priceSliderLabel}>
              <span className="visually-hidden">{t.upperBound}</span>
              <input
                type="range"
                className={styles.priceRange}
                min={priceBounds.min}
                max={priceBounds.max}
                value={draftSliderMax}
                onChange={(e) => {
                  const v = Number(e.target.value)
                  const nextMax = Math.max(v, draftSliderMin)
                  setDraftSliderMax(nextMax)
                  setMaxPriceDraftStr(String(nextMax))
                }}
              />
            </label>
          </div>
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor={p('filter-rating')}>{t.minRating}</label>
        <select
          id={p('filter-rating')}
          value={minRatingDraft}
          onChange={(e) => setMinRatingDraft(Number(e.target.value))}
        >
          <option value={0}>{t.any}</option>
          <option value={3}>от 3.0</option>
          <option value={4}>от 4.0</option>
          <option value={4.5}>от 4.5</option>
        </select>
      </div>

      <button type="button" className={styles.searchApply} onClick={() => applyCatalogFilters()}>
        {t.search}
      </button>

      <button type="button" className={styles.reset} onClick={resetFilters}>
        {t.reset}
      </button>
    </>
  )
}
