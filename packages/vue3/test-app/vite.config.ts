import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const isSSR = process.argv.includes('--ssr')

export default defineConfig({
  build: {
    minify: false,
    emptyOutDir: !isSSR,
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
