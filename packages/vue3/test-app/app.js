import { createInertiaApp } from '@inertiajs/vue3'
import { createApp, h } from 'vue'

createInertiaApp({
  page: window.initialPage,
  resolve: (name) => {
    const pages = import.meta.glob('./Pages/**/*.vue', { eager: true })
    return pages[`./Pages/${name}.vue`]
  },
  setup({ el, App, props, plugin }) {
    const inst = createApp({ render: () => h(App, props) })

    if (!window.location.pathname.startsWith('/plugin/without')) {
      inst.use(plugin)
    }

    inst.mount(el)
  },
})
