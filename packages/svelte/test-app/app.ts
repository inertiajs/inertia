import { axiosAdapter, type VisitOptions } from '@inertiajs/core'
import { createInertiaApp, type ResolvedComponent, router } from '@inertiajs/svelte'

window.testing = { Inertia: router }

const withAppDefaults = new URLSearchParams(window.location.search).get('withAppDefaults')

createInertiaApp({
  page: window.initialPage,
  resolve: async (name) => {
    const pages = import.meta.glob<ResolvedComponent>('./Pages/**/*.svelte', { eager: true })

    if (name === 'DeferredProps/InstantReload') {
      // Add small delay to ensure the component is loaded after the initial page load
      // This is for projects that don't use { eager: true } in import.meta.glob
      await new Promise((resolve) => setTimeout(resolve, 50))
    }

    return pages[`./Pages/${name}.svelte`]
  },
  setup({ el, App, props }) {
    const hydrate = el?.hasAttribute('data-server-rendered')
    new App({ target: el!, props, hydrate })
  },
  ...(import.meta.env.VITE_HTTP_CLIENT === 'axios' && { http: axiosAdapter() }),
  ...(withAppDefaults && {
    defaults: {
      visitOptions: (href: string, options: VisitOptions) => {
        return { headers: { ...options.headers, 'X-From-App-Defaults': 'test' } }
      },
    },
  }),
})
