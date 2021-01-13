import Vue from 'vue'
import { InertiaApp, plugin } from '@inertiajs/inertia-vue'
import { Inertia } from '@inertiajs/inertia'

if (window.location.pathname.startsWith('/plugin/deprecated')) {
  Vue.use(InertiaApp)
} else if (! window.location.pathname.startsWith('/plugin/without')) {
  Vue.use(plugin)
}

const transformProps = props => {
  return {
    ... props,
    bar: 'transformed',
  }
}

const app = document.getElementById('app')

window.testing = {}
window.testing.Inertia = Inertia
window.testing.vue = new Vue({
  render: h => h(InertiaApp, {
    props: {
      initialPage: window.initialPage,
      resolveComponent: name => {
        return import(`./Pages/${name}`).then(module => module.default)
      },
      ... (window.location.pathname.startsWith('/transform-props') ? { transformProps } : {}),
    },
  }),
}).$mount(app)
