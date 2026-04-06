import type { Product } from '../types'

/** Только главное фото — поле `image` (без дополнительных из `images`). */
export function productImages(p: Product): string[] {
  const primary = (p.image ?? '').trim()
  if (primary) return [primary]
  const fallback = p.images?.[0]?.trim()
  return fallback ? [fallback] : []
}

export function productPrimaryImage(p: Product): string {
  return productImages(p)[0] ?? ''
}
