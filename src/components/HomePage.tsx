import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ProductCard } from './ProductCard'
import { StoreTrustBlock } from './StoreTrustBlock'
import { CategoryIcon } from './CategoryIcon'
import { CatalogBrandLogo } from './CatalogBrandLogo'
import styles from './HomePage.module.css'
import { CATEGORY_SUBCATEGORIES } from '../data/categorySubcategories'
import { getProductsByCategory } from '../data/mockData'
import { useShop } from '../context/useShop'
import { formatMoney } from '../utils/formatMoney'
import { productPrimaryImage } from '../utils/productImages'
import type { Product } from '../types'
import { useI18n } from '../i18n'
import { localizeCategory } from '../i18n/catalog'

/** Отдельные фото для героя (левая колонка слайдера и два правых баннера) */
const HERO_MAIN_SRC = '/hero/hero-main-lifestyle.png'
const HERO_FLAGSHIP_SRC = '/hero/hero-flagship-lineup.png'
/** Запасной кадр: `/hero/hero-flagship-hand.png` */
const HERO_SIDE_PHONE_CARD_SRC = '/hero/hero-side-phone-card.png'
const HERO_SIDE_GAMING_SRC = '/hero/hero-side-gaming.png'

/** Фоновые кадры для героя: bg — url() или linear-gradient; logo — опционально поверх фото */
const PROMO_TILES = [
  {
    k: 'p2',
    tag: 'Карта партнёра',
    hint: 'Вернём часть суммы на карту при покупке смартфона или аксессуаров',
    title: 'Кешбэк с картой партнёра',
    sub: 'До 5% на смартфоны и аксессуары',
    subLead: 'До 5%',
    subTail: 'на смартфоны и аксессуары',
    bg: HERO_MAIN_SRC,
    bgPos: 'center',
    cat: 'Смартфоны',
    detailPath: '/about',
  },
  {
    k: 'p3',
    tag: 'Новинки',
    hint: 'Рассрочка и trade-in — смотрите условия в каталоге',
    title: 'Флагманские смартфоны',
    sub: 'Рассрочка 12% годовых · trade-in до 40% от цены',
    bg: HERO_FLAGSHIP_SRC,
    bgPos: 'center',
    cat: 'Смартфоны',
    detailPath: '/delivery',
  },
]

/** Главный экран: слайдер + 2 боковых баннера */
const HERO_SLIDER = PROMO_TILES

/** Верхний правый баннер: iPhone + карта */
const HERO_SIDE_TOP = {
  title: 'Карта партнёра + iPhone 15 Pro',
  sub: 'До 5% кешбэка в рассрочку',
  bg: HERO_SIDE_PHONE_CARD_SRC,
  bgPos: 'center',
  cat: 'Смартфоны',
  cta: 'Получить выгоду',
}

/** Нижний правый баннер: гейминг */
const HERO_SIDE_BOTTOM = {
  title: 'Геймерские аксессуары',
  sub: 'Скидки до 30% на периферию',
  bg: HERO_SIDE_GAMING_SRC,
  bgPos: 'center',
  cat: 'Аксессуары',
  cta: 'В каталог',
}

export function HomePage() {
  const { locale, t } = useI18n()
  const {
    categories,
    products,
    categoryFilter,
    setCategoryFilter,
    setCategoryFilterWithSearch,
    setBrandFilter,
    recentProductIds,
    getProduct,
  } = useShop()
  const navigate = useNavigate()
  const [hitTab, setHitTab] = useState<string>('all')
  const [heroSlide, setHeroSlide] = useState(0)
  const brandTrackRef = useRef<HTMLDivElement>(null)
  const [brandScroll, setBrandScroll] = useState({ canLeft: false, canRight: true })
  const heroSliderCount = HERO_SLIDER.length
  const promoCopy: Record<string, { title: string; sub: string; subLead?: string; subTail?: string }> =
    locale === 'en'
      ? {
          p2: { title: 'Partner card cashback', sub: 'Up to 5% on smartphones and accessories', subLead: 'Up to 5%', subTail: 'on smartphones and accessories' },
          p3: { title: 'Flagship smartphones', sub: '12% annual installments · trade-in up to 40% of the price' },
        }
      : locale === 'uk'
        ? {
            p2: { title: 'Кешбек з карткою партнера', sub: 'До 5% на смартфони та аксесуари', subLead: 'До 5%', subTail: 'на смартфони та аксесуари' },
            p3: { title: 'Флагманські смартфони', sub: 'Розстрочка 12% річних · trade-in до 40% від ціни' },
          }
        : {
            p2: { title: 'Кешбэк с картой партнёра', sub: 'До 5% на смартфоны и аксессуары', subLead: 'До 5%', subTail: 'на смартфоны и аксессуары' },
            p3: { title: 'Флагманские смартфоны', sub: 'Рассрочка 12% годовых · trade-in до 40% от цены' },
          }
  const heroSideTopCopy =
    locale === 'en'
      ? { title: 'Partner card + iPhone 15 Pro', sub: 'Up to 5% cashback in installments', cta: 'Get the offer' }
      : locale === 'uk'
        ? { title: 'Картка партнера + iPhone 15 Pro', sub: 'До 5% кешбеку в розстрочку', cta: 'Отримати вигоду' }
        : { title: 'Карта партнёра + iPhone 15 Pro', sub: 'До 5% кешбэка в рассрочку', cta: 'Получить выгоду' }
  const heroSideBottomCopy =
    locale === 'en'
      ? { title: 'Gaming accessories', sub: 'Up to 30% off peripherals', cta: 'Open catalog' }
      : locale === 'uk'
        ? { title: 'Геймерські аксесуари', sub: 'Знижки до 30% на периферію', cta: 'До каталогу' }
        : { title: 'Геймерские аксессуары', sub: 'Скидки до 30% на периферию', cta: 'В каталог' }

  const heroSlideMax = Math.max(0, HERO_SLIDER.length - 1)
  const heroSlideSafe = Math.min(Math.max(0, heroSlide), heroSlideMax)

  useEffect(() => {
    if (heroSliderCount <= 1) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) return
    const id = window.setInterval(() => {
      setHeroSlide((i) => (i + 1) % heroSliderCount)
    }, 6000)
    return () => window.clearInterval(id)
  }, [heroSliderCount])

  const updateBrandScrollState = () => {
    const el = brandTrackRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    const eps = 6
    setBrandScroll({
      canLeft: scrollLeft > eps,
      canRight: scrollLeft < scrollWidth - clientWidth - eps,
    })
  }

  const brands = useMemo(
    () => [...new Set(products.map((p) => p.brand))].filter((brand) => brand !== 'iPhone').sort(),
    [products],
  )

  useEffect(() => {
    updateBrandScrollState()
    const el = brandTrackRef.current
    if (!el) return
    el.addEventListener('scroll', updateBrandScrollState, { passive: true })
    const ro = new ResizeObserver(updateBrandScrollState)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', updateBrandScrollState)
      ro.disconnect()
    }
  }, [brands])

  function scrollBrandStrip(dir: -1 | 1) {
    const el = brandTrackRef.current
    if (!el) return
    const delta = Math.min(360, Math.max(240, el.clientWidth * 0.75))
    el.scrollBy({ left: dir * delta, behavior: 'smooth' })
  }

  const minByCategory = useMemo(() => {
    const m = new Map<string, number>()
    for (const p of products) {
      const cur = m.get(p.category)
      if (cur === undefined || p.price < cur) m.set(p.category, p.price)
    }
    return m
  }, [products])

  const hitsSorted = useMemo(() => [...products].sort((a, b) => b.rating - a.rating), [products])

  const hitTabs = useMemo(() => {
    const withStock = categories.filter((c) => getProductsByCategory(products, c).length > 0)
    return ['all', ...withStock]
  }, [categories, products])

  const filteredHits = useMemo(() => {
    if (hitTab === 'all') return hitsSorted.slice(0, 8)
    return hitsSorted.filter((p) => p.category === hitTab).slice(0, 8)
  }, [hitsSorted, hitTab])

  const deals = useMemo(() => products.filter((p) => p.listPrice).slice(0, 4), [products])

  const recentProducts = useMemo((): Product[] => {
    const out: Product[] = []
    for (const id of recentProductIds) {
      const p = getProduct(id)
      if (p) out.push(p)
    }
    return out.slice(0, 8)
  }, [recentProductIds, getProduct])

  function goCategory(cat: string) {
    setCategoryFilter(cat)
    setBrandFilter('all')
    navigate('/catalog', { viewTransition: true })
  }

  function goSubcategory(cat: string, query: string) {
    setCategoryFilterWithSearch(cat, query)
    navigate('/catalog', { viewTransition: true })
  }

  return (
    <div className={`${styles.page} ${styles.pageEnter}`}>
      <div className={styles.shell}>
        <aside className={styles.sidebar} aria-label={locale === 'en' ? 'Catalog by categories' : locale === 'uk' ? 'Каталог за категоріями' : 'Каталог по категориям'}>
          <p className={styles.sidebarTitle}>{t('common.categories')}</p>
          <ul className={styles.catList}>
            {categories.map((c) => {
              const minP = minByCategory.get(c)
              const subs = CATEGORY_SUBCATEGORIES[c]
              const firstInCat = getProductsByCategory(products, c)[0]
              const previewUrl = firstInCat ? productPrimaryImage(firstInCat) : ''
              const isActive = categoryFilter === c
              const titleHint =
                minP !== undefined
                  ? `${localizeCategory(c, locale)} · ${locale === 'en' ? 'from' : locale === 'uk' ? 'від' : 'от'} ${formatMoney(minP)}`
                  : localizeCategory(c, locale)
              return (
                <li key={c} className={styles.catLi}>
                  <div className={styles.catTrack}>
                    <button
                      type="button"
                      className={`${styles.catRow} ${isActive ? styles.catRowActive : ''}`}
                      title={titleHint}
                      aria-current={isActive ? 'true' : undefined}
                      aria-haspopup={subs?.length ? 'menu' : undefined}
                      onClick={() => goCategory(c)}
                    >
                      <span className={styles.catIconWrap}>
                        <CategoryIcon category={c} className={styles.catIcon} />
                      </span>
                      <span className={styles.catName}>{localizeCategory(c, locale)}</span>
                      <span
                        className={subs?.length ? styles.catChevNested : styles.catChev}
                        aria-hidden
                      >
                        {subs?.length ? '››' : '›'}
                      </span>
                    </button>
                    {subs?.length ? (
                      <div
                        className={styles.catMegaOuter}
                        role="group"
                        aria-label={`${locale === 'en' ? 'Subcategories' : locale === 'uk' ? 'Підкатегорії' : 'Подкатегории'}: ${localizeCategory(c, locale)}`}
                      >
                        {previewUrl ? (
                          <div className={styles.catMegaPreview} aria-hidden>
                            <img src={previewUrl} alt="" loading="lazy" />
                          </div>
                        ) : null}
                        <ul className={styles.catSubList}>
                          {subs.map((sub) => (
                            <li key={sub.label}>
                              <button
                                type="button"
                                className={styles.catSubBtn}
                                onClick={() => goSubcategory(c, sub.query)}
                              >
                                {sub.label}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
        </aside>

        <div className={styles.main}>
          <div className={styles.heroSection}>
            <div className={styles.heroBlock} aria-label={locale === 'en' ? 'Main promotions' : locale === 'uk' ? 'Головні акції' : 'Главные акции'}>
            <div className={styles.heroSliderWrap}>
              <div
                className={styles.heroTrack}
                style={{ transform: `translateX(-${heroSlideSafe * 100}%)` }}
              >
                {HERO_SLIDER.map((tile, slideIndex) => (
                  <div
                    key={tile.k}
                    role="button"
                    tabIndex={0}
                    className={styles.heroSlide}
                    data-active={slideIndex === heroSlideSafe ? '' : undefined}
                    data-static-bg={
                      ('logo' in tile && typeof tile.logo === 'string') ||
                      tile.bg === HERO_MAIN_SRC ||
                      tile.bg === HERO_FLAGSHIP_SRC
                        ? ''
                        : undefined
                    }
                    aria-label={`${promoCopy[tile.k]?.title ?? tile.title}. ${promoCopy[tile.k]?.sub ?? tile.sub}`}
                    onClick={() => goCategory(tile.cat)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        goCategory(tile.cat)
                      }
                    }}
                  >
                    <span
                      className={styles.promoBg}
                      style={
                        tile.bg.startsWith('linear-gradient') || tile.bg.startsWith('radial-gradient')
                          ? { backgroundImage: tile.bg, backgroundPosition: tile.bgPos ?? 'center' }
                          : {
                              backgroundImage: `url(${tile.bg})`,
                              backgroundPosition: tile.bgPos ?? 'center',
                            }
                      }
                      aria-hidden
                    />
                    {tile.bg === HERO_MAIN_SRC ? (
                      <span className={styles.heroPixelOverlay} aria-hidden />
                    ) : null}
                    {'logo' in tile && typeof tile.logo === 'string' ? (
                      <img
                        src={tile.logo}
                        className={styles.heroSlideLogo}
                        alt=""
                        loading="eager"
                        decoding="async"
                        draggable={false}
                      />
                    ) : null}
                    <span className={styles.promoScrim} aria-hidden />
                    <div className={styles.heroSlideBody}>
                      <span className={styles.promoTitle}>{promoCopy[tile.k]?.title ?? tile.title}</span>
                      {'subLead' in tile && (promoCopy[tile.k]?.subLead ?? tile.subLead) ? (
                        <span className={styles.promoSub}>
                          <span className={styles.promoSubLead}>{promoCopy[tile.k]?.subLead ?? tile.subLead}</span>
                          {'subTail' in tile && (promoCopy[tile.k]?.subTail ?? tile.subTail) ? (
                            <span className={styles.promoSubTail}>{promoCopy[tile.k]?.subTail ?? tile.subTail}</span>
                          ) : null}
                        </span>
                      ) : (
                        <span className={styles.promoSub}>{promoCopy[tile.k]?.sub ?? tile.sub}</span>
                      )}
                      <div className={styles.heroCtaRow} onClick={(e) => e.stopPropagation()}>
                        <button type="button" className={styles.heroBtnPrimary} onClick={() => goCategory(tile.cat)}>
                          {locale === 'en' ? 'Open catalog' : locale === 'uk' ? 'До каталогу' : 'В каталог'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {HERO_SLIDER.length > 1 ? (
                <>
                  <button
                    type="button"
                    className={`${styles.heroArrow} ${styles.heroArrowPrev}`}
                    aria-label={locale === 'en' ? 'Previous slide' : locale === 'uk' ? 'Попередній слайд' : 'Предыдущий слайд'}
                    onClick={() =>
                      setHeroSlide((i) => (i - 1 + HERO_SLIDER.length) % HERO_SLIDER.length)
                    }
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className={`${styles.heroArrow} ${styles.heroArrowNext}`}
                    aria-label={locale === 'en' ? 'Next slide' : locale === 'uk' ? 'Наступний слайд' : 'Следующий слайд'}
                    onClick={() => setHeroSlide((i) => (i + 1) % HERO_SLIDER.length)}
                  >
                    ›
                  </button>
                  <div className={styles.heroDots} role="tablist" aria-label={locale === 'en' ? 'Slides' : locale === 'uk' ? 'Слайди' : 'Слайды'}>
                    {HERO_SLIDER.map((tile, i) => (
                      <button
                        key={tile.k}
                        type="button"
                        role="tab"
                        aria-selected={heroSlideSafe === i}
                        aria-label={`${locale === 'en' ? 'Slide' : locale === 'uk' ? 'Слайд' : 'Слайд'} ${i + 1}: ${promoCopy[tile.k]?.title ?? tile.title}`}
                        className={heroSlideSafe === i ? styles.heroDotOn : styles.heroDot}
                        onClick={() => setHeroSlide(i)}
                      />
                    ))}
                  </div>
                </>
              ) : null}
            </div>

            <div className={styles.heroAside}>
              <div className={styles.sideCard}>
                <span
                  className={styles.promoBg}
                  style={{
                    backgroundImage: `url(${HERO_SIDE_TOP.bg})`,
                    backgroundPosition: HERO_SIDE_TOP.bgPos,
                  }}
                  aria-hidden
                />
                <span className={styles.promoScrim} aria-hidden />
                <div className={`${styles.sideCardBody} ${styles.sideCardBodySpaced}`}>
                  <span className={styles.sideCardPromoTitle}>{heroSideTopCopy.title}</span>
                  <span className={styles.sideCardPromoSub}>{heroSideTopCopy.sub}</span>
                </div>
                <div className={styles.sideCardFooter}>
                  <button
                    type="button"
                    className={styles.sideBtnPrimary}
                    onClick={() => goCategory(HERO_SIDE_TOP.cat)}
                  >
                    {heroSideTopCopy.cta}
                  </button>
                </div>
              </div>
              <div className={styles.sideCard}>
                <span
                  className={styles.promoBg}
                  style={{
                    backgroundImage: `url(${HERO_SIDE_BOTTOM.bg})`,
                    backgroundPosition: HERO_SIDE_BOTTOM.bgPos,
                  }}
                  aria-hidden
                />
                <span className={`${styles.promoScrim} ${styles.sideCardScrimStrong}`} aria-hidden />
                <div className={`${styles.sideCardBody} ${styles.sideCardBodyGaming}`}>
                  <div className={styles.sideCardTextRibbon}>
                    <span className={styles.sideCardPromoTitle}>{heroSideBottomCopy.title}</span>
                    <span className={styles.sideCardPromoSub}>{heroSideBottomCopy.sub}</span>
                  </div>
                </div>
                <div className={styles.sideCardFooter}>
                  <button
                    type="button"
                    className={styles.sideBtnPrimary}
                    onClick={() => goCategory(HERO_SIDE_BOTTOM.cat)}
                  >
                    {heroSideBottomCopy.cta}
                  </button>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>{t('common.categories')}</h2>
          <Link to="/catalog" className={styles.sectionLink} viewTransition>
            {locale === 'en' ? 'Full catalog' : locale === 'uk' ? 'Увесь каталог' : 'Весь каталог'} →
          </Link>
        </div>
        <div className={styles.catGrid}>
          {categories.map((c) => {
            const first = getProductsByCategory(products, c)[0]
            return (
              <button key={c} type="button" className={styles.catTile} onClick={() => goCategory(c)}>
                {first ? (
                  <span className={styles.catImg} style={{ backgroundImage: `url(${productPrimaryImage(first)})` }} />
                ) : null}
                <span className={styles.catLabel}>{localizeCategory(c, locale)}</span>
              </button>
            )
          })}
        </div>
      </section>

      {recentProducts.length > 0 ? (
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>{locale === 'en' ? 'Recently viewed' : locale === 'uk' ? 'Нещодавно переглянуті' : 'Недавно просмотренные'}</h2>
            <Link to="/catalog" className={styles.sectionLink} viewTransition>
              {t('common.catalog')} →
            </Link>
          </div>
          <div className={`${styles.productRow} ${styles.productRowRecent}`}>
            {recentProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}

      <section className={styles.sectionLeaders}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>{locale === 'en' ? 'Best sellers' : locale === 'uk' ? 'Лідери продажу' : 'Лидеры продаж'}</h2>
          <Link to="/catalog" className={styles.sectionLink} viewTransition>
            {locale === 'en' ? 'All products' : locale === 'uk' ? 'Усі товари' : 'Все товары'} →
          </Link>
        </div>
        <div className={styles.hitTabs} role="tablist" aria-label={locale === 'en' ? 'Category filter' : locale === 'uk' ? 'Фільтр за категорією' : 'Фильтр по категории'}>
          {hitTabs.map((tab) => {
            const id = tab === 'all' ? 'all' : tab
            const label = tab === 'all' ? (locale === 'en' ? 'Top products' : locale === 'uk' ? 'Топ товари' : 'Топ товары') : localizeCategory(tab, locale)
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={hitTab === id}
                className={hitTab === id ? styles.hitTabOn : styles.hitTab}
                onClick={() => setHitTab(id)}
              >
                {label}
              </button>
            )
          })}
        </div>
        <div key={hitTab} className={`${styles.productRow} ${styles.productRowHits}`}>
          {filteredHits.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>{locale === 'en' ? 'Best offers' : locale === 'uk' ? 'Вигідні пропозиції' : 'Выгодные предложения'}</h2>
          <span className={styles.sectionHint}>{locale === 'en' ? 'Promotional discounts on selected items' : locale === 'uk' ? 'Акційні знижки на вибрані позиції' : 'Скидки по акции на выбранные позиции'}</span>
        </div>
        <div className={styles.productRow}>
          {deals.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className={styles.brands} aria-labelledby="brands-heading">
        <h2 id="brands-heading" className={styles.brandsTitle}>
          {locale === 'en' ? 'Brands in the catalog' : locale === 'uk' ? 'Бренди в каталозі' : 'Бренды в каталоге'}
        </h2>
        <div className={styles.brandStripOuter}>
          <button
            type="button"
            className={styles.brandNavBtn}
            aria-label={locale === 'en' ? 'Scroll brands left' : locale === 'uk' ? 'Прокрутити бренди ліворуч' : 'Прокрутить бренды влево'}
            disabled={!brandScroll.canLeft}
            onClick={() => scrollBrandStrip(-1)}
          >
            <span className={styles.brandNavChev} aria-hidden>
              ‹
            </span>
          </button>
          <div className={styles.brandStrip} ref={brandTrackRef}>
            {brands.map((b) => (
              <div key={b} className={styles.brandCell}>
                <button
                  type="button"
                  className={styles.brandCellBtn}
                  title={b}
                  aria-label={`${b} — ${locale === 'en' ? 'show brand products in catalog' : locale === 'uk' ? 'показати товари бренду в каталозі' : 'показать товары бренда в каталоге'}`}
                  onClick={() => {
                    setBrandFilter(b)
                    setCategoryFilter('all')
                    navigate('/catalog')
                  }}
                >
                  <CatalogBrandLogo brand={b} variant="strip" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className={styles.brandNavBtn}
            aria-label={locale === 'en' ? 'Scroll brands right' : locale === 'uk' ? 'Прокрутити бренди праворуч' : 'Прокрутить бренды вправо'}
            disabled={!brandScroll.canRight}
            onClick={() => scrollBrandStrip(1)}
          >
            <span className={styles.brandNavChev} aria-hidden>
              ›
            </span>
          </button>
        </div>
      </section>

      <StoreTrustBlock className={styles.trustAtPageBottom} />

    </div>
  )
}