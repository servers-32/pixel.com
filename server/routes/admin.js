import { Router } from 'express'
import { Product } from '../models/Product.js'
import { adminKey } from '../middleware/adminKey.js'
import { serializeProduct } from '../utils/serializeProduct.js'

export function createAdminRouter(adminApiKey) {
  const r = Router()
  r.use(adminKey(adminApiKey))

  r.post('/products', async (req, res) => {
    try {
      const p = req.body
      if (!p?.id || !p?.sku || !p?.name) {
        return res.status(400).json({ error: 'Нужны id, sku, name' })
      }
      const exists = await Product.findById(p.id)
      if (exists) return res.status(409).json({ error: 'Товар с таким id уже есть' })
      await Product.create({
        _id: p.id,
        sku: p.sku,
        name: p.name,
        brand: p.brand ?? '',
        price: Number(p.price) || 0,
        listPrice: p.listPrice != null ? Number(p.listPrice) : undefined,
        badge: p.badge || undefined,
        inStock: p.inStock !== false,
        category: p.category ?? 'Смартфоны',
        image: p.image ?? '',
        images: Array.isArray(p.images) ? p.images : undefined,
        rating: Number(p.rating) || 0,
        reviewsCount: Number(p.reviewsCount) || 0,
        description: p.description ?? '',
        longDescription: p.longDescription,
        specs: p.specs && typeof p.specs === 'object' ? p.specs : {},
        specSections: Array.isArray(p.specSections) ? p.specSections : undefined,
      })
      const doc = await Product.findById(p.id).lean()
      res.status(201).json({ product: serializeProduct(doc) })
    } catch (e) {
      console.error(e)
      res.status(500).json({ error: 'Не удалось создать товар' })
    }
  })

  r.patch('/products/:id', async (req, res) => {
    try {
      const doc = await Product.findById(req.params.id)
      if (!doc) return res.status(404).json({ error: 'Не найден' })
      const patch = req.body ?? {}
      const allowed = [
        'sku',
        'name',
        'brand',
        'price',
        'listPrice',
        'badge',
        'inStock',
        'category',
        'image',
        'images',
        'rating',
        'reviewsCount',
        'description',
        'longDescription',
        'specs',
        'specSections',
      ]
      for (const k of allowed) {
        if (Object.prototype.hasOwnProperty.call(patch, k)) {
          doc[k] = patch[k]
        }
      }
      if (Object.prototype.hasOwnProperty.call(patch, 'specs')) doc.markModified('specs')
      await doc.save()
      const lean = await Product.findById(doc._id).lean()
      res.json({ product: serializeProduct(lean) })
    } catch (e) {
      console.error(e)
      res.status(500).json({ error: 'Ошибка сохранения' })
    }
  })

  r.delete('/products/:id', async (req, res) => {
    try {
      const r0 = await Product.findByIdAndDelete(req.params.id)
      if (!r0) return res.status(404).json({ error: 'Не найден' })
      res.status(204).end()
    } catch (e) {
      console.error(e)
      res.status(500).json({ error: 'Ошибка удаления' })
    }
  })

  return r
}
