import { createInertiaApp } from '@inertiajs/vue3'

createInertiaApp({
  pages: './Pages',
  title: (title) => `${title} - Vue 3 Playground`,
})
