import { createInertiaApp } from '@inertiajs/svelte5'
import { hydrate, mount } from 'svelte'

createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob('./Pages/**/*.svelte', { eager: true })
    return pages[`./Pages/${name}.svelte`]
  },
  setup({ el, App }) {
    if (el.dataset.serverRendered === 'true') {
      hydrate(App, { target: el })
    } else {
      mount(App, { target: el })
    }
  },
})
