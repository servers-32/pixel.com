/**
 * Заполнение MongoDB каталогом из фронтового mockData.
 * Запуск из папки server: npm run seed
 * Требуется .env с MONGODB_URI (или переменные окружения).
 */
import 'dotenv/config'
import mongoose from 'mongoose'
import { PRODUCTS } from '../src/data/mockData'
import { Product } from './models/Product.js'
import { connectDb } from './db.js'

async function run() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('Задайте MONGODB_URI в server/.env')
    process.exit(1)
  }
  await connectDb(uri)
  let n = 0
  for (const p of PRODUCTS) {
    await Product.replaceOne(
      { _id: p.id },
      {
        _id: p.id,
        sku: p.sku,
        name: p.name,
        brand: p.brand,
        price: p.price,
        listPrice: p.listPrice,
        badge: p.badge,
        inStock: p.inStock,
        category: p.category,
        image: p.image,
        images: p.images,
        rating: p.rating,
        reviewsCount: p.reviewsCount,
        description: p.description,
        longDescription: p.longDescription,
        specs: p.specs ?? {},
        specSections: p.specSections,
      },
      { upsert: true },
    )
    n++
  }
  console.log(`Seed OK: ${n} товаров`)
  await mongoose.disconnect()
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
