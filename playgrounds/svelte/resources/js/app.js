import { createInertiaApp } from '@inertiajs/svelte'
import { hydrate, mount } from 'svelte'

createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob('./Pages/**/*.svelte', { eager: true })
    return pages[`./Pages/${name}.svelte`]
  },
  setup({ el, App }) {
    // Svelte 4: new App({ target: el, hydrate: true })

    // Svelte 5
    if (el.dataset.serverRendered === 'true') {
      hydrate(App, { target: el })
    } else {
      mount(App, { target: el })
    }
  },
})
