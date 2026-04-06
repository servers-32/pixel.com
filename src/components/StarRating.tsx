import styles from './StarRating.module.css'

export function StarRating({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' }) {
  const full = Math.floor(value)
  const frac = value - full
  const stars = [0, 1, 2, 3, 4]

  return (
    <span className={`${styles.wrap} ${styles[size]}`} title={`Рейтинг ${value.toFixed(1)} из 5`}>
      {stars.map((i) => {
        let fill = 0
        if (i < full) fill = 1
        else if (i === full) fill = frac
        return (
          <span key={i} className={styles.star} aria-hidden>
            <span className={styles.bg}>★</span>
            <span className={styles.fg} style={{ width: `${fill * 100}%` }}>
              ★
            </span>
          </span>
        )
      })}
      <span className={styles.num}>{value.toFixed(1)}</span>
    </span>
  )
}
