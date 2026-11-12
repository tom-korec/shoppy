/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const BRAND = '#059669';

export default defineConfig({
  plugins: [
    // Must come before the React plugin.
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      // Icons, favicon, apple-touch-icon and splash screens are generated from public/logo.svg.
      pwaAssets: { config: true, overrideManifestIcons: true },
      manifest: {
        id: '/',
        name: 'Shoppy',
        short_name: 'Shoppy',
        description: 'Shared shopping lists for you and your household.',
        lang: 'en',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: BRAND,
        background_color: '#ffffff',
        categories: ['shopping', 'productivity', 'lifestyle'],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest,woff2}'],
        navigateFallback: '/index.html',
        // API calls always hit the network until offline mode (Phase 7).
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          // Route splitting otherwise leaves dozens of sub-kilobyte chunks (one per icon or UI
          // component), each a request on the critical path of a cold start on a phone. Groups
          // must not import each other in a cycle (that breaks module initialization): `vendor`
          // imports nothing of ours, `ui` only `vendor`. Libraries loaded lazily stay out.
          groups: [
            {
              name: 'ui',
              test: /[\\/]src[\\/](components[\\/]ui|lib)[\\/]|lucide-react/,
              includeDependenciesRecursively: false,
            },
            {
              name: 'vendor',
              test: (id) =>
                /node_modules|[\\/]packages[\\/]shared[\\/]/.test(id) &&
                !/@sentry|@dnd-kit|devtools/.test(id),
              includeDependenciesRecursively: false,
            },
          ],
        },
      },
    },
  },
  server: {
    port: 5180,
    strictPort: true,
    proxy: {
      '/api': {
        target: process.env['API_PROXY_TARGET'] ?? 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.spec.{ts,tsx}', 'worker/**/*.spec.ts'],
  },
});
