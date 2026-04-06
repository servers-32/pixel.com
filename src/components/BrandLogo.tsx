import { Link } from 'react-router-dom'
import { PixelWordmark } from './PixelWordmark'
import type { PixelWordmarkVariant } from './PixelWordmark'
import styles from './BrandLogo.module.css'

export type BrandLogoVariant = 'header' | 'footer' | 'drawer'

type Props = {
  variant?: BrandLogoVariant
  to: string
  onNavigate?: () => void
}

function toWordmarkVariant(v: BrandLogoVariant): PixelWordmarkVariant {
  if (v === 'drawer') return 'compact'
  return v
}

export function BrandLogo({ variant = 'header', to, onNavigate }: Props) {
  return (
    <Link
      to={to}
      className={`${styles.link} ${styles[variant]}`}
      viewTransition
      onClick={() => onNavigate?.()}
      aria-label="PiXEL — на главную"
    >
      <span className={styles.mark} aria-hidden>
        <PixelWordmark variant={toWordmarkVariant(variant)} />
      </span>
    </Link>
  )
}
