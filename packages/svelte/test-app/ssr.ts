import { createInertiaApp, type ResolvedComponent } from '@inertiajs/svelte'
import createServer from '@inertiajs/svelte/server'
import { render } from 'svelte/server'
import Layer from './Layouts/Layer.svelte'

createServer((page) =>
  createInertiaApp({
    page,
    layer: Layer,
    loading: (url: string) => {
      if (!url.startsWith('/ssr/layer-loading-base')) {
        return undefined
      }

      const pages = import.meta.glob<ResolvedComponent>('./Pages/SSR/**/*.svelte', { eager: true })
      return pages['./Pages/SSR/LayerLoading.svelte']
    },
    serverHead: (page) => page.props.head as string[],
    resolve: (name) => {
      const pages = import.meta.glob<ResolvedComponent>('./Pages/SSR/**/*.svelte', { eager: true })
      return pages[`./Pages/${name}.svelte`]
    },
    setup({ App, props }) {
      return render(App, { props })
    },
  }),
)
