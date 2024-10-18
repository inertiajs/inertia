import { createInertiaApp, type ResolvedComponent, router } from '@inertiajs/svelte'

window.testing = { Inertia: router }

createInertiaApp({
  page: window.initialPage,
  resolve: (name) => {
    const pages = import.meta.glob<ResolvedComponent>('./Pages/**/*.svelte', { eager: true })
    return pages[`./Pages/${name}.svelte`]
  },
  setup({ el, App, props }) {
    new App({ target: el, props })
  },
})
