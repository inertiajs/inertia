import { hydrate, mount, render } from 'svelte'
import type { InertiaAppProps } from './components/App.svelte'
import App from './components/App.svelte'

export function createSvelteApp(el: HTMLElement | null, props: InertiaAppProps) {
  const isServer = typeof window === 'undefined'

  if (isServer) {
    return render(App, { props })
  }

  if (el?.dataset.serverRendered === 'true') {
    return hydrate(App, { target: el, props })
  }

  return mount(App, { target: el, props })
}
