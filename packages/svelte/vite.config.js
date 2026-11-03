import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    minify: false,
    target: 'es2022',
  },
  plugins: [svelte({ preprocess: vitePreprocess() })],
})
