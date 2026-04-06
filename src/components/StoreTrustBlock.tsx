import { Link } from 'react-router-dom'
import { IconCreditCard, IconHeadset, IconShield, IconTruck } from './HeaderIcons'
import styles from './StoreTrustBlock.module.css'
import { useI18n } from '../i18n'

type Props = {
  className?: string
}

/** Блок рейтинга + доставка/оплата/гарантия/поддержка (как на главной) */
export function StoreTrustBlock({ className }: Props) {
  const { locale } = useI18n()

  const ariaTrust =
    locale === 'en'
      ? 'Rating 4.8 out of 5, more than 12 thousand reviews, more than 860 thousand orders'
      : locale === 'uk'
        ? 'Рейтинг 4,8 з 5, понад 12 тисяч відгуків, понад 860 тисяч замовлень'
        : 'Рейтинг 4,8 из 5, более 12 тысяч отзывов, более 860 тысяч заказов'

  const reviewsLabel =
    locale === 'en' ? '12,400+ reviews' : locale === 'uk' ? '12 400+ відгуків' : '12 400+ отзывов'

  const ordersLabel =
    locale === 'en' ? '860,000+ orders' : locale === 'uk' ? '860 000+ замовлень' : '860 000+ заказов'

  const tagline =
    locale === 'en' ? 'User trust' : locale === 'uk' ? 'Довіра користувачів' : 'Доверие пользователей'

  const sectionLabel =
    locale === 'en' ? 'Why customers trust us' : locale === 'uk' ? 'Чому нам довіряють' : 'Почему нам доверяют'

  const deliveryTitle = locale === 'en' ? 'Delivery' : locale === 'uk' ? 'Доставка' : 'Доставка'
  const deliveryText =
    locale === 'en'
      ? 'courier and pickup points across Ukraine'
      : locale === 'uk'
        ? 'курʼєром і в пункти видачі по Україні'
        : 'курьером и в пункты выдачи по Украине'

  const paymentTitle = locale === 'en' ? 'Payment' : locale === 'uk' ? 'Оплата' : 'Оплата'
  const paymentText =
    locale === 'en'
      ? 'card, Apple Pay / Google Pay, pay on delivery'
      : locale === 'uk'
        ? 'картка, Apple Pay / Google Pay, при отриманні'
        : 'карта, Apple Pay / Google Pay, при получении'

  const warrantyTitle = locale === 'en' ? 'Warranty' : locale === 'uk' ? 'Гарантія' : 'Гарантия'
  const warrantyText =
    locale === 'en'
      ? 'official coverage by law and manufacturer'
      : locale === 'uk'
        ? 'офіційно за законом і від виробника'
        : 'официально по закону и от производителя'

  const supportTitle = locale === 'en' ? 'Support' : locale === 'uk' ? 'Підтримка' : 'Поддержка'
  const supportText =
    locale === 'en'
      ? '0 800 123 456 · daily 9:00–21:00'
      : locale === 'uk'
        ? '0 800 123 456 · щодня 9:00–21:00'
        : '0 800 123 456 · ежедневно 9:00–21:00'

  return (
    <section className={`${styles.root} ${className ?? ''}`} aria-label={sectionLabel}>
      <div className={styles.inner}>
        <div className={styles.rating} role="img" aria-label={ariaTrust}>
          <div className={styles.ratingScoreRow}>
            <span className={styles.score}>4,8</span>
            <span className={styles.stars} aria-hidden>
              ★★★★☆
            </span>
          </div>
          <div className={styles.ratingMeta}>
            <span className={styles.reviews}>{reviewsLabel}</span>
            <span className={styles.orders}>{ordersLabel}</span>
            <span className={styles.tagline}>{tagline}</span>
          </div>
        </div>
        <div className={styles.grid}>
          <Link to="/delivery" className={styles.item} viewTransition>
            <span className={styles.ico} aria-hidden>
              <IconTruck />
            </span>
            <div>
              <strong>{deliveryTitle}</strong>
              <span>{deliveryText}</span>
            </div>
          </Link>
          <Link to="/about" className={styles.item} viewTransition>
            <span className={styles.ico} aria-hidden>
              <IconCreditCard />
            </span>
            <div>
              <strong>{paymentTitle}</strong>
              <span>{paymentText}</span>
            </div>
          </Link>
          <Link to="/about" className={styles.item} viewTransition>
            <span className={styles.ico} aria-hidden>
              <IconShield />
            </span>
            <div>
              <strong>{warrantyTitle}</strong>
              <span>{warrantyText}</span>
            </div>
          </Link>
          <Link to="/contacts" className={styles.item} viewTransition>
            <span className={styles.ico} aria-hidden>
              <IconHeadset />
            </span>
            <div>
              <strong>{supportTitle}</strong>
              <span>{supportText}</span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}
