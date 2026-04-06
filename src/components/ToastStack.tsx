import styles from './ToastStack.module.css'
import { useShop } from '../context/useShop'

export function ToastStack() {
  const { toasts } = useShop()

  if (toasts.length === 0) return null

  return (
    <div className={styles.host} role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`${styles.toast} ${styles[t.variant]}`}>
          {t.message}
        </div>
      ))}
    </div>
  )
}
