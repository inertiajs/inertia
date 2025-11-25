import { hydrate, mount } from 'svelte'
import { render } from 'svelte/server'
import type { InertiaAppProps } from './components/App.svelte'
import App from './components/App.svelte'

type SvelteApp = ReturnType<typeof render> | ReturnType<typeof mount> | ReturnType<typeof hydrate>

export function createSvelteApp(el: HTMLElement | null, props: InertiaAppProps): SvelteApp {
  const isServer = typeof window === 'undefined'

  if (isServer) {
    return render(App, { props })
  }

  if (el?.dataset.serverRendered === 'true') {
    return hydrate(App, { target: el, props })
  }

  return mount(App, { target: el as HTMLElement, props })
}
