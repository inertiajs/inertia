import inertia from '@inertiajs/vite'
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
        auto: resolve(__dirname, 'index-auto.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@': __dirname,
    },
  },
  plugins: [
    inertia(),
    vue({
      features: { prodDevtools: true },
    }),
  ],
})
