import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { connectDb } from './db.js'
import { createAuthRouter } from './routes/auth.js'
import { createProductsRouter } from './routes/products.js'
import { createOrdersRouter } from './routes/orders.js'
import { createAdminRouter } from './routes/admin.js'

const PORT = Number(process.env.PORT) || 4000
const MONGODB_URI = process.env.MONGODB_URI
const JWT_SECRET = process.env.JWT_SECRET || 'dev-change-me-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173'
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || ''

async function main() {
  await connectDb(MONGODB_URI)

  const app = express()
  app.use(
    cors({
      origin: CLIENT_ORIGIN.split(',').map((s) => s.trim()),
      credentials: true,
    }),
  )
  app.use(express.json({ limit: '2mb' }))

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true })
  })

  app.use('/api/auth', createAuthRouter({ jwtSecret: JWT_SECRET, jwtExpiresIn: JWT_EXPIRES_IN }))
  app.use('/api/products', createProductsRouter())
  app.use('/api/orders', createOrdersRouter({ jwtSecret: JWT_SECRET }))
  app.use('/api/admin', createAdminRouter(ADMIN_API_KEY))

  app.use((err, _req, res, _next) => {
    console.error(err)
    res.status(500).json({ error: 'Внутренняя ошибка' })
  })

  app.listen(PORT, () => {
    console.log(`API http://localhost:${PORT}  (CORS: ${CLIENT_ORIGIN})`)
  })
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
