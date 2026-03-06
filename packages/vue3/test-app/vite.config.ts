import inertia from '@inertiajs/vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { defineConfig, type Plugin } from 'vite'

const isSSR = process.argv.includes('--ssr')
const vaporMode = !!process.env.VITE_VAPOR_MODE

function vaporTransformPlugin(): Plugin {
  return {
    name: 'vapor-transform',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('.vue')) {
        return
      }

      if (!code.includes('<template')) {
        return
      }

      return code.replace(/<script setup/g, '<script setup vapor')
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
    ...(vaporMode ? [vaporTransformPlugin()] : []),
    vue({
      features: { prodDevtools: !vaporMode },
    }),
  ],
})
