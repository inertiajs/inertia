import { createInertiaApp } from '@inertiajs/vue3'
import { createSSRApp, h, type DefineComponent } from 'vue'
import { createHead, useHead } from '@unhead/vue'

createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob('./Pages/**/*.vue', { eager: true })
    return pages[`./Pages/${name}.vue`] as DefineComponent
  },
  setup({ el, App, props, plugin }) {
    const head = createHead()

    useHead({
        titleTemplate: (title) => `${title} - Vue 3 Playground`,
    })

    createSSRApp({ render: () => h(App, props) })
      .use(plugin)
      .use(head)
      .mount(el)
  },
})
