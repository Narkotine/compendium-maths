import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // GitHub Pages : https://narkotine.github.io/compendium-maths/ (même origine que le site de jeux)
  base: '/compendium-maths/',
  build: { target: 'es2020', assetsInlineLimit: 0, chunkSizeWarningLimit: 600 },
  plugins: [
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['icons/*.png', 'icons/*.svg'],
      manifest: {
        id: '/compendium-maths/',
        name: 'Maths Collège',
        short_name: 'Maths Collège',
        description: 'Cours de maths du collège : 17 chapitres avec schémas, exercices et corrigés, disponibles hors ligne.',
        lang: 'fr',
        dir: 'ltr',
        start_url: '/compendium-maths/',
        scope: '/compendium-maths/',
        display: 'standalone',
        orientation: 'any',
        background_color: '#f7f6f2',
        theme_color: '#1d5fa8',
        categories: ['education', 'books'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'icons/maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Hors ligne complet : tout le contenu (chapitres, figures, index de recherche, polices woff2) est pré-caché.
        globPatterns: ['**/*.{js,css,html,json,svg,png,woff2,webmanifest}'],
        globIgnores: ['**/build-report.json', '**/404.html'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        // préfixe propre : caches « compendium-maths-precache-… », jamais confondus avec ceux des jeux
        cacheId: 'compendium-maths',
        cleanupOutdatedCaches: true,
        navigateFallback: 'index.html',
        navigateFallbackAllowlist: [/^\/compendium-maths\//],
      },
    }),
  ],
});
