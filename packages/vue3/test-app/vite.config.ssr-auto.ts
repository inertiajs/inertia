import inertia from '@inertiajs/vite'
import vue from '@vitejs/plugin-vue'
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
        port: 13718,
      },
    }),
    vue({
      features: { prodDevtools: true },
    }),
  ],
})
