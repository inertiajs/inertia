import type { HttpClient, HttpClientOptions, Page } from '@inertiajs/core'
import { axiosAdapter, type VisitOptions } from '@inertiajs/core'
import { createInertiaApp, router, type ResolvedComponent } from '@inertiajs/react'
import { createRoot } from 'react-dom/client'

window.testing = { Inertia: router }
window.resolverReceivedPage = null as Page | null

const params = new URLSearchParams(window.location.search)

function getHttpConfig(): HttpClient | HttpClientOptions | undefined {
  const customXsrf = params.get('customXsrf')

  if (customXsrf) {
    return { xsrfCookieName: customXsrf, xsrfHeaderName: `X-${customXsrf}` }
  }

  if (import.meta.env.VITE_HTTP_CLIENT === 'axios') {
    return axiosAdapter()
  }

  return undefined
}

createInertiaApp({
  page: window.initialPage,
  resolve: async (name, page) => {
    const pages = import.meta.glob<ResolvedComponent>('./Pages/**/*.tsx', { eager: true })

    if (page) {
      window.resolverReceivedPage = page
    }

    if (name === 'DeferredProps/InstantReload') {
      // Add small delay to ensure the component is loaded after the initial page load
      // This is for projects that don't use { eager: true } in import.meta.glob
      await new Promise((resolve) => setTimeout(resolve, 50))
    }

    return pages[`./Pages/${name}.tsx`]
  },
  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />)
  },
  progress: {
    delay: 0,
    color: 'red',
  },
  http: getHttpConfig(),
  ...(params.has('withAppDefaults') && {
    defaults: {
      visitOptions: (href: string, options: VisitOptions) => {
        return { headers: { ...options.headers, 'X-From-App-Defaults': 'test' } }
      },
    },
  }),
})
