import { useMemo, useState } from 'react'

import { getBrandLogoUrls, getBrandMonogram, isBrandLocalAsset } from '../utils/brandLogos'

import styles from './CatalogBrandLogo.module.css'



type Props = {

  brand: string

  className?: string

  /** Полоса-карусель: крупнее логотип и монограмма */

  variant?: 'default' | 'strip'

}



/** Логотип бренда для блока «Бренды в каталоге» (локальные SVG + Simple Icons + монограмма). */

export function CatalogBrandLogo({ brand, className, variant = 'default' }: Props) {
  return (
    <CatalogBrandLogoInner
      key={`${brand}-${variant}`}
      brand={brand}
      className={className}
      variant={variant}
    />
  )
}

function CatalogBrandLogoInner({ brand, className, variant = 'default' }: Props) {
  const urls = useMemo(() => getBrandLogoUrls(brand), [brand])

  const [urlIndex, setUrlIndex] = useState(0)

  const [failed, setFailed] = useState(false)



  const src = urls[urlIndex] ?? null

  const imgCls =

    variant === 'strip'

      ? `${styles.imgStrip} ${isBrandLocalAsset(src) ? styles.imgStripLocal : ''}`

      : styles.img

  const fbCls = variant === 'strip' ? styles.fallbackStrip : styles.fallback



  if (!urls.length || failed) {

    return (

      <span className={`${fbCls} ${className ?? ''}`} aria-hidden title={brand}>

        {getBrandMonogram(brand)}

      </span>

    )

  }



  return (

    <img

      key={`${brand}-${urlIndex}`}

      src={src!}

      alt=""

      className={`${imgCls} ${className ?? ''}`}

      loading="lazy"

      decoding="async"

      referrerPolicy="no-referrer"

      onError={() => {
        if (urlIndex < urls.length - 1) {
          setUrlIndex(urlIndex + 1)
          return
        }
        setFailed(true)
      }}

    />

  )

}


