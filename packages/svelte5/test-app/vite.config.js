import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    sourcemap: 'inline',
  },
  resolve: {
    alias: {
      '@': __dirname,
    },
  },
  plugins: [svelte()],
})
