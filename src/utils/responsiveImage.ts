/** Адаптивные src/sizes для Unsplash (параметры w/h в query). */
export type ImageLayout = 'catalog' | 'detail' | 'thumb'

const SIZES: Record<ImageLayout, string> = {
  catalog: '(max-width: 380px) 100vw, (max-width: 600px) 50vw, (max-width: 1100px) 33vw, 25vw',
  detail: '(max-width: 768px) 100vw, min(52vw, 720px)',
  thumb: '80px',
}

export function responsiveUnsplashProps(
  src: string,
  layout: ImageLayout,
): { srcSet?: string; sizes?: string } {
  const trimmed = src.trim()
  if (!trimmed || !trimmed.includes('images.unsplash.com')) return {}
  try {
    const u = new URL(trimmed)
    const widths = layout === 'thumb' ? [80, 160] : [320, 480, 640, 800, 1200]
    const srcSet = widths
      .map((width) => {
        const copy = new URL(u.toString())
        copy.searchParams.set('w', String(width))
        if (copy.searchParams.has('h')) copy.searchParams.set('h', String(width))
        copy.searchParams.set('auto', 'format')
        copy.searchParams.set('fm', 'webp')
        return `${copy.toString()} ${width}w`
      })
      .join(', ')
    return { srcSet, sizes: SIZES[layout] }
  } catch {
    return {}
  }
}
