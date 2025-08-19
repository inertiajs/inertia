import { svelte } from '@sveltejs/vite-plugin-svelte'
import { readFileSync } from 'fs'
import { defineConfig } from 'vite'

// Only externalize peer dependencies and bundle everything else so we
// can validate ES2020 compatibility without checking framework code.
const pkg = JSON.parse(readFileSync('./package.json', 'utf8'))
const externalDependencies = Object.keys(pkg.peerDependencies || {})

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
      external: externalDependencies,
      output: {
        format: 'es',
      },
    },
  },
  plugins: [svelte()],
})
