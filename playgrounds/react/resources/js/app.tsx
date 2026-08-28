import { createInertiaApp } from '@inertiajs/react'
import Layout from './Components/Layout'

createInertiaApp({
  defaults: {
    preserveBigIntegers: true,
  },
  title: (title) => `${title} - React Playground`,
  layout: () => Layout,
})
