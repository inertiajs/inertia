import { createInertiaApp } from '@inertiajs/react'

createInertiaApp({
  pages: './Pages',
  title: (title) => `${title} - React Playground`,
})
