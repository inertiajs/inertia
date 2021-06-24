import Vue from 'vue'
import { App, Link, plugin } from '@inertiajs/inertia-vue'
import { Inertia } from '@inertiajs/inertia'

if (! window.location.pathname.startsWith('/plugin/without')) {
  Vue.use(plugin)
}

Vue.component('InertiaLink', Link)

const app = document.getElementById('app')

window.testing = {}
window.testing.Inertia = Inertia
window.testing.vue = new Vue({
  render: h => h(App, {
    props: {
      initialPage: window.initialPage,
      resolveComponent: name => {
        return import(`./Pages/${name}`).then(module => module.default)
      },
    },
  }),
  methods: {
    tap: (value, callback) => {
      callback(value)
      return value
    },
  },
}).$mount(app)
