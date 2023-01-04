import react from '@vitejs/plugin-react'
import laravel from 'laravel-vite-plugin'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '@inertiajs/react/server': path.resolve(__dirname, '../../packages/react/dist/server.esm.js'),
      '@inertiajs/react': path.resolve(__dirname, '../../packages/react/dist/index.esm.js'),
      '@inertiajs/core/server': path.resolve(__dirname, '../../packages/core/dist/server.esm.js'),
      '@inertiajs/core': path.resolve(__dirname, '../../packages/core/dist/index.esm.js'),
    },
  },
  plugins: [
    laravel({
      input: ['resources/css/app.css', 'resources/js/app.jsx'],
      ssr: ['resources/js/ssr.jsx'],
      refresh: true,
    }),
    react({}),
  ],
})
