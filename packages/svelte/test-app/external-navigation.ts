import type { Page } from '@inertiajs/core'
import { createInertiaApp, router, type ResolvedComponent } from '@inertiajs/svelte'
import { mount, unmount } from 'svelte'
import { createHost } from '../../../tests/app/external-navigation'

window.testing = { Inertia: router }

const host: ReturnType<typeof createHost<Page>> = createHost<Page>(async (page) => {
  const options = {
    page,
    dev: true,
    serverHead: true,
    externalNavigation: host,
    resolve: async (name: string, page?: Page) => {
      const pages = import.meta.glob<ResolvedComponent>('./Pages/**/*.svelte', { eager: true })

      if (page?.props.waitForComponent) {
        await fetch('/external-navigation/ready')
      }

      return pages[`./Pages/${name}.svelte`] as ResolvedComponent
    },
  }

  if (new URLSearchParams(location.search).has('custom')) {
    let dispose = async () => {}

    await createInertiaApp({
      ...options,
      setup({ el, App, props }) {
        const app = mount(App, { target: el!, props })
        dispose = () => unmount(app)
      },
    })

    return { dispose }
  }

  const app = await createInertiaApp(options)

  if (typeof app === 'function') {
    throw new Error('Expected a browser mount')
  }

  return app
})

void host.start(window.initialPage!)
