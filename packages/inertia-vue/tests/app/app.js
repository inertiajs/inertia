import Vue from 'vue'
import { InertiaApp } from '@inertiajs/inertia-vue'

Vue.use(InertiaApp)

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
