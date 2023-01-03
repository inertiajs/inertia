import vue from '@vitejs/plugin-vue'
import laravel from 'laravel-vite-plugin'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '@inertiajs/vue3/server': path.resolve(__dirname, '../../packages/vue3/dist/server.esm.js'),
      '@inertiajs/vue3': path.resolve(__dirname, '../../packages/vue3/dist/index.esm.js'),
      '@inertiajs/core/server': path.resolve(__dirname, '../../packages/core/dist/server.esm.js'),
      '@inertiajs/core': path.resolve(__dirname, '../../packages/core/dist/index.esm.js'),
    },
  },
  plugins: [
    laravel({
      input: ['resources/css/app.css', 'resources/js/app.js'],
      ssr: ['resources/js/ssr.js'],
      refresh: true,
    }),
    vue({
      template: {
        transformAssetUrls: {
          base: null,
          includeAbsolute: false,
        },
      },
    }),
  ],
})
