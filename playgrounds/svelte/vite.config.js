import { svelte } from '@sveltejs/vite-plugin-svelte'
import laravel from 'laravel-vite-plugin'
import sveltePreprocess from 'svelte-preprocess'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    laravel({
      input: ['resources/css/app.css', 'resources/js/app.js'],
      ssr: 'resources/js/ssr.js',
      refresh: true,
    }),
    svelte({
      preprocess: sveltePreprocess(),
      compilerOptions: {
        hydratable: true,
      },
    }),
  ],
})
