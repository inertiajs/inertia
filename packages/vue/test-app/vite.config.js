import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '@': __dirname,
    },
  },
  plugins: [vue()],
})
