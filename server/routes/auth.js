import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'
import { authJwtRequired } from '../middleware/authJwt.js'

function signToken(userId, secret, expiresIn) {
  return jwt.sign({ sub: userId }, secret, { expiresIn })
}

export function createAuthRouter({ jwtSecret, jwtExpiresIn }) {
  const r = Router()

  r.post('/register', async (req, res) => {
    try {
      const { email, password, name, phone } = req.body ?? {}
      if (!email || !password || !name) {
        return res.status(400).json({ error: 'Укажите email, пароль и имя' })
      }
      if (String(password).length < 6) {
        return res.status(400).json({ error: 'Пароль не короче 6 символов' })
      }
      const em = String(email).trim().toLowerCase()
      if (await User.findOne({ email: em })) {
        return res.status(409).json({ error: 'Аккаунт с таким email уже есть' })
      }
      const passwordHash = await bcrypt.hash(String(password), 10)
      const user = await User.create({
        email: em,
        passwordHash,
        name: String(name).trim(),
        phone: String(phone ?? '').trim(),
        loyaltyPoints: 0,
      })
      const token = signToken(user._id.toString(), jwtSecret, jwtExpiresIn)
      return res.status(201).json({ token, user: user.toPublicJSON() })
    } catch (e) {
      console.error(e)
      return res.status(500).json({ error: 'Ошибка регистрации' })
    }
  })

  r.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body ?? {}
      if (!email || !password) {
        return res.status(400).json({ error: 'Укажите email и пароль' })
      }
      const em = String(email).trim().toLowerCase()
      const user = await User.findOne({ email: em })
      if (!user || !(await bcrypt.compare(String(password), user.passwordHash))) {
        return res.status(401).json({ error: 'Неверный email или пароль' })
      }
      const token = signToken(user._id.toString(), jwtSecret, jwtExpiresIn)
      return res.json({ token, user: user.toPublicJSON() })
    } catch (e) {
      console.error(e)
      return res.status(500).json({ error: 'Ошибка входа' })
    }
  })

  r.get('/me', authJwtRequired(jwtSecret), (req, res) => {
    res.json({ user: req.userDoc.toPublicJSON() })
  })

  r.patch('/me', authJwtRequired(jwtSecret), async (req, res) => {
    try {
      const { name, phone, newPassword } = req.body ?? {}
      const u = req.userDoc
      if (name != null) u.name = String(name).trim()
      if (phone != null) u.phone = String(phone).trim()
      if (newPassword != null && String(newPassword).trim() !== '') {
        if (String(newPassword).length < 6) {
          return res.status(400).json({ error: 'Пароль не короче 6 символов' })
        }
        u.passwordHash = await bcrypt.hash(String(newPassword), 10)
      }
      await u.save()
      res.json({ user: u.toPublicJSON() })
    } catch (e) {
      console.error(e)
      res.status(500).json({ error: 'Не удалось сохранить профиль' })
    }
  })

  return r
}
