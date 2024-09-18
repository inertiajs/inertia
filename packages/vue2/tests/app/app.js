import { createInertiaApp, Link, router } from '@inertiajs/vue2'
import Vue from 'vue'

Vue.component('InertiaLink', Link)

window.testing = {}
window.testing.Inertia = router

createInertiaApp({
  page: window.initialPage,
  resolve: (name) => {
    const pages = import.meta.glob('./Pages/**/*.vue', { eager: true })
    return pages[`./Pages/${name}.vue`]
  },
  setup({ el, App, props, plugin }) {
    if (!window.location.pathname.startsWith('/plugin/without')) {
      Vue.use(plugin)
    }

    window.testing.vue = new Vue({
      render: (h) => h(App, props),
      methods: {
        tap: (value, callback) => {
          callback(value)
          return value
        },
      },
    }).$mount(el)
  },
})
