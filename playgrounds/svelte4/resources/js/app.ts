import { createInertiaApp } from '@inertiajs/svelte'
import type { ResolvedComponent } from '@inertiajs/svelte'

createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob<ResolvedComponent>('./Pages/**/*.svelte', { eager: true })
    return pages[`./Pages/${name}.svelte`]
  },
  setup({ el, App }) {
    new App({ target: el, hydrate: true })
  },
})
