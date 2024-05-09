import { createInertiaApp } from '@inertiajs/svelte5'
import createServer from '@inertiajs/svelte5/server'

createServer((page) =>
  createInertiaApp({
    page,
    resolve: (name) => {
      const pages = import.meta.glob('./Pages/**/*.svelte', { eager: true })
      return pages[`./Pages/${name}.svelte`]
    },
  }),
)
