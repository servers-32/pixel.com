import { useCallback, useState, type ImgHTMLAttributes, type SyntheticEvent } from 'react'
import { responsiveUnsplashProps, type ImageLayout } from '../utils/responsiveImage'
import styles from './SafeImage.module.css'

const PLACEHOLDER = '/placeholder-product.svg'

export type SafeImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string
  /** Подбор srcset/sizes для Unsplash */
  layout?: ImageLayout
}

export function SafeImage({
  src,
  onError,
  onLoad,
  fallbackSrc = PLACEHOLDER,
  layout,
  className,
  ...rest
}: SafeImageProps) {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const handleError = useCallback(
    (e: SyntheticEvent<HTMLImageElement>) => {
      onError?.(e)
      setFailed(true)
    },
    [onError],
  )
  const handleLoad = useCallback(
    (e: SyntheticEvent<HTMLImageElement>) => {
      setLoaded(true)
      onLoad?.(e)
    },
    [onLoad],
  )
  const raw = typeof src === 'string' ? src.trim() : ''
  const effective = !raw || failed ? fallbackSrc : raw
  const responsive =
    layout && raw && !failed ? responsiveUnsplashProps(raw, layout) : { srcSet: undefined, sizes: undefined }

  const showBlur = !failed && raw && !loaded

  return (
    <span className={styles.wrap}>
      <img
        {...rest}
        className={[styles.img, showBlur ? styles.imgLoading : styles.imgLoaded, className].filter(Boolean).join(' ')}
        src={effective}
        srcSet={responsive.srcSet}
        sizes={responsive.sizes}
        onError={handleError}
        onLoad={handleLoad}
      />
    </span>
  )
}
