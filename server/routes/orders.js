import { Router } from 'express'
import mongoose from 'mongoose'
import { Order } from '../models/Order.js'
import { User } from '../models/User.js'
import { authJwtOptional, authJwtRequired } from '../middleware/authJwt.js'

export function createOrdersRouter({ jwtSecret }) {
  const r = Router()

  r.post('/', authJwtOptional(jwtSecret), async (req, res) => {
    try {
      const body = req.body ?? {}
      const {
        customer,
        lines,
        total,
        discount,
        paymentMethod,
        installmentMonths,
        installmentAnnualRatePercent,
        installmentMonthlyPayment,
        installmentTotalPayable,
        cardLast4,
        loyaltyPointsSpent,
        loyaltyPointsEarned,
        loyaltyDiscount,
      } = body

      if (!customer || !Array.isArray(lines) || lines.length === 0) {
        return res.status(400).json({ error: 'Некорректные данные заказа' })
      }
      if (typeof total !== 'number' || total < 0) {
        return res.status(400).json({ error: 'Некорректная сумма' })
      }

      const userId = req.user?.id ? req.user.id : null

      const order = await Order.create({
        userId: userId ? new mongoose.Types.ObjectId(userId) : null,
        customer,
        lines,
        total,
        discount,
        paymentMethod,
        installmentMonths,
        installmentAnnualRatePercent,
        installmentMonthlyPayment,
        installmentTotalPayable,
        cardLast4,
        loyaltyPointsSpent,
        loyaltyPointsEarned,
        loyaltyDiscount,
      })

      if (userId && (loyaltyPointsSpent > 0 || loyaltyPointsEarned > 0)) {
        const u = await User.findById(userId)
        if (u) {
          const spent = Number(loyaltyPointsSpent) || 0
          const earned = Number(loyaltyPointsEarned) || 0
          u.loyaltyPoints = Math.max(0, (u.loyaltyPoints ?? 0) - spent + earned)
          await u.save()
        }
      }

      res.status(201).json({ order: order.toClientOrder() })
    } catch (e) {
      console.error(e)
      res.status(500).json({ error: 'Не удалось оформить заказ' })
    }
  })

  r.get('/my', authJwtRequired(jwtSecret), async (req, res) => {
    try {
      const list = await Order.find({ userId: req.userDoc._id }).sort({ createdAt: -1 })
      const orders = list.map((o) => o.toClientOrder())
      res.json({ orders })
    } catch (e) {
      console.error(e)
      res.status(500).json({ error: 'Не удалось загрузить заказы' })
    }
  })

  return r
}
