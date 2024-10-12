import { createInertiaApp } from 'inertiax-svelte'
import createServer from 'inertiax-svelte/server'
import { ResolvedComponent } from 'inertiax-svelte'

createServer((page) =>
  createInertiaApp({
    page,
    resolve: (name) => {
      const pages = import.meta.glob<ResolvedComponent>('./Pages/**/*.svelte', { eager: true })
      return pages[`./Pages/${name}.svelte`]
    },
  }),
)
