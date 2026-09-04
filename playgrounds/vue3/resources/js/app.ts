import { createInertiaApp } from '@inertiajs/vue3'
import Layout from './Components/Layout.vue'

createInertiaApp({
  defaults: {
    preserveBigIntegers: true,
  },
  title: (title) => `${title} - Vue 3 Playground`,
  layout: () => Layout,
})
