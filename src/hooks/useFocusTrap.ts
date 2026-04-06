import { useEffect, type RefObject } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function useFocusTrap(active: boolean, rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!active) return
    const root = rootRef.current
    if (!root) return

    const focusables = () => [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => !el.hasAttribute('disabled'))

    const first = () => focusables()[0]
    const last = () => focusables()[focusables().length - 1]

    window.setTimeout(() => first()?.focus(), 0)

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const f = first()
      const l = last()
      if (!f || !l) return
      if (e.shiftKey) {
        if (document.activeElement === f) {
          e.preventDefault()
          l.focus()
        }
      } else if (document.activeElement === l) {
        e.preventDefault()
        f.focus()
      }
    }

    root.addEventListener('keydown', onKey)
    return () => root.removeEventListener('keydown', onKey)
  }, [active, rootRef])
}
