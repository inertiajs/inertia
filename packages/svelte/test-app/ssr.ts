import { createInertiaApp, type ResolvedComponent } from '@inertiajs/svelte'
import createServer from '@inertiajs/svelte/server'

createServer((page) =>
  createInertiaApp({
    page,
    resolve: (name) => {
      const pages = import.meta.glob<ResolvedComponent>('./Pages/SSR/**/*.svelte', { eager: true })
      return pages[`./Pages/${name}.svelte`]
    },
    setup({ App, props }) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (App as any).render(props)
    },
    defaults: {
      future: {
        useScriptElementForInitialPage: page.component === 'SSR/PageWithScriptElement',
      },
    },
  }),
)
