import { createInertiaApp } from '@inertiajs/vue3'
import Layout from './Components/Layout.vue'

createInertiaApp({
  title: (title) => `${title} - Vue 3 Playground`,
  layout: () => Layout,
})
