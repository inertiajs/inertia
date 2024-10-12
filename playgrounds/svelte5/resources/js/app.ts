import { createInertiaApp } from 'inertiax-svelte'
import { hydrate, mount } from 'svelte'
import type { ResolvedComponent } from 'inertiax-svelte'

createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob<ResolvedComponent>('./Pages/**/*.svelte', { eager: true })
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
