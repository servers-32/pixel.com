import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Берём base для GitHub Pages
const base = process.env.VITE_BASE?.trim() || '/pixel.com/'

export default defineConfig({
  base, // важно для GitHub Pages
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['pixel-favicon.svg', 'placeholder-product.svg'],
      manifest: {
        name: 'PiXEL',
        short_name: 'PiXEL',
        description:
          'Смартфоны, ноутбуки, аудио и аксессуары. Доставка по Украине, оплата картой и рассрочка.',
        theme_color: '#0f172a',
        background_color: '#f5f6f8',
        display: 'standalone',
        orientation: 'portrait-primary',
        lang: 'ru',
        start_url: base,
        scope: base,
        icons: [
          {
            src: 'pixel-favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp}'],
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api\//],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules') && id.includes('recharts')) return 'recharts'
        },
      },
    },
  },
})
