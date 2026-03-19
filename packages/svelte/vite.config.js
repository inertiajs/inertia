import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    minify: false,
    target: 'es2022',
  },
  plugins: [sveltekit()],
})
