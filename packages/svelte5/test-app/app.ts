import { createInertiaApp, type ResolvedComponent, router } from '@inertiajs/svelte5'

window.testing = { Inertia: router }

createInertiaApp({
  page: window.initialPage,
  resolve: async (name) => {
    const pages = import.meta.glob<ResolvedComponent>('./Pages/**/*.svelte', { eager: true })

    if (name === 'DeferredProps/InstantReload') {
      // Add small delay to ensure the component is loaded after the initial page load
      // This is for projects that don't use { eager: true } in import.meta.glob
      await new Promise((resolve) => setTimeout(resolve, 50))
    }

    return pages[`./Pages/${name}.svelte`]
  },
  setup({ el, App, props }) {
    new App({ target: el!, props })
  },
})
