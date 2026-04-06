import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Breadcrumbs } from './Breadcrumbs'
import { InstallmentModal } from './InstallmentModal'
import { ProductCard } from './ProductCard'
import { SafeImage } from './SafeImage'
import styles from './ProductDetails.module.css'
import { StarRating } from './StarRating'
import { StoreTrustBlock } from './StoreTrustBlock'
import { TrustMicroStrip } from './TrustMicroStrip'
import { parseDescriptionSections } from '../data/productDetailEnrich'
import { averageReviewRating, getReviewsForProduct, reviewStarHistogram } from '../data/productReviews'
import { PixelWordmark } from './PixelWordmark'
import { getDefaultDocumentTitle } from '../constants/site'
import { useShop } from '../context/useShop'
import { formatMoney } from '../utils/formatMoney'
import { getAppLocale } from '../utils/locale'
import { productImages } from '../utils/productImages'
import { useI18n } from '../i18n'
import { getLocalizedProductView, localizeBadge } from '../i18n/catalog'

function formatReviewDate(iso: string) {
  return new Intl.DateTimeFormat(getAppLocale(), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso))
}

function specHighlights(specs: Record<string, string>): string[] {
  const skip = new Set(['Наличие'])
  return Object.entries(specs)
    .filter(([k]) => !skip.has(k))
    .slice(0, 6)
    .map(([k, v]) => `${k}: ${v}`)
}

function IconCartBuy() {
  return (
    <svg className={styles.cartIco} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6h15l-1.5 9h-12L4 4H1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="20" r="1" fill="currentColor" />
      <circle cx="18" cy="20" r="1" fill="currentColor" />
    </svg>
  )
}

type DetailTab = 'about' | 'specs' | 'reviews'

function ProductGallery({ images }: { images: string[] }) {
  const [imgIdx, setImgIdx] = useState(0)
  const thumbsRef = useRef<HTMLDivElement>(null)
  const mainPhotoSrc = images[imgIdx] ?? ''
  const hasMany = images.length > 1

  const scrollThumbs = (dir: -1 | 1) => {
    thumbsRef.current?.scrollBy({ top: dir * 72, behavior: 'smooth' })
  }

  const goImg = (delta: number) => {
    if (images.length === 0) return
    setImgIdx((i) => (i + delta + images.length) % images.length)
  }

  return (
    <div className={styles.gallery}>
      <div className={styles.galleryMainRow}>
      <div className={styles.thumbColumn}>
        <button
          type="button"
          className={styles.thumbNav}
          aria-label="Предыдущие миниатюры"
          onClick={() => scrollThumbs(-1)}
          disabled={images.length < 2}
        >
          ↑
        </button>
        <div
          ref={thumbsRef}
          className={styles.thumbsScroll}
          role="tablist"
          aria-label="Фотографии товара"
        >
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              role="tab"
              aria-selected={i === imgIdx}
              className={i === imgIdx ? styles.thumbActive : styles.thumb}
              onClick={() => setImgIdx(i)}
            >
              <SafeImage src={src} alt="" layout="thumb" />
            </button>
          ))}
        </div>
        <button
          type="button"
          className={styles.thumbNav}
          aria-label="Следующие миниатюры"
          onClick={() => scrollThumbs(1)}
          disabled={images.length < 2}
        >
          ↓
        </button>
      </div>

      <div className={styles.mainStage}>
        <div className={styles.mainPhoto}>
          {mainPhotoSrc ? (
            <SafeImage src={mainPhotoSrc} alt="" loading="eager" decoding="async" layout="detail" />
          ) : null}
        </div>
        {hasMany ? (
          <>
            <button
              type="button"
              className={`${styles.mainNav} ${styles.mainNavPrev}`}
              aria-label="Предыдущее фото"
              onClick={() => goImg(-1)}
            >
              ‹
            </button>
            <button
              type="button"
              className={`${styles.mainNav} ${styles.mainNavNext}`}
              aria-label="Следующее фото"
              onClick={() => goImg(1)}
            >
              ›
            </button>
          </>
        ) : null}
      </div>
      </div>
    </div>
  )
}

export function ProductDetails() {
  const { locale, t } = useI18n()
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const {
    products,
    getProduct,
    addToCart,
    setCategoryFilter,
    setBrandFilter,
    cartBusy,
    openCartDrawer,
    recordProductView,
    toggleFavorite,
    isFavorite,
    toggleCompare,
    isInCompare,
  } = useShop()
  const product = productId ? getProduct(productId) : undefined
  const view = useMemo(() => (product ? getLocalizedProductView(product, locale) : null), [product, locale])
  const images = useMemo(() => (product ? productImages(product) : []), [product])
  const [tab, setTab] = useState<DetailTab>('about')
  const [qty, setQty] = useState(1)
  const [instOpen, setInstOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const similarRef = useRef<HTMLDivElement>(null)

  const reviews = useMemo(
    () => (product ? getReviewsForProduct(product.id, product.rating, locale) : []),
    [product, locale],
  )
  const hist = useMemo(() => reviewStarHistogram(reviews), [reviews])
  const reviewsAvg = useMemo(() => averageReviewRating(reviews), [reviews])
  const histMax = useMemo(() => Math.max(1, ...Object.values(hist)), [hist])

  useEffect(() => {
    if (!product) return
    recordProductView(product.id)
  }, [product, recordProductView])

  useEffect(() => {
    if (!product) return
    const origin = window.location.origin
    const imgs = images.map((u) => (u.startsWith('http') ? u : `${origin}${u.startsWith('/') ? u : `/${u}`}`))
    const el = document.createElement('script')
    el.type = 'application/ld+json'
    el.setAttribute('data-pdp-ld', product.id)
    el.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: view?.name ?? product.name,
      image: imgs,
      sku: product.sku,
      brand: { '@type': 'Brand', name: product.brand },
      offers: {
        '@type': 'Offer',
        url: `${origin}${window.location.pathname}`,
        priceCurrency: 'UAH',
        price: String(product.price),
        availability: product.inStock
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      },
    })
    document.head.appendChild(el)
    return () => {
      document.head.querySelector(`script[data-pdp-ld="${product.id}"]`)?.remove()
    }
  }, [product, images, view])

  const similar = useMemo(() => {
    if (!product) return []
    return products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 16)
  }, [products, product])

  useEffect(() => {
    if (!productId) return
    if (!product) {
      document.title = t('seo.productMissing')
      return () => {
        document.title = getDefaultDocumentTitle()
      }
    }
    document.title = t('seo.productTitle', { name: view?.name ?? product.name })
    return () => {
      document.title = getDefaultDocumentTitle()
    }
  }, [productId, product, t, view])

  if (!product) {
    return (
      <div className={styles.wrap}>
        <div className={styles.notFound}>
          <h1 className={`${styles.nfTitle} heading-display`}>
            {locale === 'en' ? 'Product not found' : locale === 'uk' ? 'Товар не знайдено' : 'Товар не найден'}
          </h1>
          <p className={styles.nfText}>
            {locale === 'en'
              ? 'Check the link or return to the catalog.'
              : locale === 'uk'
                ? 'Перевірте посилання або поверніться в каталог.'
                : 'Проверьте ссылку или вернитесь в каталог.'}
          </p>
          <Link to="/catalog" className={styles.nfBtn} viewTransition>
            {t('common.catalog')}
          </Link>
        </div>
      </div>
    )
  }

  const display = view ?? getLocalizedProductView(product, locale)
  const descBlocks = parseDescriptionSections(display.longDescription ?? '')
  const fav = isFavorite(product.id)
  const compared = isInCompare(product.id)

  const colorFromSpecs =
    product.specs['Цвет'] ?? product.specs['Колір'] ?? product.specs['Color'] ?? ''
  const storageFromSpecs =
    product.specs['Память'] ??
    product.specs['Накопитель'] ??
    product.specs['SSD'] ??
    product.specs['Объём накопителя'] ??
    ''

  const highlights = specHighlights(display.specs)
  const saveUah =
    product.listPrice != null && product.listPrice > product.price ? product.listPrice - product.price : 0
  const discountPct =
    product.listPrice != null && product.listPrice > 0
      ? Math.round((1 - product.price / product.listPrice) * 100)
      : 0

  function scrollToPanel() {
    window.setTimeout(() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
  }

  function selectTab(next: DetailTab) {
    setTab(next)
    scrollToPanel()
  }

  function goReviewsFromRating() {
    setTab('reviews')
    scrollToPanel()
  }

  function scrollSimilar(dir: -1 | 1) {
    const el = similarRef.current
    if (!el) return
    const delta = Math.min(340, Math.max(280, el.clientWidth * 0.75))
    el.scrollBy({ left: dir * delta, behavior: 'smooth' })
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.topMeta}>
        <Breadcrumbs
          items={[
            { label: t('common.home'), to: '/' },
            { label: t('common.catalog'), to: '/catalog' },
            {
              label: display.categoryLabel,
              to: '/catalog',
              onClick: () => setCategoryFilter(product.category),
            },
            { label: display.name },
          ]}
        />

        <button type="button" className={styles.back} onClick={() => navigate(-1)}>
          ← {t('common.back')}
        </button>

        <header className={styles.pdpHead}>
          <h1 className={`${styles.pageTitle} heading-display`}>{display.name}</h1>
          <div className={styles.pdpMeta}>
            <StarRating value={product.rating} />
            <span className={styles.pdpRatingNum}>{product.rating.toFixed(1)}</span>
            <button type="button" className={styles.reviewsLink} onClick={goReviewsFromRating}>
              {product.reviewsCount.toLocaleString(getAppLocale())} {t('common.reviews')}
            </button>
            <span className={styles.pdpSku}>{t('common.code', { sku: product.sku })}</span>
          </div>
        </header>

        <div
          className={styles.pdpTabs}
          role="tablist"
          aria-label={locale === 'en' ? 'Product sections' : locale === 'uk' ? 'Розділи картки товару' : 'Разделы карточки товара'}
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'about'}
            className={tab === 'about' ? styles.pdpTabOn : styles.pdpTab}
            onClick={() => selectTab('about')}
          >
            {locale === 'en' ? 'About product' : locale === 'uk' ? 'Про товар' : 'О товаре'}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'specs'}
            className={tab === 'specs' ? styles.pdpTabOn : styles.pdpTab}
            onClick={() => selectTab('specs')}
          >
            {locale === 'en' ? 'Specifications' : locale === 'uk' ? 'Характеристики' : 'Характеристики'}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'reviews'}
            className={tab === 'reviews' ? styles.pdpTabOn : styles.pdpTab}
            onClick={() => selectTab('reviews')}
          >
            {locale === 'en' ? 'Reviews' : locale === 'uk' ? 'Відгуки' : 'Отзывы'} ({reviews.length})
          </button>
        </div>
      </div>

      <div className={styles.hero}>
        <div className={styles.heroLeft}>
          <ProductGallery key={product.id} images={images} />

          <section ref={panelRef} className={styles.tabPanelWrap} id="product-detail-tabs" aria-live="polite">
            {tab === 'about' ? (
              <div key={`about-${product.id}`} className={`${styles.tabPanel} ${styles.tabPanelReveal}`}>
                <h2 className={styles.contentBlockTitle}>
                  {locale === 'en' ? 'Product description' : locale === 'uk' ? 'Опис товару' : 'Описание товара'}
                </h2>
                <div className={styles.desc}>{display.description}</div>
                {descBlocks.map((block, i) => (
                  <div key={i} className={styles.descSection}>
                    {block.title ? <h3 className={styles.descH3}>{block.title}</h3> : null}
                    {block.body ? <div className={styles.desc}>{block.body}</div> : null}
                  </div>
                ))}
                <p className={styles.descNote}>
                  {locale === 'en'
                    ? 'The manufacturer may update specifications and package contents. Please confirm the latest details with the manager or in your order before purchase.'
                    : locale === 'uk'
                      ? 'Виробник може оновлювати характеристики та комплектацію. Перед покупкою уточнюйте актуальні дані в менеджера або в замовленні.'
                      : 'Производитель может обновлять характеристики и комплектацию. Перед покупкой уточняйте актуальные данные у менеджера или в заказе.'}
                </p>
              </div>
            ) : null}

            {tab === 'specs' ? (
              <div key={`specs-${product.id}`} className={`${styles.tabPanel} ${styles.tabPanelReveal}`}>
                <h2 className={styles.specPageTitle}>
                  {locale === 'en' ? 'All specifications:' : locale === 'uk' ? 'Усі характеристики:' : 'Все характеристики:'}
                </h2>
                {(display.specSections ?? []).map((sec, si) => (
                  <div key={`${si}-${sec.title}`} className={styles.specGroup}>
                    <h3 className={styles.specGroupTitle}>{sec.title}</h3>
                    <div className={styles.specRows} role="list">
                      {sec.rows.map((r, ri) => (
                        <div key={`${si}-${ri}-${r.key}`} className={styles.specRowLine} role="listitem">
                          <span className={styles.specKey}>{r.key}</span>
                          <span className={styles.specVal}>{r.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {tab === 'reviews' ? (
              <div key={`reviews-${product.id}`} className={`${styles.tabPanel} ${styles.tabPanelReveal}`} id="product-reviews">
                <div className={styles.reviewsSummary}>
                  <div className={styles.reviewsScore}>
                    <span className={styles.reviewsScoreNum}>{reviewsAvg.toFixed(1)}</span>
                    <span className={styles.reviewsScoreLabel}>
                      {locale === 'en'
                        ? 'average across visible reviews'
                        : locale === 'uk'
                          ? 'середня за показаними відгуками'
                          : 'средняя по показанным отзывам'}
                    </span>
                    <StarRating value={reviewsAvg} />
                    <p className={styles.reviewsScoreMeta}>
                      {locale === 'en'
                        ? 'Total product ratings in the catalog: '
                        : locale === 'uk'
                          ? 'Усього оцінок товару в каталозі: '
                          : 'Всего оценок у товара в каталоге: '}
                      <strong>{product.reviewsCount.toLocaleString(getAppLocale())}</strong>.{' '}
                      {locale === 'en'
                        ? `Below are the latest ${reviews.length} customer reviews.`
                        : locale === 'uk'
                          ? `Нижче показано останні ${reviews.length} відгуків покупців.`
                          : `Ниже показаны последние ${reviews.length} отзывов покупателей.`}
                    </p>
                  </div>
                  <div
                    className={styles.histogram}
                    aria-label={
                      locale === 'en'
                        ? 'Rating distribution in sample'
                        : locale === 'uk'
                          ? 'Розподіл оцінок у вибірці'
                          : 'Распределение оценок в выборке'
                    }
                  >
                    {([5, 4, 3, 2, 1] as const).map((star) => {
                      const c = hist[star]
                      const pct = Math.round((c / histMax) * 100)
                      return (
                        <div key={star} className={styles.histRow}>
                          <span className={styles.histLabel}>{star} ★</span>
                          <div className={styles.histBar}>
                            <span className={styles.histFill} style={{ width: `${pct}%` }} />
                          </div>
                          <span className={styles.histCount}>{c}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <ul className={styles.reviewList}>
                  {reviews.map((r) => (
                    <li key={r.id} className={styles.reviewCard}>
                      <div className={styles.reviewHead}>
                        <StarRating value={r.rating} size="sm" />
                        <span className={styles.reviewAuthor}>{r.authorName}</span>
                        {r.verifiedPurchase ? (
                          <span className={styles.reviewBadge}>
                            {locale === 'en'
                              ? 'Verified purchase'
                              : locale === 'uk'
                                ? 'Покупку підтверджено'
                                : 'Покупка подтверждена'}
                          </span>
                        ) : null}
                        <time className={styles.reviewDate} dateTime={r.date}>
                          {formatReviewDate(r.date)}
                        </time>
                      </div>
                      <h3 className={styles.reviewTitle}>{r.title}</h3>
                      <p className={styles.reviewText}>{r.text}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        </div>

        <aside className={styles.buyBox}>
          <div className={styles.seller}>
            <span className={styles.sellerLogoWrap} aria-hidden>
              <PixelWordmark variant="compact" label="" />
            </span>
            <div className={styles.sellerText}>
              <span className={styles.sellerName}>PiXEL</span>
              <span className={styles.sellerSub}>
                {locale === 'en'
                  ? 'Reliable electronics seller'
                  : locale === 'uk'
                    ? 'Надійний продавець електроніки'
                    : 'Надёжный продавец электроники'}
              </span>
            </div>
          </div>

          <div className={styles.promoChips}>
            {product.badge === 'new' ? <span className={styles.chipNew}>{localizeBadge('new', locale)}</span> : null}
            {product.badge === 'hit' ? <span className={styles.chipHit}>{localizeBadge('hit', locale)}</span> : null}
            {product.badge === 'sale' ? <span className={styles.chipSale}>{localizeBadge('sale', locale)}</span> : null}
            <span className={styles.chipMuted}>{locale === 'en' ? '5% cashback' : locale === 'uk' ? 'Кешбек 5%' : 'Кэшбек 5%'}</span>
            <span className={styles.chipMuted}>
              {locale === 'en' ? 'Delivery across Ukraine' : locale === 'uk' ? 'Доставка по Україні' : 'Доставка по Украине'}
            </span>
          </div>

          {colorFromSpecs || storageFromSpecs ? (
            <div className={styles.configRow}>
              {colorFromSpecs ? (
                <div className={styles.configBlock}>
                  <span className={styles.configLabel}>{locale === 'en' ? 'Color' : locale === 'uk' ? 'Колір' : 'Цвет'}</span>
                  <span className={styles.configValue}>{colorFromSpecs}</span>
                </div>
              ) : null}
              {storageFromSpecs ? (
                <div className={styles.configBlock}>
                  <span className={styles.configLabel}>
                    {locale === 'en' ? 'Memory / storage' : locale === 'uk' ? "Пам'ять / диск" : 'Память / диск'}
                  </span>
                  <span className={styles.configValue}>{storageFromSpecs}</span>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className={styles.priceStack}>
            {product.listPrice != null && product.listPrice > product.price ? (
              <div className={styles.priceOldRow}>
                <span className={styles.priceOld}>{formatMoney(product.listPrice)}</span>
                {saveUah > 0 ? (
                  <span className={styles.priceDiscount}>−{formatMoney(saveUah)}</span>
                ) : null}
              </div>
            ) : null}
            <div className={styles.priceMainRow}>
              <span className={styles.priceMain}>{formatMoney(product.price)}</span>
              {discountPct > 0 ? (
                <span className={styles.discountPctBadge}>−{discountPct}%</span>
              ) : null}
            </div>
          </div>

          <div className={styles.stockLine}>
            {product.inStock ? (
              <span className={styles.inStock}>✓ {t('common.inStock')}</span>
            ) : (
              <span className={styles.outStock}>{t('common.outOfStock')}</span>
            )}
          </div>

          <div className={styles.qtyRow}>
            <span className={styles.qtyLabel}>{locale === 'en' ? 'Quantity' : locale === 'uk' ? 'Кількість' : 'Количество'}</span>
            <div className={styles.qtyCtrl}>
              <button
                type="button"
                aria-label={locale === 'en' ? 'Decrease' : locale === 'uk' ? 'Менше' : 'Меньше'}
                disabled={qty <= 1}
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <span className={styles.qtyVal}>{qty}</span>
              <button
                type="button"
                aria-label={locale === 'en' ? 'Increase' : locale === 'uk' ? 'Більше' : 'Больше'}
                onClick={() => setQty((q) => Math.min(99, q + 1))}
              >
                +
              </button>
            </div>
          </div>

          <div className={styles.ctaBlock}>
            <div className={styles.ctaMainRow}>
              <button
                type="button"
                className={styles.btnBuy}
                disabled={cartBusy || !product.inStock}
                onClick={() => void addToCart(product.id, qty)}
              >
                <IconCartBuy />
                {product.inStock ? (locale === 'en' ? 'Buy now' : locale === 'uk' ? 'Купити' : 'Купить') : (locale === 'en' ? 'Unavailable' : locale === 'uk' ? 'Недоступно' : 'Недоступно')}
              </button>
              <button
                type="button"
                className={styles.btnCredit}
                disabled={!product.inStock}
                onClick={() => setInstOpen(true)}
              >
                {locale === 'en' ? 'Installments' : locale === 'uk' ? 'Розстрочка' : 'Растрочка'}
              </button>
              <button
                type="button"
                className={`${styles.iconCircleBtn} ${styles.ctaFavMain}`}
                aria-label={
                  locale === 'en'
                    ? fav
                      ? 'Remove from wishlist'
                      : 'Add to wishlist'
                    : locale === 'uk'
                      ? fav
                        ? 'Прибрати з обраного'
                        : 'До обраного'
                      : fav
                        ? 'Убрать из избранного'
                        : 'В избранное'
                }
                aria-pressed={fav}
                onClick={() => toggleFavorite(product.id)}
              >
                {fav ? '♥' : '♡'}
              </button>
            </div>
            <div className={styles.ctaIconRow}>
              <button
                type="button"
                className={styles.iconCircleBtn}
                aria-label={
                  locale === 'en'
                    ? compared
                      ? 'Remove from comparison'
                      : 'Add to comparison'
                    : locale === 'uk'
                      ? compared
                        ? 'Прибрати з порівняння'
                        : 'До порівняння'
                      : compared
                        ? 'Убрать из сравнения'
                        : 'В сравнение'
                }
                aria-pressed={compared}
                onClick={() => toggleCompare(product.id)}
              >
                ⇄
              </button>
              <button
                type="button"
                className={styles.iconCircleBtn}
                aria-label={
                  locale === 'en'
                    ? fav
                      ? 'Remove from wishlist'
                      : 'Add to wishlist'
                    : locale === 'uk'
                      ? fav
                        ? 'Прибрати з обраного'
                        : 'До обраного'
                      : fav
                        ? 'Убрать из избранного'
                        : 'В избранное'
                }
                aria-pressed={fav}
                onClick={() => toggleFavorite(product.id)}
              >
                {fav ? '♥' : '♡'}
              </button>
            </div>
          </div>

          <div
            className={styles.payLogos}
            aria-label={locale === 'en' ? 'Installment payment options' : locale === 'uk' ? 'Оплата частинами' : 'Оплата частями'}
          >
            <span className={styles.payLogo} title="Monobank">
              M
            </span>
            <span className={styles.payLogo} title="ПриватБанк">
              P
            </span>
            <span className={styles.payLogo} title="Ощадбанк">
              О
            </span>
            <span className={styles.payLogo} title="Apple Pay">
              A
            </span>
          </div>

          <div className={styles.trustStrip}>
            <TrustMicroStrip />
          </div>

          <button type="button" className={styles.linkCart} onClick={openCartDrawer}>
            {locale === 'en' ? 'Open cart' : locale === 'uk' ? 'Відкрити кошик' : 'Открыть корзину'}
          </button>

          {tab === 'about' && (display.specSections?.length ?? 0) > 0 ? (
            <div
              key={`sidebar-specs-${product.id}`}
              className={`${styles.sidebarSpecs} ${styles.sidebarSpecsReveal}`}
              aria-label={locale === 'en' ? 'Product specifications' : locale === 'uk' ? 'Характеристики товару' : 'Характеристики товара'}
            >
              <h2 className={styles.sidebarSpecsTitle}>
                {locale === 'en' ? 'Specifications' : locale === 'uk' ? 'Характеристики' : 'Характеристики'}
              </h2>
              {(display.specSections ?? []).map((sec, si) => (
                <div key={`${si}-${sec.title}`} className={styles.sidebarSpecGroup}>
                  <h3 className={styles.sidebarSpecGroupTitle}>{sec.title}</h3>
                  <div className={styles.sidebarSpecRows} role="list">
                    {sec.rows.map((r, ri) => (
                      <div key={`${si}-${ri}-${r.key}`} className={styles.sidebarSpecRowLine} role="listitem">
                        <span className={styles.sidebarSpecKey}>{r.key}</span>
                        <span className={styles.sidebarSpecVal}>{r.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <div className={styles.deliveryBox}>
            <strong>{locale === 'en' ? 'Delivery and pickup' : locale === 'uk' ? 'Доставка та самовивіз' : 'Доставка и самовывоз'}</strong>
            <p>
              {locale === 'en'
                ? 'Kyiv and regions of Ukraine — courier or pickup point. Delivery time and cost are уточняйте during checkout.'
                : locale === 'uk'
                  ? 'Київ і регіони України — курʼєр або пункт видачі. Термін і вартість уточнюйте під час оформлення.'
                  : 'Киев и регионы Украины — курьер или пункт выдачи. Срок и стоимость уточняйте при оформлении.'}
            </p>
          </div>

          {highlights.length > 0 ? (
            <div className={styles.highlights}>
              <h2 className={styles.highlightsTitle}>{locale === 'en' ? 'Quick facts' : locale === 'uk' ? 'Коротко' : 'Кратко'}</h2>
              <ul className={styles.highlightsList}>
                {highlights.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ) : null}

        </aside>
      </div>

      <div
        className={styles.mobileBuyBar}
        role="region"
        aria-label={locale === 'en' ? 'Quick buy panel' : locale === 'uk' ? 'Панель швидкої покупки' : 'Панель быстрой покупки'}
      >
        <div className={styles.mobileBuyMeta}>
          <span className={styles.mobileBuyPrice}>{formatMoney(product.price)}</span>
          {product.listPrice != null && product.listPrice > product.price ? (
            <span className={styles.mobileBuyOld}>{formatMoney(product.listPrice)}</span>
          ) : null}
        </div>
        <div className={styles.mobileQtyCtrl}>
          <button
            type="button"
            className={styles.mobileQtyBtn}
            aria-label={locale === 'en' ? 'Decrease' : locale === 'uk' ? 'Менше' : 'Меньше'}
            disabled={qty <= 1}
            onClick={() => setQty((q) => Math.max(1, q - 1))}
          >
            −
          </button>
          <span className={styles.mobileQtyVal}>{qty}</span>
          <button
            type="button"
            className={styles.mobileQtyBtn}
            aria-label={locale === 'en' ? 'Increase' : locale === 'uk' ? 'Більше' : 'Больше'}
            onClick={() => setQty((q) => Math.min(99, q + 1))}
          >
            +
          </button>
        </div>
        <button
          type="button"
          className={styles.mobileBuyBtn}
          disabled={cartBusy || !product.inStock}
          onClick={() => void addToCart(product.id, qty)}
        >
          <IconCartBuy />
          {product.inStock ? (locale === 'en' ? 'Buy now' : locale === 'uk' ? 'Купити' : 'Купить') : (locale === 'en' ? 'Unavailable' : locale === 'uk' ? 'Недоступно' : 'Недоступно')}
        </button>
      </div>

      {similar.length > 0 ? (
        <section className={styles.similarSection} aria-labelledby="similar-products-title">
          <div className={styles.similarHead}>
            <h2 id="similar-products-title" className={styles.similarTitle}>
              {locale === 'en' ? 'Similar products' : locale === 'uk' ? 'Схожі товари' : 'Похожие товары'}
            </h2>
            <div className={styles.similarNav}>
              <button
                type="button"
                className={styles.similarArrow}
                aria-label={locale === 'en' ? 'Scroll left' : locale === 'uk' ? 'Прокрутити ліворуч' : 'Прокрутить влево'}
                onClick={() => scrollSimilar(-1)}
              >
                ‹
              </button>
              <button
                type="button"
                className={styles.similarArrow}
                aria-label={locale === 'en' ? 'Scroll right' : locale === 'uk' ? 'Прокрутити праворуч' : 'Прокрутить вправо'}
                onClick={() => scrollSimilar(1)}
              >
                ›
              </button>
            </div>
          </div>
          <div ref={similarRef} className={styles.similarTrack}>
            {similar.map((p) => (
              <div key={p.id} className={styles.similarSlide}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
          <Link
            to="/catalog"
            className={styles.catalogLink}
            onClick={() => {
              setCategoryFilter(product.category)
              setBrandFilter('all')
            }}
          >
            {locale === 'en' ? 'Full' : locale === 'uk' ? 'Увесь' : 'Весь'} {t('common.catalog')} «{display.categoryLabel}» →
          </Link>
        </section>
      ) : null}

      <StoreTrustBlock className={styles.pdpTrustMobile} />

      <InstallmentModal
        open={instOpen}
        onClose={() => setInstOpen(false)}
        productName={display.name}
        price={product.price}
      />
    </div>
  )
}
