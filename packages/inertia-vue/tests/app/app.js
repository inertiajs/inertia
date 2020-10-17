import Vue from 'vue'
import { InertiaApp, plugin } from '@inertiajs/inertia-vue'

if (window.location.pathname === '/plugin/deprecated') {
  Vue.use(InertiaApp)
} else if (window.location.pathname !== '/plugin/without') {
  Vue.use(plugin)
}

const app = document.getElementById('app')

window.vm = new Vue({
  render: h => h(InertiaApp, {
    props: {
      initialPage: window.initialPage,
      resolveComponent: name => {
        return import(`./Pages/${name}`).then(module => module.default)
      },
    },
  }),
}).$mount(app)
