import inertia from '@inertiajs/vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { defineConfig, Plugin } from 'vite'

const isSSR = process.argv.includes('--ssr')
const isVapor = process.env.VITE_VAPOR === 'true'

function vaporMode(): Plugin {
  return {
    name: 'vue-vapor-mode',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('.vue')) {
        return
      }

      return code.replace(/<script\s+setup/g, '<script setup vapor')
    },
  }
}

export default defineConfig({
  build: {
    minify: false,
    emptyOutDir: !isSSR,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        unified: resolve(__dirname, 'index-unified.html'),
        auto: resolve(__dirname, 'index-auto.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@': __dirname,
    },
  },
  plugins: [
    inertia(),
    ...(isVapor ? [vaporMode()] : []),
    vue({
      features: { prodDevtools: true },
    }),
  ],
})
