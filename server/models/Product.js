import mongoose from 'mongoose'

const specSectionSchema = new mongoose.Schema(
  {
    title: String,
    rows: [{ key: String, value: String }],
  },
  { _id: false },
)

/** Бизнес-id товара (p1, p2, …) — как во фронте */
const productSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    sku: { type: String, required: true },
    name: { type: String, required: true },
    brand: { type: String, required: true },
    price: { type: Number, required: true },
    listPrice: Number,
    badge: { type: String, enum: ['sale', 'new', 'hit', null] },
    inStock: { type: Boolean, default: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
    images: [String],
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    description: { type: String, default: '' },
    longDescription: String,
    specs: { type: mongoose.Schema.Types.Mixed, default: {} },
    specSections: [specSectionSchema],
  },
  { _id: false },
)

productSchema.methods.toClientProduct = function toClientProduct() {
  const specsObj =
    this.specs && typeof this.specs === 'object' && !(this.specs instanceof Map)
      ? { ...this.specs }
      : this.specs instanceof Map
        ? Object.fromEntries(this.specs)
        : {}
  return {
    id: this._id,
    sku: this.sku,
    name: this.name,
    brand: this.brand,
    price: this.price,
    listPrice: this.listPrice,
    badge: this.badge,
    inStock: this.inStock,
    category: this.category,
    image: this.image,
    images: this.images?.length ? this.images : undefined,
    rating: this.rating,
    reviewsCount: this.reviewsCount,
    description: this.description,
    longDescription: this.longDescription,
    specs: specsObj,
    specSections: this.specSections?.length ? this.specSections : undefined,
  }
}

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema)
