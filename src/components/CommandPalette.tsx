import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './CommandPalette.module.css'
import { useShop } from '../context/useShop'
import { useI18n } from '../i18n'
import { getLocalizedProductView, getProductSearchText } from '../i18n/catalog'

type Entry = { id: string; kind: string; title: string; sub?: string; run: () => void }

export function CommandPalette() {
  const { locale } = useI18n()
  const navigate = useNavigate()
  const { products, setSearchQuery } = useShop()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const [active, setActive] = useState(0)

  const staticEntries = useMemo<Entry[]>(
    () => [
      {
        id: 'cat',
        kind: locale === 'en' ? 'Section' : locale === 'uk' ? 'Розділ' : 'Раздел',
        title: locale === 'en' ? 'Product catalog' : locale === 'uk' ? 'Каталог товарів' : 'Каталог товаров',
        sub: locale === 'en' ? 'Open catalog' : locale === 'uk' ? 'Відкрити каталог' : 'Открыть каталог',
        run: () => navigate('/catalog', { viewTransition: true }),
      },
      {
        id: 'wish',
        kind: locale === 'en' ? 'Section' : locale === 'uk' ? 'Розділ' : 'Раздел',
        title: locale === 'en' ? 'Wishlist' : locale === 'uk' ? 'Обране' : 'Избранное',
        run: () => navigate('/wishlist', { viewTransition: true }),
      },
      {
        id: 'cart',
        kind: locale === 'en' ? 'Section' : locale === 'uk' ? 'Розділ' : 'Раздел',
        title: locale === 'en' ? 'Cart' : locale === 'uk' ? 'Кошик' : 'Корзина',
        run: () => navigate('/cart', { viewTransition: true }),
      },
      {
        id: 'orders',
        kind: locale === 'en' ? 'Section' : locale === 'uk' ? 'Розділ' : 'Раздел',
        title: locale === 'en' ? 'My orders' : locale === 'uk' ? 'Мої замовлення' : 'Мои заказы',
        run: () => navigate('/orders', { viewTransition: true }),
      },
      {
        id: 'account',
        kind: locale === 'en' ? 'Section' : locale === 'uk' ? 'Розділ' : 'Раздел',
        title: locale === 'en' ? 'Account' : locale === 'uk' ? 'Особистий кабінет' : 'Личный кабинет',
        run: () => navigate('/account', { viewTransition: true }),
      },
    ],
    [navigate, locale],
  )

  const productEntries = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (s.length < 2) return [] as Entry[]
    return products
      .filter((p) => {
        return getProductSearchText(p, locale).includes(s)
      })
      .slice(0, 12)
      .map(
        (p): Entry => {
          const view = getLocalizedProductView(p, locale)
          return {
          id: `p-${p.id}`,
          kind: locale === 'en' ? 'Product' : locale === 'uk' ? 'Товар' : 'Товар',
          title: view.name,
          sub: `${p.brand} · ${view.categoryLabel}`,
          run: () => {
            navigate(`/product/${p.id}`, { viewTransition: true })
            setSearchQuery('')
          },
          }
        },
      )
  }, [products, q, navigate, setSearchQuery, locale])

  const entries = useMemo(() => {
    const s = q.trim().toLowerCase()
    const navFiltered = staticEntries.filter((e) => {
      if (!s) return true
      return `${e.title} ${e.sub ?? ''}`.toLowerCase().includes(s)
    })
    return [...productEntries, ...navFiltered]
  }, [productEntries, staticEntries, q])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((v) => {
          const next = !v
          if (next) {
            setActive(0)
          } else {
            setQ('')
            setActive(0)
          }
          return next
        })
      }
    }
    const onOpen = () => {
      setActive(0)
      setOpen(true)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('open-command-palette', onOpen)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('open-command-palette', onOpen)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const id = window.setTimeout(() => inputRef.current?.focus(), 0)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.clearTimeout(id)
      document.body.style.overflow = prev
    }
  }, [open])

  const close = useCallback(() => {
    setQ('')
    setActive(0)
    setOpen(false)
  }, [])

  const runIndex = useCallback(
    (i: number) => {
      const e = entries[i]
      if (!e) return
      e.run()
      close()
    },
    [entries, close],
  )

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActive((a) => Math.min(a + 1, Math.max(0, entries.length - 1)))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActive((a) => Math.max(a - 1, 0))
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        runIndex(active)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close, entries.length, active, runIndex])

  if (!open) return null

  return (
    <>
      <button
        type="button"
        className={styles.backdrop}
        aria-label={locale === 'en' ? 'Close' : locale === 'uk' ? 'Закрити' : 'Закрыть'}
        onClick={close}
      />
      <div className={styles.panel} role="dialog" aria-modal aria-labelledby="cmd-palette-title">
        <div className={styles.head}>
          <span id="cmd-palette-title" className="visually-hidden">
            {locale === 'en' ? 'Search and navigation' : locale === 'uk' ? 'Пошук і переходи' : 'Поиск и переходы'}
          </span>
          <input
            ref={inputRef}
            className={styles.input}
            placeholder={locale === 'en' ? 'Product, section…' : locale === 'uk' ? 'Товар, розділ…' : 'Товар, раздел…'}
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setActive(0)
            }}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <span className={styles.hint}>Esc</span>
        </div>
        <ul className={styles.list} role="listbox">
          {entries.length === 0 ? (
            <li className={styles.empty}>
              {locale === 'en' ? 'Nothing found' : locale === 'uk' ? 'Нічого не знайдено' : 'Ничего не найдено'}
            </li>
          ) : (
            entries.map((e, i) => (
              <li key={e.id} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  className={`${styles.item} ${i === active ? styles.itemActive : ''}`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => runIndex(i)}
                >
                  <span className={styles.itemKind}>{e.kind}</span>
                  <span className={styles.itemText}>
                    {e.title}
                    {e.sub ? <span className={styles.itemSub}>{e.sub}</span> : null}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </>
  )
}
