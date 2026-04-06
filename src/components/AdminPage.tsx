import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { Product, ProductBadge } from '../types'
import { useShop } from '../context/useShop'
import { randomId } from '../utils/randomId'
import { normalizeProduct, normalizeProductList } from '../utils/productNormalize'
import { formatMoney } from '../utils/formatMoney'
import { productPrimaryImage } from '../utils/productImages'
import styles from './AdminPage.module.css'

const SESSION_KEY = 'es-admin-session'
const ADMIN_PASSWORD =
  typeof import.meta.env !== 'undefined' && import.meta.env.VITE_ADMIN_PASSWORD
    ? String(import.meta.env.VITE_ADMIN_PASSWORD)
    : 'admin'

type SpecRow = { rid: string; key: string; value: string }

function specsToRows(specs: Record<string, string>): SpecRow[] {
  return Object.entries(specs).map(([key, value]) => ({
    rid: randomId(),
    key,
    value,
  }))
}

function rowsToSpecs(rows: SpecRow[]): Record<string, string> {
  const o: Record<string, string> = {}
  for (const r of rows) {
    const k = r.key.trim()
    if (!k) continue
    o[k] = r.value.trim()
  }
  return Object.keys(o).length ? o : { Наличие: 'На складе' }
}

const DEFAULT_PHOTO_LINES = [
  'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&h=800&fit=crop&q=80',
  'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&h=800&fit=crop&q=80',
  'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&h=800&fit=crop&q=80',
  'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&h=800&fit=crop&q=80',
].join('\n')

function createDraft(categories: string[]): Product {
  const cat = categories[0] ?? 'Смартфоны'
  const urls = DEFAULT_PHOTO_LINES.split('\n').map((s) => s.trim()).filter(Boolean)
  const p = normalizeProduct({
    id: randomId(),
    sku: `SKU-${Date.now().toString(36).toUpperCase()}`,
    name: '',
    brand: '',
    price: 0,
    category: cat,
    inStock: true,
    image: urls[0],
    images: urls,
    rating: 4.5,
    reviewsCount: 0,
    description: '',
    specs: { Наличие: 'На складе', Гарантия: '12 мес.' },
  })
  return p!
}

export function AdminPage() {
  const {
    products,
    categories,
    brands,
    updateProduct,
    addProduct,
    deleteProduct,
    replaceAllProducts,
    resetProductsToDefault,
    adjustAllPricesByPercent,
    pushToast,
  } = useShop()

  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1')
  const [pw, setPw] = useState('')
  const [filter, setFilter] = useState('')
  const [bulkPct, setBulkPct] = useState('0')
  const [importText, setImportText] = useState('')
  const [importOpen, setImportOpen] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [editingOriginalId, setEditingOriginalId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Product | null>(null)
  const [specRows, setSpecRows] = useState<SpecRow[]>([])
  const [photoLines, setPhotoLines] = useState('')

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (p) =>
        `${p.name} ${p.sku} ${p.brand} ${p.category} ${p.id}`.toLowerCase().includes(q),
    )
  }, [products, filter])

  /** Не даём прокручивать страницу под модалкой (колёсико / тач) и сохраняем позицию скролла. */
  useEffect(() => {
    if (!formOpen) return
    const scrollY = window.scrollY
    const html = document.documentElement
    const body = document.body
    const prevHtmlOverflow = html.style.overflow
    const prevBodyOverflow = body.style.overflow
    const prevBodyPosition = body.style.position
    const prevBodyTop = body.style.top
    const prevBodyWidth = body.style.width
    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.width = '100%'
    return () => {
      html.style.overflow = prevHtmlOverflow
      body.style.overflow = prevBodyOverflow
      body.style.position = prevBodyPosition
      body.style.top = prevBodyTop
      body.style.width = prevBodyWidth
      window.scrollTo(0, scrollY)
    }
  }, [formOpen])

  function login(e: FormEvent) {
    e.preventDefault()
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1')
      setAuthed(true)
      setPw('')
      pushToast('Добро пожаловать в админку', 'success')
    } else {
      pushToast('Неверный пароль', 'error')
    }
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY)
    setAuthed(false)
    setFormOpen(false)
    setDraft(null)
    pushToast('Сеанс админки завершён', 'info')
  }

  function openNew() {
    const d = createDraft(categories)
    setEditingOriginalId(null)
    setDraft(d)
    setSpecRows(specsToRows(d.specs))
    setPhotoLines(DEFAULT_PHOTO_LINES)
    setFormOpen(true)
  }

  function openEdit(p: Product) {
    setEditingOriginalId(p.id)
    setDraft({ ...p })
    setSpecRows(specsToRows(p.specs))
    const imgs = p.images && p.images.length > 0 ? p.images : p.image ? [p.image] : []
    setPhotoLines(imgs.join('\n'))
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setDraft(null)
    setEditingOriginalId(null)
    setSpecRows([])
    setPhotoLines('')
  }

  function saveForm(e: FormEvent) {
    e.preventDefault()
    if (!draft) return
    const idTaken = products.some((p) => p.id === draft.id && p.id !== editingOriginalId)
    if (idTaken) {
      pushToast('Товар с таким ID уже существует', 'error')
      return
    }
    const specs = rowsToSpecs(specRows)
    const urls = photoLines
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
    if (urls.length === 0) {
      pushToast('Добавьте хотя бы одну ссылку на фото (по одной в строке)', 'error')
      return
    }
    const next = normalizeProduct({ ...draft, specs, image: urls[0], images: urls })
    if (!next) {
      pushToast('Проверьте обязательные поля', 'error')
      return
    }
    if (!next.name.trim()) {
      pushToast('Укажите название товара', 'error')
      return
    }
    if (editingOriginalId === null) {
      addProduct(next)
    } else if (editingOriginalId !== next.id) {
      deleteProduct(editingOriginalId, true)
      addProduct(next)
    } else {
      updateProduct(next.id, next)
      pushToast('Товар обновлён', 'success')
    }
    closeForm()
  }

  function confirmDelete(id: string) {
    if (!window.confirm('Удалить товар из каталога?')) return
    deleteProduct(id)
  }

  function applyBulk() {
    const n = Number(bulkPct.replace(',', '.'))
    if (!Number.isFinite(n) || n === 0) {
      pushToast('Введите процент (например 10 или -5)', 'error')
      return
    }
    if (!window.confirm(`Изменить все цены на ${n > 0 ? '+' : ''}${n}%?`)) return
    adjustAllPricesByPercent(n)
  }

  function doImport() {
    try {
      const data = JSON.parse(importText) as unknown
      const list = normalizeProductList(Array.isArray(data) ? data : (data as { products?: unknown }).products)
      if (list.length === 0) {
        pushToast('В JSON нет массива товаров', 'error')
        return
      }
      if (!window.confirm(`Заменить каталог на ${list.length} товаров из файла?`)) return
      replaceAllProducts(list)
      setImportText('')
      setImportOpen(false)
    } catch {
      pushToast('Некорректный JSON', 'error')
    }
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(products, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `catalog-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
    pushToast('Файл скачан', 'success')
  }

  if (!authed) {
    return (
      <div className={styles.gate}>
        <div className={styles.gateCard}>
          <h1 className={styles.gateTitle}>Админка каталога</h1>
          <form onSubmit={login} className={styles.gateForm}>
            <label className={styles.lbl}>
              Пароль
              <input
                type="password"
                className={styles.inp}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                autoComplete="current-password"
              />
            </label>
            <button type="submit" className={styles.btnPrimary}>
              Войти
            </button>
          </form>
        </div>
      </div>
    )
  }

  const badgeOptions: { v: '' | ProductBadge; label: string }[] = [
    { v: '', label: 'Нет' },
    { v: 'hit', label: 'Хит' },
    { v: 'new', label: 'Новинка' },
    { v: 'sale', label: 'Акция' },
  ]

  return (
    <div className={styles.page}>
      <header className={styles.top}>
        <div className={styles.topInner}>
          <div>
            <h1 className={styles.title}>Админка каталога</h1>
            <p className={styles.sub}>Каталог сохраняется в браузере (localStorage) до подключения бэкенда.</p>
          </div>
          <div className={styles.topActions}>
            <Link to="/" className={styles.linkGhost}>
              Магазин
            </Link>
            <Link to="/catalog" className={styles.linkGhost}>
              Каталог
            </Link>
            <button type="button" className={styles.btnMuted} onClick={logout}>
              Выйти
            </button>
          </div>
        </div>
      </header>

      <div className={styles.toolbar}>
        <input
          type="search"
          className={styles.search}
          placeholder="Поиск по названию, SKU, бренду…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <button type="button" className={styles.btnPrimary} onClick={openNew}>
          + Товар
        </button>
        <div className={styles.bulk}>
          <input
            type="text"
            className={styles.bulkInp}
            placeholder="%"
            value={bulkPct}
            onChange={(e) => setBulkPct(e.target.value)}
            aria-label="Процент изменения цен"
          />
          <button type="button" className={styles.btnSecondary} onClick={applyBulk}>
            К ценам
          </button>
        </div>
        <button type="button" className={styles.btnSecondary} onClick={exportJson}>
          Экспорт JSON
        </button>
        <button type="button" className={styles.btnSecondary} onClick={() => setImportOpen((v) => !v)}>
          Импорт JSON
        </button>
        <button
          type="button"
          className={styles.btnDanger}
          onClick={() => {
            if (window.confirm('Восстановить исходный каталог? Текущая корзина будет очищена.')) resetProductsToDefault()
          }}
        >
          Сброс каталога
        </button>
      </div>

      {importOpen ? (
        <div className={styles.importBox}>
          <p className={styles.importHint}>Вставьте JSON-массив товаров (как в экспорте).</p>
          <textarea
            className={styles.importTa}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            rows={8}
            placeholder='[ { "id": "...", "name": "...", ... }, ... ]'
          />
          <button type="button" className={styles.btnPrimary} onClick={doImport}>
            Заменить каталог
          </button>
        </div>
      ) : null}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th />
              <th>Название</th>
              <th>SKU</th>
              <th>Категория</th>
              <th>Цена</th>
              <th>Старая</th>
              <th>Наличие</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>
                  <span
                    className={styles.thumb}
                    style={{ backgroundImage: `url(${productPrimaryImage(p)})` }}
                  />
                </td>
                <td>
                  <span className={styles.cellName}>{p.name}</span>
                  <span className={styles.cellBrand}>{p.brand}</span>
                </td>
                <td className={styles.mono}>{p.sku}</td>
                <td>{p.category}</td>
                <td className={styles.cellPrice}>{formatMoney(p.price)}</td>
                <td className={styles.cellOld}>{p.listPrice ? formatMoney(p.listPrice) : '—'}</td>
                <td>{p.inStock ? 'Да' : 'Нет'}</td>
                <td className={styles.rowActions}>
                  <button type="button" className={styles.btnMini} onClick={() => openEdit(p)}>
                    Изменить
                  </button>
                  <button type="button" className={styles.btnMiniDanger} onClick={() => confirmDelete(p.id)}>
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 ? <p className={styles.empty}>Ничего не найдено.</p> : null}
      </div>

      {formOpen && draft ? (
        <div className={styles.modalRoot}>
          <button type="button" className={styles.modalBackdrop} aria-label="Закрыть" onClick={closeForm} />
          <div className={styles.modal} role="dialog" aria-modal aria-labelledby="admin-form-title">
            <h2 id="admin-form-title" className={styles.modalTitle}>
              {editingOriginalId ? 'Редактирование' : 'Новый товар'}
            </h2>
            <form onSubmit={saveForm} className={styles.form}>
              <div className={styles.grid2}>
                <label className={styles.lbl}>
                  ID
                  <input
                    className={styles.inp}
                    value={draft.id}
                    onChange={(e) => setDraft({ ...draft, id: e.target.value })}
                    required
                  />
                </label>
                <label className={styles.lbl}>
                  SKU
                  <input
                    className={styles.inp}
                    value={draft.sku}
                    onChange={(e) => setDraft({ ...draft, sku: e.target.value })}
                    required
                  />
                </label>
              </div>
              <label className={styles.lbl}>
                Название
                <input
                  className={styles.inp}
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  required
                />
              </label>
              <div className={styles.grid2}>
                <label className={styles.lbl}>
                  Бренд
                  <input
                    className={styles.inp}
                    value={draft.brand}
                    onChange={(e) => setDraft({ ...draft, brand: e.target.value })}
                    list="admin-brands"
                  />
                  <datalist id="admin-brands">
                    {brands.map((b) => (
                      <option key={b} value={b} />
                    ))}
                  </datalist>
                </label>
                <label className={styles.lbl}>
                  Категория
                  <input
                    className={styles.inp}
                    value={draft.category}
                    onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                    list="admin-cats"
                  />
                  <datalist id="admin-cats">
                    {categories.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </label>
              </div>
              <div className={styles.grid3}>
                <label className={styles.lbl}>
                  Цена, грн
                  <input
                    type="number"
                    min={0}
                    className={styles.inp}
                    value={draft.price || ''}
                    onChange={(e) => setDraft({ ...draft, price: Math.max(0, Number(e.target.value) || 0) })}
                    required
                  />
                </label>
                <label className={styles.lbl}>
                  Старая цена (опц.)
                  <input
                    type="number"
                    min={0}
                    className={styles.inp}
                    value={draft.listPrice ?? ''}
                    onChange={(e) => {
                      const v = e.target.value
                      setDraft({
                        ...draft,
                        listPrice: v === '' ? undefined : Math.max(0, Number(v) || 0),
                      })
                    }}
                  />
                </label>
                <label className={styles.lbl}>
                  Бейдж
                  <select
                    className={styles.inp}
                    value={draft.badge ?? ''}
                    onChange={(e) => {
                      const v = e.target.value
                      setDraft({
                        ...draft,
                        badge: v === '' ? undefined : (v as ProductBadge),
                      })
                    }}
                  >
                    {badgeOptions.map((o) => (
                      <option key={o.label} value={o.v}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className={styles.grid3}>
                <label className={styles.lbl}>
                  Рейтинг (0–5)
                  <input
                    type="number"
                    min={0}
                    max={5}
                    step={0.1}
                    className={styles.inp}
                    value={draft.rating}
                    onChange={(e) => setDraft({ ...draft, rating: Number(e.target.value) || 0 })}
                  />
                </label>
                <label className={styles.lbl}>
                  Отзывов
                  <input
                    type="number"
                    min={0}
                    className={styles.inp}
                    value={draft.reviewsCount}
                    onChange={(e) => setDraft({ ...draft, reviewsCount: Math.max(0, Number(e.target.value) || 0) })}
                  />
                </label>
                <label className={styles.lblCheck}>
                  <input
                    type="checkbox"
                    checked={draft.inStock}
                    onChange={(e) => setDraft({ ...draft, inStock: e.target.checked })}
                  />
                  В наличии
                </label>
              </div>
              <label className={styles.lbl}>
                Фото — по одному URL в строке (первое = главное в каталоге)
                <textarea
                  className={styles.ta}
                  rows={5}
                  value={photoLines}
                  onChange={(e) => setPhotoLines(e.target.value)}
                  placeholder="https://…"
                  spellCheck={false}
                />
              </label>
              {photoLines.trim() ? (
                <div
                  className={styles.preview}
                  style={{
                    backgroundImage: `url(${photoLines.split('\n').map((s) => s.trim()).filter(Boolean)[0] ?? ''})`,
                  }}
                />
              ) : null}
              <label className={styles.lbl}>
                Описание
                <textarea
                  className={styles.ta}
                  rows={6}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                />
              </label>
              <fieldset className={styles.specsField}>
                <legend>Характеристики</legend>
                {specRows.map((row, idx) => (
                  <div key={row.rid} className={styles.specRow}>
                    <input
                      className={styles.inp}
                      placeholder="Название"
                      value={row.key}
                      onChange={(e) => {
                        const next = [...specRows]
                        next[idx] = { ...row, key: e.target.value }
                        setSpecRows(next)
                      }}
                    />
                    <input
                      className={styles.inp}
                      placeholder="Значение"
                      value={row.value}
                      onChange={(e) => {
                        const next = [...specRows]
                        next[idx] = { ...row, value: e.target.value }
                        setSpecRows(next)
                      }}
                    />
                    <button
                      type="button"
                      className={styles.btnMiniDanger}
                      onClick={() => setSpecRows((r) => r.filter((x) => x.rid !== row.rid))}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setSpecRows((r) => [...r, { rid: randomId(), key: '', value: '' }])}
                >
                  + Характеристика
                </button>
              </fieldset>
              <div className={styles.formActions}>
                <button type="submit" className={styles.btnPrimary}>
                  Сохранить
                </button>
                <button type="button" className={styles.btnMuted} onClick={closeForm}>
                  Отмена
                </button>
                {editingOriginalId ? (
                  <button
                    type="button"
                    className={styles.btnDanger}
                    onClick={() => {
                      confirmDelete(editingOriginalId)
                      closeForm()
                    }}
                  >
                    Удалить товар
                  </button>
                ) : null}
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
