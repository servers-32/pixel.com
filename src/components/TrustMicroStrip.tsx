import styles from './TrustMicroStrip.module.css'

type Props = {
  variant?: 'default' | 'compact'
}

/** Короткие опоры доверия рядом с CTA */
export function TrustMicroStrip({ variant = 'default' }: Props) {
  return (
    <ul className={variant === 'compact' ? styles.listCompact : styles.list} aria-label="Условия магазина">
      <li className={styles.item}>Гарантия от магазина</li>
      <li className={styles.item}>Проверка перед отправкой</li>
      <li className={styles.item}>Возврат по закону</li>
    </ul>
  )
}
