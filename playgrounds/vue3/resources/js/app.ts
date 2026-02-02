import { configureInertiaApp } from '@inertiajs/vue3'

configureInertiaApp({
  pages: './Pages',
  title: (title) => `${title} - Vue 3 Playground`,
})
