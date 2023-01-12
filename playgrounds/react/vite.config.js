import react from '@vitejs/plugin-react'
import laravel from 'laravel-vite-plugin'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    laravel({
      input: ['resources/css/app.css', 'resources/js/app.jsx'],
      ssr: ['resources/js/ssr.jsx'],
      refresh: true,
    }),
    react({}),
  ],
})
