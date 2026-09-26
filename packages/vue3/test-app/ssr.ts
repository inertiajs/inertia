import { createInertiaApp } from '@inertiajs/vue3'
import createServer from '@inertiajs/vue3/server'
import { createSSRApp, h, type DefineComponent } from 'vue'
import { renderToString } from 'vue/server-renderer'
import Layer from './Layouts/Layer.vue'

createServer((page) =>
  createInertiaApp({
    page,
    render: renderToString,
    layer: Layer,
    loading: (url: string) => {
      if (!url.startsWith('/ssr/layer-loading-base')) {
        return undefined
      }

      const pages = import.meta.glob<DefineComponent>('./Pages/SSR/**/*.vue', { eager: true })
      return pages['./Pages/SSR/LayerLoading.vue']
    },
    serverHead: (page) => page.props.head as string[],
    resolve: (name) => {
      const pages = import.meta.glob<DefineComponent>('./Pages/SSR/**/*.vue', { eager: true })
      return pages[`./Pages/${name}.vue`]
    },
    setup({ App, props, plugin }) {
      return createSSRApp({
        render: () => h(App, props),
      }).use(plugin)
    },
    ...(page.url.includes('withTitleCallback') && {
      title: (title, page) => [title, page.props.titleSuffix].filter(Boolean).join(' | '),
    }),
  }),
)
