import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { defineConfig } from 'vite'

const isSSR = process.argv.includes('--ssr')

export default defineConfig({
  build: {
    minify: false,
    emptyOutDir: !isSSR,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        unified: resolve(__dirname, 'index-unified.html'),
      },
    },
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
