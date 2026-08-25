import { createInertiaApp } from '@inertiajs/svelte'
import { echoTransport } from '@inertiajs/svelte/echo'
import { configureEcho } from '@laravel/echo-svelte'
import Layout from './Components/Layout.svelte'

configureEcho({ broadcaster: 'reverb' })

createInertiaApp({
  layout: () => Layout,
  live: echoTransport(),
})
