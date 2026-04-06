import { useEffect, useState } from 'react'
import { CatalogFilterFields } from './CatalogFilterFields'
import { ProductCard } from './ProductCard'
import { Breadcrumbs } from './Breadcrumbs'
import styles from './ProductList.module.css'
import { useShop } from '../context/useShop'
import type { SortOption } from '../types'
import { useI18n } from '../i18n'

export function ProductList() {
  const { locale, t } = useI18n()
  const {
    products,
    filteredProducts,
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
    sortBy,
    setSortBy,
    resetFilters,
    appliedSearchQuery,
    filterSignature,
  } = useShop()

  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    if (!filtersOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFiltersOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [filtersOpen])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 841px)')
    const close = () => {
      if (mq.matches) setFiltersOpen(false)
    }
    mq.addEventListener('change', close)
    close()
    return () => mq.removeEventListener('change', close)
  }, [])

  const filterProps = {
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
  }

  const copy =
    locale === 'en'
      ? {
          title: 'Product catalog',
          sub: `The catalog contains ${products.length} items: smartphones, laptops, audio, and accessories. Filter by price and rating with delivery across Ukraine. Prices are shown in UAH including VAT.`,
          filtersAria: 'Catalog filters',
          closeFilters: 'Close filters',
          filterDialog: 'Product filters',
          fit: 'Selection',
          filterButton: 'Filters and selection',
          sort: 'Sorting',
          sortAria: 'Product sorting',
          popularity: 'By popularity',
          rating: 'By rating',
          priceAsc: 'Price: low to high',
          priceDesc: 'Price: high to low',
          catalog: 'Catalog',
        }
      : locale === 'uk'
        ? {
            title: 'Каталог товарів',
            sub: `У каталозі ${products.length} позицій: смартфони, ноутбуки, аудіо та аксесуари. Фільтри за ціною й рейтингом, доставка по Україні. Ціни в гривнях з урахуванням ПДВ.`,
            filtersAria: 'Фільтри каталогу',
            closeFilters: 'Закрити фільтри',
            filterDialog: 'Підбір товарів',
            fit: 'Підбір',
            filterButton: 'Фільтри та підбір',
            sort: 'Сортування',
            sortAria: 'Сортування товарів',
            popularity: 'За популярністю',
            rating: 'За рейтингом',
            priceAsc: 'Ціна: за зростанням',
            priceDesc: 'Ціна: за спаданням',
            catalog: 'Каталог',
          }
        : {
            title: 'Каталог товаров',
            sub: `В каталоге ${products.length} позиций: смартфоны, ноутбуки, аудио и аксессуары. Фильтры по цене и рейтингу, доставка по Украине. Цены в гривнах с учётом ПДВ.`,
            filtersAria: 'Фильтры каталога',
            closeFilters: 'Закрыть фильтры',
            filterDialog: 'Подбор товаров',
            fit: 'Подбор',
            filterButton: 'Фильтры и подбор',
            sort: 'Сортировка',
            sortAria: 'Сортировка товаров',
            popularity: 'По популярности',
            rating: 'По рейтингу',
            priceAsc: 'Цена: по возрастанию',
            priceDesc: 'Цена: по убыванию',
            catalog: 'Каталог',
          }

  return (
    <div className={styles.page}>
      <div className={styles.breadWrap}>
        <Breadcrumbs items={[{ label: t('common.home'), to: '/' }, { label: copy.catalog }]} />
      </div>
      <header className={styles.catalogHead}>
        <h1 className={`${styles.catalogTitle} heading-display`}>{copy.title}</h1>
        <p className={styles.catalogSub}>{copy.sub}</p>
      </header>
      <div className={styles.layout}>
        <aside className={styles.filtersDesktop} aria-label={copy.filtersAria}>
          <CatalogFilterFields idPrefix="cat-d" {...filterProps} />
        </aside>

        {filtersOpen ? (
          <button
            type="button"
            className={styles.filterBackdrop}
            aria-label={copy.closeFilters}
            onClick={() => setFiltersOpen(false)}
          />
        ) : null}

        <div
          className={`${styles.filterSheet} ${filtersOpen ? styles.filterSheetOpen : ''}`}
          role="dialog"
          aria-modal={filtersOpen}
          aria-label={copy.filterDialog}
          aria-hidden={!filtersOpen}
          inert={filtersOpen ? undefined : true}
        >
          <div className={styles.filterSheetHead}>
            <h2 className={styles.filterSheetTitle}>{copy.fit}</h2>
            <button type="button" className={styles.filterSheetClose} onClick={() => setFiltersOpen(false)}>
              {t('common.done')}
            </button>
          </div>
          <div className={styles.filterSheetBody}>
            <CatalogFilterFields idPrefix="cat-m" showTitle={false} {...filterProps} />
          </div>
        </div>

        <div className={styles.main}>
          <div className={styles.mobileFilterBar}>
            <button type="button" className={styles.mobileFilterBtn} onClick={() => setFiltersOpen(true)}>
              {copy.filterButton}
            </button>
          </div>

          <div className={styles.toolbar}>
            <label>
              {copy.sort}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label={copy.sortAria}
              >
                <option value="popularity">{copy.popularity}</option>
                <option value="rating">{copy.rating}</option>
                <option value="price-asc">{copy.priceAsc}</option>
                <option value="price-desc">{copy.priceDesc}</option>
              </select>
            </label>
            <span className={styles.count}>
              {t('common.shownResults', {
                shown: filteredProducts.length,
                total: products.length,
                suffix: appliedSearchQuery.trim() ? t('common.searchSuffix') : '',
              })}
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon" aria-hidden>
                ∅
              </span>
              <p className="empty-state-title">{t('common.noResultsTitle')}</p>
              <p className="empty-state-text">{t('common.noResultsText')}</p>
              <div className="empty-state-actions">
                <button type="button" className="empty-state-btn-ghost" onClick={resetFilters}>
                  {t('common.resetFilters')}
                </button>
              </div>
            </div>
          ) : (
            <div key={filterSignature} className={styles.grid}>
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
