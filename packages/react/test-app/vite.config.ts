import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const isSSR = process.argv.includes('--ssr')

export default defineConfig({
  build: {
    minify: false,
    emptyOutDir: !isSSR,
  },
  resolve: {
    alias: {
      '@': __dirname,
    },
  },
  plugins: [react()],
})
