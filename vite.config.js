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
        'icons.svg',
        'pwa-icon.svg',
        'pwa-maskable.svg',
        'cosmos-saturn-v2.png',
      ],
      manifest: {
        name: 'Cosmos Explorer',
        short_name: 'CosmosX',
        description: 'Explora imagenes, eventos y fenomenos espaciales en una experiencia inmersiva.',
        theme_color: '#050505',
        background_color: '#050505',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/cosmos-saturn-v2.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: '/pwa-maskable.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
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
