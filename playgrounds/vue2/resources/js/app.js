import { createInertiaApp } from '@inertiajs/vue2'
import Vue from 'vue'

createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob('./Pages/**/*.vue', { eager: true })
    return pages[`./Pages/${name}.vue`]
  },
  setup({ el, App, props, plugin }) {
    Vue.use(plugin)

    new Vue({
      render: (h) => h(App, props),
    }).$mount(el)
  },
})
