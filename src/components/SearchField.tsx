import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconClear, IconSearch } from './HeaderIcons'
import { useShop } from '../context/useShop'
import { formatMoney } from '../utils/formatMoney'
import { productPrimaryImage } from '../utils/productImages'
import styles from './SearchField.module.css'
import { useI18n, type Locale } from '../i18n'

const POPULAR_QUERIES = ['наушники', 'Samsung', 'ноутбук', 'iPhone', 'телевизор', 'Sony']

function normalize(s: string) {
  return s.trim().toLowerCase()
}

type Props = { className?: string; lang?: Locale }

export function SearchField({ className, lang: langProp }: Props) {
  const { locale } = useI18n()
  const lang = langProp ?? locale
  const { searchQuery, setSearchQuery, products, applyCatalogFilters } = useShop()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  const matches = useMemo(() => {
    const q = normalize(searchQuery)
    if (q.length < 2) return []
    return products
      .filter(
        (p) =>
          normalize(p.name).includes(q) ||
          normalize(p.brand).includes(q) ||
          normalize(p.sku).includes(q),
      )
      .slice(0, 5)
  }, [searchQuery, products])

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  function applyQuery(q: string) {
    setSearchQuery(q)
    setOpen(false)
    applyCatalogFilters({ searchOverride: q })
    navigate('/catalog', { viewTransition: true })
  }

  function submitSearch() {
    setOpen(false)
    applyCatalogFilters()
    navigate('/catalog', { viewTransition: true })
  }

  const copy = {
    uk: {
      placeholder: 'Я шукаю…',
      findLabel: 'Знайти',
      searchAria: 'Пошук товарів',
      paletteLabel: 'Розділи',
      paletteAria: 'Підказки по розділах і швидких командах (Ctrl+K)',
      paletteTitle: 'Відкрити підказки по розділах',
      clearAria: 'Очистити поле пошуку',
      dropdownAria: 'Підказки пошуку',
      popular: 'Популярні запити',
      products: 'Товари',
      noResults: 'Нічого не знайдено — спробуйте інший запит або зніміть фільтри в каталозі.',
      previewHint: 'Введіть від 2 літер для превью товарів. Enter — перейти в каталог.',
    },
    ru: {
      placeholder: 'Я ищу…',
      findLabel: 'Найти',
      searchAria: 'Поиск товаров',
      paletteLabel: 'Разделы',
      paletteAria: 'Подсказки по разделам и быстрым командам (Ctrl+K)',
      paletteTitle: 'Открыть подсказки по разделам',
      clearAria: 'Очистить поле поиска',
      dropdownAria: 'Подсказки поиска',
      popular: 'Популярные запросы',
      products: 'Товары',
      noResults: 'Ничего не найдено — попробуйте другой запрос или снимите фильтры в каталоге.',
      previewHint: 'Введите от 2 букв для превью товаров. Enter — перейти в каталог.',
    },
    en: {
      placeholder: 'I am looking for…',
      findLabel: 'Find',
      searchAria: 'Product search',
      paletteLabel: 'Sections',
      paletteAria: 'Section hints and quick commands (Ctrl+K)',
      paletteTitle: 'Open section hints',
      clearAria: 'Clear search field',
      dropdownAria: 'Search suggestions',
      popular: 'Popular searches',
      products: 'Products',
      noResults: 'Nothing found. Try another query or clear catalog filters.',
      previewHint: 'Type at least 2 letters to preview products. Press Enter to open the catalog.',
    },
  } as const
  const t = copy[lang]

  return (
    <div className={`${styles.wrap} ${className ?? ''}`} ref={wrapRef}>
      <form
        className={styles.rozetkaBar}
        data-filled={searchQuery.trim().length > 0 ? '' : undefined}
        onSubmit={(e) => {
          e.preventDefault()
          submitSearch()
        }}
      >
        <div className={styles.inputSegment}>
          <span className={styles.searchLead} aria-hidden>
            <IconSearch />
          </span>
          <label className={styles.searchField}>
            <span className="visually-hidden">{t.searchAria}</span>
            <input
              type="text"
              inputMode="search"
              enterKeyHint="search"
              placeholder={t.placeholder}
              value={searchQuery}
              autoComplete="off"
              role="searchbox"
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setOpen(false)
                }
              }}
            />
          </label>
          {searchQuery.trim().length > 0 ? (
            <button
              type="button"
              className={styles.clearBtn}
              aria-label={t.clearAria}
              onClick={() => {
                setSearchQuery('')
                setOpen(true)
              }}
            >
              <IconClear />
            </button>
          ) : null}
          <button
            type="button"
            className={styles.micBtn}
            aria-label={t.paletteAria}
            title={t.paletteTitle}
            onClick={() => window.dispatchEvent(new Event('open-command-palette'))}
          >
            <span className={styles.micBtnText}>{t.paletteLabel}</span>
            <span className={styles.micBtnShortcut} aria-hidden>
              Ctrl+K
            </span>
          </button>
        </div>
        <button type="submit" className={styles.findBtn}>
          {t.findLabel}
        </button>
      </form>

      {open ? (
        <div className={styles.dropdown} role="listbox" aria-label={t.dropdownAria}>
          {searchQuery.trim().length < 2 ? (
            <div className={styles.dropSection}>
              <p className={styles.dropLabel}>{t.popular}</p>
              <div className={styles.chipRow}>
                {POPULAR_QUERIES.map((q) => (
                  <button key={q} type="button" className={styles.chip} onClick={() => applyQuery(q)}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {searchQuery.trim().length >= 2 && matches.length > 0 ? (
            <div className={styles.dropSection}>
              <p className={styles.dropLabel}>{t.products}</p>
              <ul className={styles.resultList}>
                {matches.map((p) => {
                  const img = productPrimaryImage(p)
                  return (
                    <li key={p.id} className={styles.resultItem}>
                      <Link
                        to={`/product/${p.id}`}
                        className={styles.resultLink}
                        viewTransition
                        onClick={() => setOpen(false)}
                      >
                        {img ? (
                          <img src={img} alt="" className={styles.resultThumb} loading="lazy" />
                        ) : (
                          <span className={styles.resultThumb} aria-hidden />
                        )}
                        <div className={styles.resultMeta}>
                          <div className={styles.resultName}>{p.name}</div>
                          <div className={styles.resultPrice}>{formatMoney(p.price)}</div>
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ) : null}

          {searchQuery.trim().length >= 2 && matches.length === 0 ? (
            <p className={styles.dropHint}>{t.noResults}</p>
          ) : null}

          {searchQuery.trim().length < 2 ? (
            <p className={styles.dropHint}>{t.previewHint}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
