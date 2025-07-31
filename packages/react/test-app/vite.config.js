import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    minify: false,
  },
  resolve: {
    alias: {
      '@': __dirname,
    },
  },
  plugins: [react()],
})
