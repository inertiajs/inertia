import { configureInertiaApp } from '@inertiajs/react'

configureInertiaApp({
  pages: './Pages',
  title: (title) => `${title} - React Playground`,
})
