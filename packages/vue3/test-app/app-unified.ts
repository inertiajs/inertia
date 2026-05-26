import type { VisitOptions } from '@inertiajs/core'
import { createInertiaApp, router } from '@inertiajs/vue3'
import type { DefineComponent } from 'vue'

window.testing = { Inertia: router }

const withAppDefaults = new URLSearchParams(window.location.search).get('withAppDefaults')

createInertiaApp<{ locale?: string }>({
  resolve: async (name) => {
    const pages = import.meta.glob<DefineComponent>('./Pages/**/*.vue', { eager: true })

    if (name === 'DeferredProps/InstantReload') {
      await new Promise((resolve) => setTimeout(resolve, 50))
    }

    return pages[`./Pages/${name}.vue`]
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
  withApp(app, { page }) {
    app.provide('withAppValue', 'injected-via-withApp')
    app.provide('withAppLocale', page.props.locale ?? 'unknown')
    app.provide('withAppComponent', page.component)
  },
})
