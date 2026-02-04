import type { VisitOptions } from '@inertiajs/core'
import { createInertiaApp, type ResolvedComponent, router } from '@inertiajs/svelte'

window.testing = { Inertia: router }

const withAppDefaults = new URLSearchParams(window.location.search).get('withAppDefaults')

createInertiaApp({
  resolve: async (name) => {
    const pages = import.meta.glob<ResolvedComponent>('./Pages/**/*.svelte', { eager: true })

    if (name === 'DeferredProps/InstantReload') {
      await new Promise((resolve) => setTimeout(resolve, 50))
    }

    return pages[`./Pages/${name}.svelte`] as ResolvedComponent
  },
  progress: {
    delay: 0,
  },
  ...(withAppDefaults && {
    defaults: {
      visitOptions: (href: string, options: VisitOptions) => {
        return { headers: { ...options.headers, 'X-From-App-Defaults': 'test' } }
      },
    },
  }),
})
