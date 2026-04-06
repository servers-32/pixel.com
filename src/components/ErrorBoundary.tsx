import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import styles from './ErrorBoundary.module.css'

type Props = { children: ReactNode }
type State = { hasError: boolean }

export class StoreErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.wrap}>
          <div className="empty-state">
            <span className="empty-state-icon" aria-hidden>
              ⚠
            </span>
            <h1 className={`empty-state-title ${styles.titleMerge}`}>Что-то пошло не так</h1>
            <p className="empty-state-text">
              Обновите страницу или вернитесь на главную — корзина и заказы сохранены в браузере.
            </p>
            <div className="empty-state-actions">
              <button type="button" className="empty-state-btn" onClick={() => window.location.reload()}>
                Обновить страницу
              </button>
              <Link to="/" className="empty-state-btn-ghost">
                На главную
              </Link>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
