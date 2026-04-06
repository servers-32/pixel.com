import { Link } from 'react-router-dom'
import styles from './Breadcrumbs.module.css'
import { useI18n } from '../i18n'

export type Crumb = { label: string; to?: string; onClick?: () => void }

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const { locale } = useI18n()
  return (
    <nav
      className={styles.nav}
      aria-label={locale === 'en' ? 'Breadcrumbs' : locale === 'uk' ? 'Хлібні крихти' : 'Хлебные крошки'}
    >
      <ol className={styles.list}>
        {items.map((c, i) => (
          <li key={`${c.label}-${i}`} className={styles.item}>
            {i > 0 ? <span className={styles.sep} aria-hidden>/</span> : null}
            {c.to ? (
              <Link className={styles.link} to={c.to} onClick={c.onClick}>
                {c.label}
              </Link>
            ) : (
              <span className={styles.current}>{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
