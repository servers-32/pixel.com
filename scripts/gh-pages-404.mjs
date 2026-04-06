/**
 * GitHub Pages: отдаёт 404.html для неизвестных путей.
 * Копируем index.html → 404.html, чтобы SPA подхватывала маршруты при прямом заходе /catalog и т.д.
 */
import { copyFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const indexHtml = join(root, 'dist', 'index.html')
const notFound = join(root, 'dist', '404.html')

if (!existsSync(indexHtml)) {
  console.error('Нет dist/index.html — сначала выполните npm run build')
  process.exit(1)
}
copyFileSync(indexHtml, notFound)
console.log('OK: dist/404.html (копия index.html) для GitHub Pages')
