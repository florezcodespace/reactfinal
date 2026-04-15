import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    babel({
      presets: [reactCompilerPreset()],
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'favicon-32x32.png',
        'icons.svg',
        'apple-touch-icon.png',
        'pwa-192x192.png',
        'pwa-512x512.png',
        'pwa-maskable-512x512.png',
        'og-image.png',
        'screenshots/install-mobile.png',
        'screenshots/install-wide.png',
      ],
      manifest: {
        id: '/',
        lang: 'es-CO',
        name: 'Cosmos Explorer',
        short_name: 'CosmosX',
        description: 'Explora imagenes, eventos y fenomenos espaciales en una experiencia inmersiva.',
        theme_color: '#050505',
        background_color: '#050505',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone', 'browser'],
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        categories: ['education', 'entertainment', 'news'],
        screenshots: [
          {
            src: '/screenshots/install-mobile.png',
            sizes: '720x1280',
            type: 'image/png',
            label: 'Vista movil de Cosmos Explorer',
          },
          {
            src: '/screenshots/install-wide.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Vista de escritorio de Cosmos Explorer',
          },
        ],
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webp}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.nasa\.gov\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'nasa-api-cache',
              expiration: {
                maxEntries: 24,
                maxAgeSeconds: 60 * 60 * 24,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: command === 'build',
        type: 'module',
      },
    }),
  ],
  build: {
    cssCodeSplit: true,
    modulePreload: {
      polyfill: false,
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined
          }

          if (id.includes('react-router-dom')) {
            return 'router'
          }

          if (
            id.includes('react-hook-form') ||
            id.includes('@hookform/resolvers') ||
            id.includes('zod')
          ) {
            return 'forms'
          }

          if (id.includes('react') || id.includes('scheduler')) {
            return 'react'
          }

          return 'vendor'
        },
      },
    },
  },
}))
