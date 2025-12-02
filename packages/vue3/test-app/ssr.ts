import { createInertiaApp } from '@inertiajs/vue3'
import createServer from '@inertiajs/vue3/server'
import { createSSRApp, h, type DefineComponent } from 'vue'
import { renderToString } from 'vue/server-renderer'

createServer((page) =>
  createInertiaApp({
    page,
    render: renderToString,
    resolve: (name) => {
      const pages = import.meta.glob<DefineComponent>('./Pages/SSR/**/*.vue', { eager: true })
      return pages[`./Pages/${name}.vue`]
    },
    setup({ App, props, plugin }) {
      return createSSRApp({
        render: () => h(App, props),
      }).use(plugin)
    },
  }),
)
