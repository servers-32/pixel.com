import type { ReactNode } from 'react'

/** Подсветка вхождений запроса в тексте (для живого поиска) */
export function highlightMatch(text: string, query: string): ReactNode {
  const q = query.trim()
  if (!q) return text
  const esc = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  let re: RegExp
  try {
    re = new RegExp(`(${esc})`, 'gi')
  } catch {
    return text
  }
  const parts: ReactNode[] = []
  let last = 0
  let m: RegExpExecArray | null
  const r = new RegExp(re.source, re.flags)
  let k = 0
  while ((m = r.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    parts.push(
      <mark key={`h-${k++}`} className="search-highlight">
        {m[0]}
      </mark>,
    )
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts.length ? parts : text
}
