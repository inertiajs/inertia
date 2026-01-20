import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

const isSSR = process.argv.includes('--ssr')

export default defineConfig({
  build: {
    sourcemap: 'inline',
    emptyOutDir: !isSSR,
  },
  resolve: {
    alias: {
      '@': __dirname,
    },
  },
  plugins: [svelte()],
})
