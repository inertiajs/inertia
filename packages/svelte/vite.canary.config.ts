import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    minify: false,
    target: 'es2020',
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'canary.index',
    },
    outDir: 'dist',
    rollupOptions: {
      // Bundle all dependencies for canary build (unlike regular build)
      external: [],
      output: {
        format: 'es',
      },
    },
  },
  plugins: [svelte()],
})
