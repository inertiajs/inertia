import { createInertiaApp } from '@inertiajs/svelte'
import Layout from './Components/Layout.svelte'

createInertiaApp({
  layout: () => Layout,
})
