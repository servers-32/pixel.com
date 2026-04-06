export function adminKey(adminKeyEnv) {
  return (req, res, next) => {
    const key = adminKeyEnv?.trim()
    if (!key) {
      return res.status(503).json({ error: 'ADMIN_API_KEY не настроен на сервере' })
    }
    const sent = req.headers['x-admin-key']
    if (sent !== key) {
      return res.status(403).json({ error: 'Нет доступа' })
    }
    next()
  }
}
