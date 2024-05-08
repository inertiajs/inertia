import { mount, hydrate } from "svelte";
import { createInertiaApp } from '../../../../packages/svelte/src/index.js'

createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob('./Pages/**/*.svelte', { eager: true })
    return pages[`./Pages/${name}.svelte`]
  },
  setup({ el, App }) {
    if (el.dataset.serverRendered === "true") {
      hydrate(App, { target: el })
    } else {
      mount(App, { target: el })
    }
  },
})
