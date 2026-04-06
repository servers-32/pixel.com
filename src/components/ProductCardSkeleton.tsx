import styles from './ProductCardSkeleton.module.css'

export function ProductCardSkeleton() {
  return (
    <article className={styles.card} aria-hidden>
      <div className={styles.imageBlock}>
        <div className={`${styles.imagePh} ${styles.ph}`} />
      </div>
      <div className={styles.body}>
        <div className={`${styles.lineSm} ${styles.ph}`} />
        <div className={`${styles.lineLg} ${styles.ph}`} />
        <div className={`${styles.lineMd} ${styles.ph}`} />
        <div className={styles.specBlock} aria-hidden>
          <div className={`${styles.specChip} ${styles.ph}`} />
          <div className={`${styles.specChip} ${styles.ph}`} />
          <div className={`${styles.specChip} ${styles.ph}`} />
        </div>
        <div className={`${styles.ratingLine} ${styles.ph}`} />
      </div>
      <div className={styles.footer}>
        <div className={`${styles.btnPh} ${styles.ph}`} />
        <div className={`${styles.btnGhost} ${styles.ph}`} />
      </div>
    </article>
  )
}
