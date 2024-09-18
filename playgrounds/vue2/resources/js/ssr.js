import { createInertiaApp } from '@inertiajs/vue2'
import createServer from '@inertiajs/vue2/server'
import Vue from 'vue'
import { createRenderer } from 'vue-server-renderer'

createServer((page) =>
  createInertiaApp({
    page,
    render: createRenderer().renderToString,
    title: (title) => `${title} - Vue 2 Playground`,
    resolve: (name) => {
      const pages = import.meta.glob('./Pages/**/*.vue', { eager: true })
      return pages[`./Pages/${name}.vue`]
    },
    setup({ App, props, plugin }) {
      Vue.use(plugin)
      return new Vue({
        render: (h) => h(App, props),
      })
    },
  }),
)
