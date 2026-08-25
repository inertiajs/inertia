import { createInertiaApp } from '@inertiajs/react'
import { echoTransport } from '@inertiajs/react/echo'
import { configureEcho } from '@laravel/echo-react'
import Layout from './Components/Layout'

configureEcho({ broadcaster: 'reverb' })

createInertiaApp({
  title: (title) => `${title} - React Playground`,
  layout: () => Layout,
  live: echoTransport(),
})
