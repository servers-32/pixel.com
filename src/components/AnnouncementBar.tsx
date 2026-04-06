import { useState } from 'react'
import styles from './AnnouncementBar.module.css'
import { ShopBagGlyph } from './ShopBagGlyph'
import { useI18n } from '../i18n'

const KEY = 'es-announce-v1'

export function AnnouncementBar() {
  const { locale } = useI18n()
  const [hidden, setHidden] = useState(() => sessionStorage.getItem(KEY) === '1')

  const copy =
    locale === 'en'
      ? {
          badge: 'Sale',
          text: 'Free delivery across Ukraine for orders from',
          tail: 'Installment plan 12% annual for smartphones',
          close: 'Close announcement',
        }
      : locale === 'uk'
        ? {
            badge: 'Акція',
            text: 'Безкоштовна доставка по Україні при замовленні від',
            tail: 'Розстрочка 12% річних на смартфони',
            close: 'Закрити оголошення',
          }
        : {
            badge: 'Акция',
            text: 'Бесплатная доставка по Украине при заказе от',
            tail: 'Рассрочка 12% годовых на смартфоны',
            close: 'Закрыть объявление',
          }

  if (hidden) return null

  return (
    <div className={styles.bar}>
      <p className={styles.text}>
        <span className={styles.icon} aria-hidden>
          <ShopBagGlyph width={18} height={18} className={styles.bagIcon} />
        </span>
        <span className={styles.badge}>{copy.badge}</span>
        <span className={styles.lead}>{copy.text}</span>
        <strong className={styles.amount}>25&nbsp;000&nbsp;грн</strong>
        <span className={styles.dot} aria-hidden>
          ·
        </span>
        <span className={styles.tail}>{copy.tail}</span>
      </p>
      <button
        type="button"
        className={styles.close}
        aria-label={copy.close}
        onClick={() => {
          sessionStorage.setItem(KEY, '1')
          setHidden(true)
        }}
      >
        ×
      </button>
    </div>
  )
}
