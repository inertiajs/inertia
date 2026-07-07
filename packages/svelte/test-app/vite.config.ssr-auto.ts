import inertia from '@inertiajs/vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

const asyncEnabled = process.env.SVELTE_ASYNC === 'true'

export default defineConfig({
  build: {
    minify: false,
    emptyOutDir: false,
  },
  resolve: {
    alias: {
      '@': __dirname,
    },
  },
  plugins: [
    inertia({
      ssr: {
        port: 13720,
      },
    }),
    svelte({
      compilerOptions: {
        experimental: {
          async: asyncEnabled,
        },
      },
      dynamicCompileOptions({ filename }) {
        if (filename.includes('/Pages/SSR/Async.svelte')) {
          return { experimental: { async: true } }
        }
      },
    }),
  ],
})
