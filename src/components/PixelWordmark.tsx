import styles from './PixelWordmark.module.css'

export type PixelWordmarkVariant = 'header' | 'footer' | 'compact'

type Props = {
  variant?: PixelWordmarkVariant
  /** Для скринридеров; пустая строка — декоративный логотип без role="img" */
  label?: string
}

/**
 * Логотип PiXEL: P/E/L — цвет текста, «i» с фиолетовой точкой, «X» с градиентом и мягким свечением.
 */
export function PixelWordmark({ variant = 'header', label = 'PiXEL' }: Props) {
  const a11y = label === '' ? {} : { role: 'img' as const, 'aria-label': label }
  return (
    <span className={`${styles.root} ${styles[variant]}`} {...a11y}>
      <span className={styles.letter}>P</span>
      <span className={styles.i}>
        <span className={styles.iDot} />
        <span className={styles.iBar} />
      </span>
      <span className={styles.x}>X</span>
      <span className={styles.letter}>E</span>
      <span className={styles.letter}>L</span>
    </span>
  )
}
