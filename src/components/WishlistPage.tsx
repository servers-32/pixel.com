import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Breadcrumbs } from './Breadcrumbs'
import { ProductCard } from './ProductCard'
import styles from './WishlistPage.module.css'
import { useShop } from '../context/useShop'
import { useI18n } from '../i18n'

export function WishlistPage() {
  const { locale, t } = useI18n()
  const { products, favoriteIds } = useShop()

  const items = useMemo(() => {
    const set = new Set(favoriteIds)
    return products.filter((p) => set.has(p.id))
  }, [products, favoriteIds])

  return (
    <div className={styles.page}>
      <div className={styles.breadWrap}>
        <Breadcrumbs items={[{ label: t('common.home'), to: '/' }, { label: t('common.wishlist') }]} />
      </div>
      <header className={styles.head}>
        <h1 className={`${styles.title} heading-display`}>{t('common.wishlist')}</h1>
        <p className={styles.sub}>
          {locale === 'en'
            ? `Saved products are stored in this browser. ${items.length > 0 ? `${items.length} items.` : ''}`
            : locale === 'uk'
              ? `Збережені товари зберігаються в цьому браузері. ${items.length > 0 ? `${items.length} позицій.` : ''}`
              : `Сохранённые товары хранятся в этом браузере. ${items.length > 0 ? `${items.length} позиций.` : ''}`}
        </p>
      </header>
      {items.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon" aria-hidden>
            ♡
          </span>
          <p className="empty-state-title">
            {locale === 'en' ? 'Nothing here yet' : locale === 'uk' ? 'Поки порожньо' : 'Пока пусто'}
          </p>
          <p className="empty-state-text">
            {locale === 'en'
              ? 'Open any product page and click “Add to wishlist”.'
              : locale === 'uk'
                ? 'Відкрийте картку товару та натисніть «До обраного».'
                : 'Откройте карточку товара и нажмите «В избранное».'}
          </p>
          <div className="empty-state-actions">
            <Link to="/catalog" className="empty-state-btn" viewTransition>
              {t('common.catalog')}
            </Link>
          </div>
        </div>
      ) : (
        <div className={styles.grid}>
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}
