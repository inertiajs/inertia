import type { HttpClient, HttpClientOptions, Page } from '@inertiajs/core'
import { axiosAdapter, type VisitOptions } from '@inertiajs/core'
import { createInertiaApp, router, type ResolvedComponent } from '@inertiajs/react'
import { echo } from '@inertiajs/react/echo'
import { createRoot } from 'react-dom/client'
import { resolveFakeEcho } from './fakeEcho'
import { fakeLiveTransport } from './fakeLiveTransport'
import AppLayout from './Layouts/AppLayout'
import DefaultLayout from './Layouts/DefaultLayout'

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
  // Only the live props page has a manifest, and the fake transport registers a
  // socket id resolver that other tests don't expect
  ...(window.location.pathname === '/live' && {
    live: {
      transport: fakeLiveTransport(),
      // Opt-in so the tests that rely on the defaults keep their timings
      ...(params.has('liveThrottle') && { throttle: Number(params.get('liveThrottle')) }),
      ...(params.get('liveKeepAlive') === '1' && { pauseWhenHidden: false }),
    },
  }),
  ...(window.location.pathname === '/echo-transport' && {
    live: echo({ resolve: resolveFakeEcho }),
  }),
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
  ...(params.has('withDefaultLayout') && {
    layout: () => DefaultLayout,
  }),
  ...(params.has('withAnonymousDefaultLayout') && {
    layout:
      () =>
      ({ children }: { children: React.ReactNode }) => (
        <div id="default-layout">
          <span>Default Layout</span>
          {children}
        </div>
      ),
  }),
  ...(params.has('withDefaultAppLayout') && {
    layout: () => AppLayout,
  }),
  ...(params.has('withDefaultLayoutCallback') && {
    layout: (name: string) => {
      if (name.startsWith('DefaultLayout/CallbackExcluded')) {
        return null
      }
      return DefaultLayout
    },
  }),
  ...(params.has('withServerHead') && {
    serverHead: true,
  }),
  ...(params.has('withServerHeadCallback') && {
    serverHead: (page) => page.props.head as string[],
  }),
  ...(params.has('withServerHeadProp') && {
    serverHead: 'metaTags',
  }),
  ...(params.get('popover') === 'false' && {
    progress: { popover: false },
  }),
  ...(params.has('nonce') && {
    nonce: params.get('nonce') === 'default' ? 'test-default-nonce' : 'test-nonce',
  }),
  ...(params.has('withTitleCallback') && {
    title: (title, page) => [title, page.props.titleSuffix].filter(Boolean).join(' | '),
  }),
})
