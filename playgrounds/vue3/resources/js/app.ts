import { createInertiaApp } from '@inertiajs/vue3'
import { echo } from '@inertiajs/vue3/echo'
import { configureEcho } from '@laravel/echo-vue'
import Layout from './Components/Layout.vue'

configureEcho({ broadcaster: 'reverb' })

createInertiaApp({
  title: (title) => `${title} - Vue 3 Playground`,
  layout: () => Layout,
  live: echo(),
})
