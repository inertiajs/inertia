import Vue from 'vue'
import { InertiaApp, plugin } from '@inertiajs/inertia-vue'

if (window.location.href.indexOf('use-deprecated-vue-plugin') > -1) {
  Vue.use(InertiaApp)
} else {
  Vue.use(plugin)
}

const app = document.getElementById('app')

window.vm = new Vue({
  render: h => h(InertiaApp, {
    props: {
      initialPage: JSON.parse(app.dataset.page),
      resolveComponent: name => {
        return import(`./Pages/${name}`).then(module => module.default)
      },
    },
  }),
}).$mount(app)
