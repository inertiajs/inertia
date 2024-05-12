import { createInertiaApp, Link, router } from '@inertiajs/vue3'
import { createApp, createSSRApp, h } from 'vue'

window.testing = {}
window.testing.Inertia = router

createInertiaApp({
  page: window.initialPage,
  resolve: (name) => {
    const pages = import.meta.glob('./Pages/**/*.vue', { eager: true })
    return pages[`./Pages/${name}.vue`]
  },
  setup({ el, App, props, plugin }) {
    const withPlugin = !window.location.pathname.startsWith('/plugin/without')

    // Required for testing purposes
    props.initialComponent.inheritAttrs = true

    window.testing.vue = createSSRApp(App, props)
    .component('InertiaLink', Link)
    .use(withPlugin ? plugin : undefined)
    .mount(el)
  },
})
