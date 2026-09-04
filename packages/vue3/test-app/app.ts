import type { HttpClient, HttpClientOptions, Page } from '@inertiajs/core'
import { axiosAdapter, type VisitOptions } from '@inertiajs/core'
import { createInertiaApp, router, setLayoutProps } from '@inertiajs/vue3'
import type { DefineComponent } from 'vue'
import { createApp, createSSRApp, h } from 'vue'
import AdminLayout from './Layouts/AdminLayout.vue'
import AppLayout from './Layouts/AppLayout.vue'
import DefaultLayout from './Layouts/DefaultLayout.vue'
import Layer from './Layouts/Layer.vue'
import LoadingBase from './Pages/Layers/LoadingBase.vue'
import LayerLoading from './Pages/SSR/LayerLoading.vue'

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
    const pages = import.meta.glob<DefineComponent>('./Pages/**/*.vue', { eager: true })

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

    return pages[`./Pages/${name}.vue`]
  },
  layer: Layer,
  loading: (url: string, page: Page) => {
    window.loadingResolved = [url, ...(page.layers ?? []).map((layer) => layer.key)].join('|')

    if (url.startsWith('/ssr/layer-loading-base')) {
      return LayerLoading
    }

    return url.startsWith('/layers/loading') ? LoadingBase : undefined
  },
  setup({ el, App, props, plugin }) {
    const root = { render: () => h(App, props) }
    const inst = el.hasAttribute('data-server-rendered') ? createSSRApp(root) : createApp(root)

    if (!window.location.pathname.startsWith('/plugin/without')) {
      inst.use(plugin)
    }

    inst.mount(el)
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
