import { axiosAdapter, type VisitOptions } from '@inertiajs/core'
import { createInertiaApp, router } from '@inertiajs/vue3'
import type { DefineComponent } from 'vue'
import { createApp, h } from 'vue'

window.testing = { Inertia: router }

const withAppDefaults = new URLSearchParams(window.location.search).get('withAppDefaults')

createInertiaApp({
  page: window.initialPage,
  resolve: async (name) => {
    const pages = import.meta.glob<DefineComponent>('./Pages/**/*.vue', { eager: true })

    if (name === 'DeferredProps/InstantReload') {
      // Add small delay to ensure the component is loaded after the initial page load
      // This is for projects that don't use { eager: true } in import.meta.glob
      await new Promise((resolve) => setTimeout(resolve, 50))
    }

    return pages[`./Pages/${name}.vue`]
  },
  setup({ el, App, props, plugin }) {
    const inst = createApp({ render: () => h(App, props) })

    if (!window.location.pathname.startsWith('/plugin/without')) {
      inst.use(plugin)
    }

    inst.mount(el)
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
