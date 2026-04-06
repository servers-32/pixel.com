import { Router } from 'express'
import { Product } from '../models/Product.js'
import { serializeProduct } from '../utils/serializeProduct.js'

export function createProductsRouter() {
  const r = Router()

  r.get('/', async (_req, res) => {
    try {
      const list = await Product.find().lean()
      const out = list.map((doc) => serializeProduct(doc))
      res.json({ products: out })
    } catch (e) {
      console.error(e)
      res.status(500).json({ error: 'Не удалось загрузить каталог' })
    }
  })

  r.get('/:id', async (req, res) => {
    try {
      const doc = await Product.findById(req.params.id).lean()
      if (!doc) return res.status(404).json({ error: 'Товар не найден' })
      res.json({ product: serializeProduct(doc) })
    } catch (e) {
      console.error(e)
      res.status(500).json({ error: 'Ошибка' })
    }
  })

  return r
}
