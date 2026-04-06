import { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './CompareDock.module.css'
import { useShop } from '../context/useShop'
import { formatMoney } from '../utils/formatMoney'
import { useI18n } from '../i18n'
import { getLocalizedProductView, localizeSpecKey } from '../i18n/catalog'

export function CompareDock() {
  const { locale } = useI18n()
  const { compareIds, getProduct, clearCompare, toggleCompare } = useShop()
  const [open, setOpen] = useState(false)

  if (compareIds.length === 0) return null

  const items = compareIds.map((id) => getProduct(id)).filter(Boolean)

  const specKeys = [...new Set(items.flatMap((p) => (p ? Object.keys(p.specs) : [])))].slice(0, 8)

  return (
    <>
      <div id="compare-dock" className={styles.dock}>
        <div className={styles.dockInner}>
          <span className={styles.label}>{locale === 'en' ? 'Compare' : locale === 'uk' ? 'Порівняння' : 'Сравнение'}</span>
          <span className={styles.count}>{compareIds.length}/3</span>
          <div className={styles.chips}>
            {items.map((p) =>
              p ? (
                <button
                  key={p.id}
                  type="button"
                  className={styles.chip}
                  onClick={() => toggleCompare(p.id)}
                  title={locale === 'en' ? 'Remove' : locale === 'uk' ? 'Прибрати' : 'Убрать'}
                >
                  {getLocalizedProductView(p, locale).name.slice(0, 18)}
                  {getLocalizedProductView(p, locale).name.length > 18 ? '…' : ''} ×
                </button>
              ) : null,
            )}
          </div>
          <button type="button" className={styles.openBtn} onClick={() => setOpen(true)}>
            {locale === 'en' ? 'Table' : locale === 'uk' ? 'Таблиця' : 'Таблица'}
          </button>
          <button type="button" className={styles.clear} onClick={clearCompare}>
            {locale === 'en' ? 'Clear' : locale === 'uk' ? 'Очистити' : 'Очистить'}
          </button>
        </div>
      </div>

      {open ? (
        <div className={styles.modalRoot}>
          <button
            type="button"
            className={styles.modalBackdrop}
            aria-label={locale === 'en' ? 'Close' : locale === 'uk' ? 'Закрити' : 'Закрыть'}
            onClick={() => setOpen(false)}
          />
          <div className={styles.modal} role="dialog" aria-modal>
            <div className={styles.modalHead}>
              <h2 className={styles.modalTitle}>
                {locale === 'en' ? 'Product comparison' : locale === 'uk' ? 'Порівняння товарів' : 'Сравнение товаров'}
              </h2>
              <button type="button" className={styles.modalClose} onClick={() => setOpen(false)}>
                ×
              </button>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th />
                    {items.map((p) =>
                      p ? (
                        <th key={p.id}>
                          <Link to={`/product/${p.id}`} onClick={() => setOpen(false)}>
                            {getLocalizedProductView(p, locale).name}
                          </Link>
                        </th>
                      ) : null,
                    )}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{locale === 'en' ? 'Price' : locale === 'uk' ? 'Ціна' : 'Цена'}</td>
                    {items.map((p) => (p ? <td key={p.id}>{formatMoney(p.price)}</td> : null))}
                  </tr>
                  <tr>
                    <td>{locale === 'en' ? 'Brand' : locale === 'uk' ? 'Бренд' : 'Бренд'}</td>
                    {items.map((p) => (p ? <td key={p.id}>{p.brand}</td> : null))}
                  </tr>
                  <tr>
                    <td>{locale === 'en' ? 'Rating' : locale === 'uk' ? 'Рейтинг' : 'Рейтинг'}</td>
                    {items.map((p) => (p ? <td key={p.id}>{p.rating.toFixed(1)} ★</td> : null))}
                  </tr>
                  {specKeys.map((key) => (
                    <tr key={key}>
                      <td>{localizeSpecKey(key, locale)}</td>
                      {items.map((p) => (p ? <td key={p.id}>{getLocalizedProductView(p, locale).specs[localizeSpecKey(key, locale)] ?? '—'}</td> : null))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
