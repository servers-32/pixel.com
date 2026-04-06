import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import styles from './AnalyticsDashboard.module.css'
import { useShop } from '../context/useShop'
import type { Order } from '../types'
import { formatMoney } from '../utils/formatMoney'

function lastNDays(n: number): string[] {
  const out: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    out.push(d.toISOString().slice(0, 10))
  }
  return out
}

function aggregateSalesByDay(orders: Order[], days: string[]) {
  const idx = new Map(days.map((d, i) => [d, i]))
  const rows = days.map((date) => ({
    label: date.slice(5),
    revenue: 0,
    orders: 0,
    units: 0,
  }))
  for (const o of orders) {
    const day = o.createdAt.slice(0, 10)
    const i = idx.get(day)
    if (i === undefined) continue
    rows[i].revenue += o.total
    rows[i].orders += 1
    for (const l of o.lines) {
      rows[i].units += l.quantity
    }
  }
  return rows
}

function topProductsByQty(orders: Order[], limit: number) {
  const m = new Map<string, { name: string; qty: number; revenue: number }>()
  for (const o of orders) {
    for (const l of o.lines) {
      const cur = m.get(l.productId) ?? { name: l.name, qty: 0, revenue: 0 }
      cur.qty += l.quantity
      cur.revenue += l.price * l.quantity
      cur.name = l.name
      m.set(l.productId, cur)
    }
  }
  return [...m.values()]
    .sort((a, b) => b.qty - a.qty)
    .slice(0, limit)
    .map((x) => ({
      name: x.name.length > 22 ? `${x.name.slice(0, 20)}…` : x.name,
      qty: x.qty,
      revenue: x.revenue,
    }))
}

function seriesTrend(values: number[]): { dir: 'up' | 'down' | 'flat'; pct: number } {
  if (values.length < 4) return { dir: 'flat', pct: 0 }
  const mid = Math.floor(values.length / 2)
  const a = values.slice(0, mid).reduce((s, x) => s + x, 0) / mid
  const b = values.slice(mid).reduce((s, x) => s + x, 0) / (values.length - mid)
  const denom = Math.max(Math.abs(a), Math.abs(b), 1e-9)
  const raw = Math.round(((b - a) / denom) * 100)
  if (Math.abs(raw) < 5) return { dir: 'flat', pct: 0 }
  return { dir: raw > 0 ? 'up' : 'down', pct: Math.abs(raw) }
}

function TrendBadge({ dir, pct }: { dir: 'up' | 'down' | 'flat'; pct: number }) {
  if (dir === 'flat' || pct === 0) {
    return <span className={styles.trendFlat}>— стабильно</span>
  }
  const arrow = dir === 'up' ? '↑' : '↓'
  const cls = dir === 'up' ? styles.trendUp : styles.trendDown
  return (
    <span className={cls}>
      {arrow} {pct}% к прошлой половине периода
    </span>
  )
}

function MiniSparkline({ points, color }: { points: { v: number }[]; color: string }) {
  if (points.every((p) => p.v === 0)) {
    return <div className={styles.sparkEmpty}>нет данных</div>
  }
  return (
    <div className={styles.spark}>
      <ResponsiveContainer width="100%" height={40}>
        <LineChart data={points} margin={{ top: 6, right: 2, left: 2, bottom: 0 }}>
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function AnalyticsDashboard() {
  const { orders, products } = useShop()

  const totalRevenue = useMemo(() => orders.reduce((s, o) => s + o.total, 0), [orders])
  const avgCheck = orders.length ? totalRevenue / orders.length : 0
  const totalUnits = useMemo(
    () => orders.reduce((s, o) => s + o.lines.reduce((t, l) => t + l.quantity, 0), 0),
    [orders],
  )

  const days = useMemo(() => lastNDays(7), [])
  const salesChart = useMemo(() => aggregateSalesByDay(orders, days), [orders, days])
  const popular = useMemo(() => topProductsByQty(orders, 6), [orders])

  const revSeries = useMemo(() => salesChart.map((r) => r.revenue), [salesChart])
  const ordSeries = useMemo(() => salesChart.map((r) => r.orders), [salesChart])
  const unitSeries = useMemo(() => salesChart.map((r) => r.units), [salesChart])
  const avgSeries = useMemo(
    () =>
      salesChart.map((r) => (r.orders > 0 ? Math.round(r.revenue / r.orders) : 0)),
    [salesChart],
  )

  const tRev = seriesTrend(revSeries)
  const tOrd = seriesTrend(ordSeries)
  const tUnits = seriesTrend(unitSeries)
  const tAvg = seriesTrend(avgSeries)

  const sparkRev = useMemo(() => revSeries.map((v) => ({ v })), [revSeries])
  const sparkOrd = useMemo(() => ordSeries.map((v) => ({ v })), [ordSeries])
  const sparkUnits = useMemo(() => unitSeries.map((v) => ({ v })), [unitSeries])
  const sparkAvg = useMemo(() => avgSeries.map((v) => ({ v })), [avgSeries])

  return (
    <div className={styles.wrap}>
      <h1 className={`${styles.title} heading-display`}>Аналитика продаж</h1>
      <p className={styles.subtitle}>
        Показатели обновляются по мере оформления заказов. Если графики пустые, оформите покупку — данные появятся
        автоматически. Тренд сравнивает первые и вторые 3–4 дня выбранной недели.
      </p>

      <div className={styles.cards}>
        <div className={styles.stat}>
          <div className={styles.statTop}>
            <div className={styles.statLabel}>Заказов</div>
            <TrendBadge dir={tOrd.dir} pct={tOrd.pct} />
          </div>
          <div className={styles.statValueRow}>
            <div className={styles.statValue}>{orders.length}</div>
            <MiniSparkline points={sparkOrd} color="var(--chart-like)" />
          </div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statTop}>
            <div className={styles.statLabel}>Выручка</div>
            <TrendBadge dir={tRev.dir} pct={tRev.pct} />
          </div>
          <div className={styles.statValueRow}>
            <div className={styles.statValue}>{formatMoney(totalRevenue)}</div>
            <MiniSparkline points={sparkRev} color="var(--chart-post)" />
          </div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statTop}>
            <div className={styles.statLabel}>Средний чек</div>
            <TrendBadge dir={tAvg.dir} pct={tAvg.pct} />
          </div>
          <div className={styles.statValueRow}>
            <div className={styles.statValue}>{formatMoney(avgCheck)}</div>
            <MiniSparkline points={sparkAvg} color="var(--chart-comment)" />
          </div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statTop}>
            <div className={styles.statLabel}>Товаров продано</div>
            <TrendBadge dir={tUnits.dir} pct={tUnits.pct} />
          </div>
          <div className={styles.statValueRow}>
            <div className={styles.statValue}>{totalUnits}</div>
            <MiniSparkline points={sparkUnits} color="var(--chart-like)" />
          </div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statTop}>
            <div className={styles.statLabel}>SKU в каталоге</div>
            <span className={styles.trendMuted}>актуально</span>
          </div>
          <div className={styles.statValueRow}>
            <div className={styles.statValue}>{products.length}</div>
            <div className={styles.sparkPlaceholder} />
          </div>
        </div>
      </div>

      <div className={styles.chartBlock}>
        <div className={styles.chartHead}>
          <h2 className={styles.chartTitle}>Продажи за 7 дней</h2>
          <div className={styles.chartLegendBar} aria-hidden>
            <span className={styles.legendItem}>
              <span className={styles.legendSwatch} style={{ background: 'var(--chart-post)' }} />
              Выручка
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendSwatch} style={{ background: 'var(--chart-like)' }} />
              Заказы
            </span>
          </div>
        </div>
        <div className={styles.chartCanvas}>
          <ResponsiveContainer>
            <BarChart data={salesChart} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis
                yAxisId="right"
                orientation="right"
                allowDecimals={false}
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              />
              <Tooltip
                formatter={(value, name) => {
                  const v = Number(value)
                  if (String(name) === 'Выручка') return [formatMoney(v), 'Выручка']
                  return [v, 'Заказы']
                }}
                contentStyle={{
                  background: 'var(--surface-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  color: 'var(--text-strong)',
                }}
              />
              <Bar yAxisId="left" dataKey="revenue" name="Выручка" fill="var(--chart-post)" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="orders" name="Заказы" fill="var(--chart-like)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.chartBlock}>
        <h2 className={styles.chartTitleOnly}>Популярность товаров (по количеству в заказах)</h2>
        <div className={styles.chartCanvasTall} style={{ height: Math.max(220, popular.length * 36) }}>
          <ResponsiveContainer>
            <BarChart layout="vertical" data={popular} margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis type="number" allowDecimals={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
              <Tooltip
                formatter={(value) => [`${Number(value)} шт.`, 'Продано']}
                contentStyle={{
                  background: 'var(--surface-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  color: 'var(--text-strong)',
                }}
              />
              <Bar dataKey="qty" name="Шт." fill="var(--chart-comment)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {popular.length === 0 ? (
          <p className={styles.note}>Пока нет заказов — график заполнится после первой покупки.</p>
        ) : null}
      </div>

      <p className={styles.note}>
        История заказов и корзина сохраняются в браузере. Замените слой данных на Firebase или REST API, не меняя
        контракт <code style={{ fontSize: '0.85em' }}>placeOrder</code>.
      </p>
    </div>
  )
}
