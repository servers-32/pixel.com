import styles from './RouteFallback.module.css'

export function RouteFallback() {
  return (
    <div className={styles.wrap} role="status" aria-live="polite" aria-label="Загрузка страницы">
      <div className={styles.card}>
        <div className={`${styles.shimmer} ${styles.hero}`} />
        <div className={styles.row}>
          <div className={`${styles.shimmer} ${styles.block}`} />
          <div className={`${styles.shimmer} ${styles.block}`} />
        </div>
        <div className={`${styles.shimmer} ${styles.line}`} />
        <div className={`${styles.shimmer} ${styles.lineShort}`} />
      </div>
      <p className={styles.text}>Загрузка…</p>
    </div>
  )
}
