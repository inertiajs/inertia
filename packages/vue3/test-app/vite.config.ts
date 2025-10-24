import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    minify: false,
  },
  resolve: {
    alias: {
      '@': __dirname,
    },
  },
  plugins: [
    vue({
      features: { prodDevtools: true },
    }),
  ],
})
