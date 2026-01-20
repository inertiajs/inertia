import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [svelte()],
  build: {
    minify: false,
    lib: {
      entry: './src/index.ts',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      // Only externalize Svelte (peer dependency) - bundle everything else
      external: (id) => id === 'svelte' || id.startsWith('svelte/'),
    },
    target: 'es2020',
  },
})
