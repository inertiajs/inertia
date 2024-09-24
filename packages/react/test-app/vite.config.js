import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '@': __dirname,
    },
  },
  plugins: [react()],
})
