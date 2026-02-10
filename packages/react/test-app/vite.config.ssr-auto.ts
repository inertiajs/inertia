import inertia from '@inertiajs/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    minify: false,
    emptyOutDir: false,
  },
  resolve: {
    alias: {
      '@': __dirname,
    },
  },
  plugins: [
    inertia({
      ssr: {
        port: 13719,
      },
    }),
    react(),
  ],
})
