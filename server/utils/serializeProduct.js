export function serializeProduct(doc) {
  if (!doc) return null
  const specs =
    doc.specs && typeof doc.specs === 'object' && !Array.isArray(doc.specs) ? { ...doc.specs } : {}
  return {
    id: doc._id,
    sku: doc.sku,
    name: doc.name,
    brand: doc.brand,
    price: doc.price,
    listPrice: doc.listPrice,
    badge: doc.badge || undefined,
    inStock: doc.inStock !== false,
    category: doc.category,
    image: doc.image,
    images: doc.images?.length ? doc.images : undefined,
    rating: doc.rating ?? 0,
    reviewsCount: doc.reviewsCount ?? 0,
    description: doc.description ?? '',
    longDescription: doc.longDescription,
    specs,
    specSections: doc.specSections?.length ? doc.specSections : undefined,
  }
}
