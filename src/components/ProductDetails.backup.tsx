import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Breadcrumbs } from './Breadcrumbs'
import { InstallmentModal } from './InstallmentModal'
import { ProductCard } from './ProductCard'
import { SafeImage } from './SafeImage'
import styles from './ProductDetails.backup.module.css'
import { StarRating } from './StarRating'
import { TrustMicroStrip } from './TrustMicroStrip'
import { parseDescriptionSections } from '../data/productDetailEnrich'
import { averageReviewRating, getReviewsForProduct, reviewStarHistogram } from '../data/productReviews'
import { BRAND_LOGO_URL } from '../brandAssets'
import { getDefaultDocumentTitle } from '../constants/site'
import { useShop } from '../context/useShop'
import { formatMoney } from '../utils/formatMoney'
import { getAppLocale } from '../utils/locale'
import { productImages } from '../utils/productImages'

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
  const mainPhotoSrc = images[imgIdx] ?? ''
  return (
    <div className={styles.gallery}>
      <div className={styles.thumbs} role="tablist" aria-label="Фотографии товара">
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
      <div className={styles.mainPhoto}>
        {mainPhotoSrc ? (
          <SafeImage src={mainPhotoSrc} alt="" loading="eager" decoding="async" layout="detail" />
        ) : null}
      </div>
    </div>
  )
}

export function ProductDetails() {
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
  } = useShop()
  const product = productId ? getProduct(productId) : undefined
  const images = useMemo(() => (product ? productImages(product) : []), [product])
  const [tab, setTab] = useState<DetailTab>('about')
  const [qty, setQty] = useState(1)
  const [instOpen, setInstOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const similarRef = useRef<HTMLDivElement>(null)

  const reviews = useMemo(
    () => (product ? getReviewsForProduct(product.id, product.rating) : []),
    [product],
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
      name: product.name,
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
  }, [product, images])

  const similar = useMemo(() => {
    if (!product) return []
    return products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 16)
  }, [products, product])

  const descBlocks = useMemo(
    () => parseDescriptionSections(product?.longDescription ?? ''),
    [product?.longDescription],
  )

  useEffect(() => {
    if (!productId) return
    if (!product) {
      document.title = `Товар не найден — ${getDefaultDocumentTitle()}`
      return () => {
        document.title = getDefaultDocumentTitle()
      }
    }
    document.title = `${product.name} — Electric Company`
    return () => {
      document.title = getDefaultDocumentTitle()
    }
  }, [productId, product])

  if (!product) {
    return (
      <div className={styles.wrap}>
        <div className={styles.notFound}>
          <h1 className={`${styles.nfTitle} heading-display`}>Товар не найден</h1>
          <p className={styles.nfText}>Проверьте ссылку или вернитесь в каталог.</p>
          <Link to="/catalog" className={styles.nfBtn} viewTransition>
            В каталог
          </Link>
        </div>
      </div>
    )
  }

  const fav = isFavorite(product.id)

  const highlights = specHighlights(product.specs)
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
      <Breadcrumbs
        items={[
          { label: 'Главная', to: '/' },
          { label: 'Каталог', to: '/catalog' },
          {
            label: product.category,
            to: '/catalog',
            onClick: () => setCategoryFilter(product.category),
          },
          { label: product.name },
        ]}
      />

      <button type="button" className={styles.back} onClick={() => navigate(-1)}>
        ← Назад
      </button>

      <h1 className={`${styles.pageTitle} heading-display`}>{product.name}</h1>

      <div className={styles.hero}>
        <ProductGallery key={product.id} images={images} />

        <aside className={styles.buyBox}>
          <div className={styles.seller}>
            <span className={styles.sellerLogoWrap}>
              <SafeImage src={BRAND_LOGO_URL} alt="" className={styles.sellerLogo} decoding="async" />
            </span>
            <span className={styles.sellerName}>Electric Company</span>
          </div>

          <div className={styles.promos}>
            <span className={styles.promoPill}>Скидка при оплате картой онлайн</span>
            <span className={styles.promoPill}>Доставка по Украине</span>
          </div>

          <div className={styles.priceBlock}>
            <span className={styles.priceMain}>{formatMoney(product.price)}</span>
            {product.listPrice ? <span className={styles.priceOld}>{formatMoney(product.listPrice)}</span> : null}
          </div>

          {discountPct > 0 ? (
            <div className={styles.discountRow}>
              <span className={styles.discountBadge}>−{discountPct}%</span>
              {saveUah > 0 ? <span className={styles.saveText}>Экономия {formatMoney(saveUah)}</span> : null}
            </div>
          ) : null}

          <div className={styles.ratingInline}>
            <StarRating value={product.rating} />
            <button type="button" className={styles.reviewsLink} onClick={goReviewsFromRating}>
            {product.reviewsCount.toLocaleString(getAppLocale())} отзывов
            </button>
          </div>

          <div className={styles.stockLine}>
            {product.inStock ? (
              <span className={styles.inStock}>✓ В наличии</span>
            ) : (
              <span className={styles.outStock}>Нет в наличии</span>
            )}
          </div>

          <div className={styles.qtyRow}>
            <span className={styles.qtyLabel}>Количество</span>
            <div className={styles.qtyCtrl}>
              <button
                type="button"
                aria-label="Меньше"
                disabled={qty <= 1}
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <span className={styles.qtyVal}>{qty}</span>
              <button type="button" aria-label="Больше" onClick={() => setQty((q) => Math.min(99, q + 1))}>
                +
              </button>
            </div>
          </div>

          <div className={styles.buyRow}>
            <button
              type="button"
              className={styles.btnBuy}
              disabled={cartBusy || !product.inStock}
              onClick={() => void addToCart(product.id, qty)}
            >
              <IconCartBuy />
              {product.inStock ? 'Купить' : 'Недоступно'}
            </button>
            <button
              type="button"
              className={styles.btnCredit}
              disabled={!product.inStock}
              onClick={() => setInstOpen(true)}
            >
              Рассрочка 12% годовых
            </button>
          </div>

          <button
            type="button"
            className={styles.btnFav}
            onClick={() => toggleFavorite(product.id)}
            aria-pressed={fav}
          >
            {fav ? '♥ В избранном' : '♡ В избранное'}
          </button>

          <div className={styles.trustStrip}>
            <TrustMicroStrip />
          </div>

          <button type="button" className={styles.linkCart} onClick={openCartDrawer}>
            Открыть корзину
          </button>

          <div className={styles.deliveryBox}>
            <strong>Доставка и самовывоз</strong>
            <p>Киев и регионы Украины — курьер или пункт выдачи. Срок и стоимость уточняйте при оформлении.</p>
          </div>

          {highlights.length > 0 ? (
            <div className={styles.highlights}>
              <h2 className={styles.highlightsTitle}>Кратко</h2>
              <ul className={styles.highlightsList}>
                {highlights.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <p className={styles.sku}>Артикул: {product.sku}</p>
        </aside>
      </div>

      <div className={styles.tabBar} role="tablist" aria-label="Разделы карточки товара">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'about'}
          className={tab === 'about' ? styles.tabPillOn : styles.tabPill}
          onClick={() => selectTab('about')}
        >
          Описание
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'specs'}
          className={tab === 'specs' ? styles.tabPillOn : styles.tabPill}
          onClick={() => selectTab('specs')}
        >
          Характеристики
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'reviews'}
          className={tab === 'reviews' ? styles.tabPillOn : styles.tabPill}
          onClick={() => selectTab('reviews')}
        >
          Отзывы и вопросы ({reviews.length})
        </button>
      </div>

      <section ref={panelRef} className={styles.tabPanelWrap} id="product-detail-tabs" aria-live="polite">
        {tab === 'about' ? (
          <div className={styles.tabPanel}>
            <h2 className={styles.contentBlockTitle}>Описание товара</h2>
            <div className={styles.desc}>{product.description}</div>
            {descBlocks.map((block, i) => (
              <div key={i} className={styles.descSection}>
                {block.title ? <h3 className={styles.descH3}>{block.title}</h3> : null}
                {block.body ? <div className={styles.desc}>{block.body}</div> : null}
              </div>
            ))}
            <p className={styles.descNote}>
              Производитель может обновлять характеристики и комплектацию. Перед покупкой уточняйте актуальные данные у
              менеджера или в заказе.
            </p>
          </div>
        ) : null}

        {tab === 'specs' ? (
          <div className={styles.tabPanel}>
            <h2 className={styles.specPageTitle}>Все характеристики:</h2>
            {(product.specSections ?? []).map((sec, si) => (
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
          <div className={styles.tabPanel} id="product-reviews">
            <div className={styles.reviewsSummary}>
              <div className={styles.reviewsScore}>
                <span className={styles.reviewsScoreNum}>{reviewsAvg.toFixed(1)}</span>
                <span className={styles.reviewsScoreLabel}>средняя по показанным отзывам</span>
                <StarRating value={reviewsAvg} />
                <p className={styles.reviewsScoreMeta}>
                  Всего оценок у товара в каталоге:{' '}
                  <strong>{product.reviewsCount.toLocaleString(getAppLocale())}</strong>. Ниже показаны последние{' '}
                  {reviews.length} отзывов покупателей.
                </p>
              </div>
              <div className={styles.histogram} aria-label="Распределение оценок в выборке">
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
                    {r.verifiedPurchase ? <span className={styles.reviewBadge}>Покупка подтверждена</span> : null}
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

      {similar.length > 0 ? (
        <section className={styles.similarSection} aria-labelledby="similar-products-title">
          <div className={styles.similarHead}>
            <h2 id="similar-products-title" className={styles.similarTitle}>
              Похожие товары
            </h2>
            <div className={styles.similarNav}>
              <button
                type="button"
                className={styles.similarArrow}
                aria-label="Прокрутить влево"
                onClick={() => scrollSimilar(-1)}
              >
                ‹
              </button>
              <button
                type="button"
                className={styles.similarArrow}
                aria-label="Прокрутить вправо"
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
            Весь каталог «{product.category}» →
          </Link>
        </section>
      ) : null}

      <InstallmentModal
        open={instOpen}
        onClose={() => setInstOpen(false)}
        productName={product.name}
        price={product.price}
      />
    </div>
  )
}
