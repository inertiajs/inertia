import { svelte } from '@sveltejs/vite-plugin-svelte'
import { resolve } from 'path'
import { defineConfig } from 'vite'

const isSSR = process.argv.includes('--ssr')

export default defineConfig({
  build: {
    sourcemap: 'inline',
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
  plugins: [svelte()],
})
