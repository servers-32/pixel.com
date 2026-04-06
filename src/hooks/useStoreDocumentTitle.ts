import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useI18n } from '../i18n'

function titleForPath(pathname: string, t: (key: string) => string): string | null {
  if (pathname === '/') return t('seo.home')
  if (pathname === '/catalog') return t('seo.catalog')
  if (pathname === '/cart') return t('seo.cart')
  if (pathname.startsWith('/checkout')) return t('seo.checkout')
  if (pathname === '/login') return t('seo.login')
  if (pathname === '/register') return t('seo.register')
  if (pathname === '/account') return t('seo.account')
  if (pathname === '/orders') return t('seo.orders')
  if (pathname === '/about') return t('seo.about')
  if (pathname === '/delivery') return t('seo.delivery')
  if (pathname === '/contacts') return t('seo.contacts')
  if (pathname === '/analytics') return t('seo.analytics')
  if (pathname === '/admin') return t('seo.admin')
  return null
}

/** Заголовок вкладки для маршрутов магазина (кроме `/product/:id` и 404 — их задают свои страницы). */
export function useStoreDocumentTitle() {
  const { pathname } = useLocation()
  const { t } = useI18n()
  useEffect(() => {
    if (pathname.startsWith('/product/')) return
    const next = titleForPath(pathname, t)
    if (next == null) return
    document.title = next
  }, [pathname, t])
}
