import { Link } from 'react-router-dom'

import { SafeImage } from './SafeImage'

import styles from './ProductCard.module.css'

import { useShop } from '../context/useShop'

import { catalogHoverChips, catalogHoverSpecLines } from '../utils/catalogSpecLine'

import { highlightMatch } from '../utils/highlight'

import { formatMoney } from '../utils/formatMoney'

import { productPrimaryImage } from '../utils/productImages'

import { IconCart, IconCompare, IconHeart } from './HeaderIcons'

import type { Product } from '../types'
import { useI18n } from '../i18n'
import { getLocalizedProductView, localizeBadge } from '../i18n/catalog'



function discountPercent(listPrice: number, price: number): number | null {

  if (listPrice <= price) return null

  return Math.round((1 - price / listPrice) * 100)

}



type BadgeParts = { discount?: string; label?: string }



function badgeParts(product: Product, locale: 'ru' | 'uk' | 'en'): BadgeParts | null {

  if (!product.badge) return null

  const pct = product.listPrice ? discountPercent(product.listPrice, product.price) : null

  switch (product.badge) {

    case 'sale':

      return pct ? { discount: `−${pct}%` } : { label: localizeBadge('sale', locale) }

    case 'new':

      return { label: localizeBadge('new', locale) }

    case 'hit':

      return pct ? { discount: `−${pct}%`, label: localizeBadge('hit', locale) } : { label: localizeBadge('hit', locale) }

    default:

      return null

  }

}



function Stars({ rating }: { rating: number }) {

  const rounded = Math.min(5, Math.max(0, Math.round(rating)))

  return (

    <span className={styles.stars} aria-hidden>

      {Array.from({ length: 5 }, (_, i) => (

        <span key={i} className={i < rounded ? styles.starOn : styles.starOff}>

          ★

        </span>

      ))}

    </span>

  )

}



function bonusPoints(price: number): number {

  return Math.max(1, Math.round(price * 0.012))

}



export function ProductCard({ product }: { product: Product }) {
  const { locale, t } = useI18n()

  const { addToCart, cartBusy, appliedSearchQuery, toggleCompare, isInCompare, toggleFavorite, isFavorite } =

    useShop()

  const fav = isFavorite(product.id)

  const compared = isInCompare(product.id)

  const badge = badgeParts(product, locale)
  const view = getLocalizedProductView(product, locale)

  const hoverChips = catalogHoverChips(product)

  const hoverLines = catalogHoverSpecLines(product)

  const bonus = bonusPoints(product.price)

  const showFreeDelivery = product.inStock && product.price >= 1500



  return (

    <article className={styles.card} data-category={product.category} data-product-id={product.id}>

      <div className={styles.imageBlock}>

        {badge && product.badge ? (

          <span className={`${styles.badge} ${styles[`b_${product.badge}`]}`}>

            {badge.discount ? <span className={styles.badgeDiscount}>{badge.discount}</span> : null}

            {badge.label ? <span className={styles.badgeLabel}>{badge.label}</span> : null}

          </span>

        ) : null}



        {showFreeDelivery ? (

          <span
            className={styles.deliveryBadge}
            title={
              locale === 'en'
                ? 'Please уточняйте delivery conditions when ordering'
                : locale === 'uk'
                  ? 'Умови доставки уточнюйте під час замовлення'
                  : 'Условия доставки уточняйте при заказе'
            }
          >

            {t('common.freeDelivery')}

          </span>

        ) : null}



        {!product.inStock ? <span className={styles.stockOut}>{t('common.outOfStock')}</span> : null}



        <Link

          to={`/product/${product.id}`}

          className={styles.imageLink}

          viewTransition

          aria-label={t('common.openProduct', { name: view.name })}

        >

          <div className={styles.imageWrap}>

            <SafeImage

              src={productPrimaryImage(product)}

              alt=""

              loading="lazy"

              decoding="async"

              layout="catalog"

            />

          </div>

        </Link>



        <div className={styles.imageActions}>

          <button

            type="button"

            className={`${styles.iconBtn} ${compared ? styles.iconBtnOn : ''}`}

            onClick={() => toggleCompare(product.id)}

            aria-pressed={compared}

            title={t('common.compare')}

          >

            <IconCompare />

          </button>

          <button

            type="button"

            className={`${styles.iconBtn} ${fav ? styles.iconBtnOn : ''}`}

            onClick={(e) => {

              e.preventDefault()

              e.stopPropagation()

              toggleFavorite(product.id)

            }}

            aria-pressed={fav}

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

            title={
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

          >

            <IconHeart />

          </button>

        </div>



        {product.badge === 'sale' ? (

          <span className={styles.promoCorner} aria-hidden>

            {localizeBadge('sale', locale).toUpperCase()}

          </span>

        ) : null}

      </div>



      <div className={styles.body}>

        <Link to={`/product/${product.id}`} className={styles.titleLink} viewTransition>

          <h2 className={styles.name}>{highlightMatch(view.name, appliedSearchQuery)}</h2>

        </Link>



        <div

          className={styles.ratingRow}

          title={

            product.reviewsCount > 0

              ? locale === 'en'
                ? `Rating ${product.rating.toFixed(1)} out of 5`
                : locale === 'uk'
                  ? `Рейтинг ${product.rating.toFixed(1)} з 5`
                  : `Рейтинг ${product.rating.toFixed(1)} из 5`

              : t('common.noReviews')

          }

        >

          <Stars rating={product.rating} />

          {product.reviewsCount > 0 ? (

            <span className={styles.reviewCount}>
              {product.reviewsCount} {t('common.reviews')}
            </span>

          ) : (

            <span className={styles.reviewCountMuted}>{t('common.noReviews')}</span>

          )}

        </div>



        <div className={styles.priceRow}>

          <div className={styles.priceCol}>

            {product.listPrice ? (

              <span className={styles.oldPrice}>{formatMoney(product.listPrice)}</span>

            ) : null}

            <span className={styles.price}>{formatMoney(product.price)}</span>

          </div>

          <button

            type="button"

            className={styles.cartIconBtn}

            disabled={cartBusy || !product.inStock}

            onClick={() => void addToCart(product.id, 1)}

            aria-label={product.inStock ? t('common.addToCart') : t('common.outOfStock')}

            title={product.inStock ? t('common.addToCart') : t('common.outOfStock')}

          >

            <IconCart />

          </button>

        </div>



        {product.inStock ? (

          <p className={styles.stockOk}>{t('common.inStock')}</p>

        ) : (

          <p className={styles.stockWait}>{t('common.expected')}</p>

        )}



        <div className={styles.bonusRow}>

          <span className={styles.bonusBadge} aria-hidden>

            Б

          </span>

          <span className={styles.bonusText}>{t('common.bonusPoints', { count: bonus })}</span>

        </div>



        <span className="visually-hidden">{t('common.article', { sku: product.sku })}</span>

      </div>



      {hoverLines.length > 0 || hoverChips.length > 0 ? (

        <div className={styles.hoverPanel} aria-hidden>

          {hoverChips.length > 0 ? (

            <div className={styles.hoverChips}>

              {hoverChips.map((c, i) => (

                <div key={`${c.label}-${i}`} className={styles.hoverChip}>

                  <span className={styles.hoverChipLabel}>{c.label}</span>

                  <span className={styles.hoverChipValue}>{c.value}</span>

                </div>

              ))}

            </div>

          ) : null}

          {hoverLines.length > 0 ? (

            <div className={styles.hoverSpecs}>

              {hoverLines.map((line, i) => (

                <p key={`${product.id}-spec-${i}`} className={styles.hoverSpecLine}>

                  {line}

                </p>

              ))}

            </div>

          ) : null}

        </div>

      ) : null}

    </article>

  )

}

