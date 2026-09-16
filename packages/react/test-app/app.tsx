import type { HttpClient, HttpClientOptions, Page } from '@inertiajs/core'
import { axiosAdapter, type VisitOptions } from '@inertiajs/core'
import { createInertiaApp, router, setLayoutProps, type ResolvedComponent } from '@inertiajs/react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import AdminLayout from './Layouts/AdminLayout'
import AppLayout from './Layouts/AppLayout'
import DefaultLayout from './Layouts/DefaultLayout'
import Layer from './Layouts/Layer'
import LoadingBase from './Pages/Layers/LoadingBase'
import LayerLoading from './Pages/SSR/LayerLoading'

window.testing = { Inertia: router, setLayoutProps }
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

    if (name === 'Layers/Slow') {
      // Long enough for a test to supersede the layer visit while it is still resolving
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    if (name === 'Layers/SlowImport') {
      // Long enough for a dismissal to supersede a walk landing while its component resolves
      await new Promise((resolve) => setTimeout(resolve, 700))
    }

    return pages[`./Pages/${name}.tsx`]
  },
  layer: Layer,
  loading: (url, page) => {
    window.loadingResolved = [url, ...(page.layers ?? []).map((layer) => layer.key)].join('|')

    if (url.startsWith('/ssr/layer-loading-base')) {
      return LayerLoading
    }

    return url.startsWith('/layers/loading') ? LoadingBase : undefined
  },
  setup({ el, App, props }) {
    if (el.hasAttribute('data-server-rendered')) {
      hydrateRoot(el, <App {...props} />)
    } else {
      createRoot(el).render(<App {...props} />)
    }
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
  ...(params.has('withUrlBasedLayout') && {
    layout: (name: string, page) => (page.url?.startsWith('/layers/base') ? AdminLayout : DefaultLayout),
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
  ...(params.has('withLayersTitleCallback') && {
    title: (title, page) => [title, page.props.suffix].filter(Boolean).join(' | '),
  }),
})
