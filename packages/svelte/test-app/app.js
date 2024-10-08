import { createInertiaApp, router } from '@inertiajs/svelte'

window.testing = { Inertia: router }

createInertiaApp({
  page: window.initialPage,
  resolve: (name) => {
    const pages = import.meta.glob('./Pages/**/*.svelte', { eager: true })
    return pages[`./Pages/${name}.svelte`]
  },
  setup({ el, App }) {
    new App({ target: el })
  },
})
