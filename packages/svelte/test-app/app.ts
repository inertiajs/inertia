import type { Page, VisitOptions } from '@inertiajs/core'
import { createInertiaApp, type ResolvedComponent, router } from '@inertiajs/svelte'
import { hydrate, mount } from 'svelte'

window.testing = { Inertia: router }
window.resolverReceivedPage = null as Page | null

const withAppDefaults = new URLSearchParams(window.location.search).get('withAppDefaults')

createInertiaApp({
  page: window.initialPage,
  resolve: async (name, page) => {
    const pages = import.meta.glob<ResolvedComponent>('./Pages/**/*.svelte', { eager: true })

    if (page) {
      window.resolverReceivedPage = page
    }

    if (name === 'DeferredProps/InstantReload') {
      // Add small delay to ensure the component is loaded after the initial page load
      // This is for projects that don't use { eager: true } in import.meta.glob
      await new Promise((resolve) => setTimeout(resolve, 50))
    }

    return pages[`./Pages/${name}.svelte`] as ResolvedComponent
  },
  setup({ el, App, props }) {
    const isServerRendered = el?.hasAttribute('data-server-rendered')

    if (isServerRendered) {
      hydrate(App, { target: el!, props })
    } else {
      mount(App, { target: el!, props })
    }
  },
  ...(withAppDefaults && {
    defaults: {
      visitOptions: (href: string, options: VisitOptions) => {
        return { headers: { ...options.headers, 'X-From-App-Defaults': 'test' } }
      },
    },
  }),
})
