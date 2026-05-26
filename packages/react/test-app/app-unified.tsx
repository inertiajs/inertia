import type { VisitOptions } from '@inertiajs/core'
import { createInertiaApp, type ResolvedComponent, router } from '@inertiajs/react'
import { createElement } from 'react'
import { WithAppContext } from './Pages/SSR/WithApp'

window.testing = { Inertia: router }

const params = new URLSearchParams(window.location.search)

createInertiaApp<{ locale?: string }>({
  strictMode: params.has('strictMode'),
  resolve: async (name) => {
    const pages = import.meta.glob<ResolvedComponent>('./Pages/**/*.tsx', { eager: true })

    if (name === 'DeferredProps/InstantReload') {
      await new Promise((resolve) => setTimeout(resolve, 50))
    }

    return pages[`./Pages/${name}.tsx`]
  },
  progress: {
    delay: 0,
    color: 'red',
  },
  ...(params.has('withAppDefaults') && {
    defaults: {
      visitOptions: (href: string, options: VisitOptions) => {
        return { headers: { ...options.headers, 'X-From-App-Defaults': 'test' } }
      },
    },
  }),
  withApp(app, { page }) {
    const value = {
      injected: 'injected-via-withApp',
      locale: page.props.locale ?? 'unknown',
      component: page.component,
    }

    return createElement(WithAppContext.Provider, { value }, app)
  },
})
