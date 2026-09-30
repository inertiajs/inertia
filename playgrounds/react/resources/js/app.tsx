import { createInertiaApp } from '@inertiajs/react'
import Layout from './Components/Layout'

createInertiaApp({
  title: (title) => `${title} - React Playground`,
  layout: () => Layout,
})
