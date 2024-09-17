import { createInertiaApp } from '@inertiajs/vue3'
import createServer from '@inertiajs/vue3/server'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h, type DefineComponent } from 'vue'
import { createHead, useHead } from '@unhead/vue'

createServer((page) =>
  createInertiaApp({
    page,
    render: renderToString,
    resolve: (name) => {
      const pages = import.meta.glob('./Pages/**/*.vue', { eager: true })
      return pages[`./Pages/${name}.vue`] as DefineComponent
    },
    setup({ App, props, plugin }) {
      const head = createHead()

      useHead({
        titleTemplate: (title) => `${title} - Vue 3 Playground`,
      })

      return createSSRApp({
        render: () => h(App, props),
      }).use(plugin).use(head)
    },
  }),
)
