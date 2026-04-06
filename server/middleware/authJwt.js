import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'

export function authJwtOptional(secret) {
  return async (req, _res, next) => {
    req.user = null
    const h = req.headers.authorization
    if (!h?.startsWith('Bearer ')) return next()
    const token = h.slice(7)
    try {
      const payload = jwt.verify(token, secret)
      const id = payload.sub
      if (!id) return next()
      const user = await User.findById(id).lean()
      if (user) req.user = { id: user._id.toString(), email: user.email }
    } catch {
      /* ignore */
    }
    next()
  }
}

export function authJwtRequired(secret) {
  return async (req, res, next) => {
    const h = req.headers.authorization
    if (!h?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Требуется авторизация' })
    }
    const token = h.slice(7)
    try {
      const payload = jwt.verify(token, secret)
      const user = await User.findById(payload.sub)
      if (!user) return res.status(401).json({ error: 'Пользователь не найден' })
      req.userDoc = user
      req.user = { id: user._id.toString(), email: user.email }
      next()
    } catch {
      return res.status(401).json({ error: 'Недействительный токен' })
    }
  }
}
