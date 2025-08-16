import inertia from '@inertiajs/core/vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import laravel from 'laravel-vite-plugin'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    minify: false,
  },
  plugins: [
    laravel({
      input: ['resources/css/app.css', 'resources/js/app.ts'],
      ssr: 'resources/js/ssr.ts',
      refresh: true,
    }),
    inertia('resources/js/viteSsr.ts'),
    svelte({
      compilerOptions: {
        hydratable: true,
      },
    }),
    tailwindcss(),
  ],
})
