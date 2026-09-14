import type { Page } from '@inertiajs/core'
import { createInertiaApp, router } from '@inertiajs/vue3'
import { createApp, h, type DefineComponent } from 'vue'
import { createHost } from '../../../tests/app/external-navigation'

window.testing = { Inertia: router }

const host: ReturnType<typeof createHost<Page>> = createHost<Page>(async (page) => {
  const options = {
    page,
    dev: true,
    serverHead: true,
    externalNavigation: host,
    resolve: async (name: string, page?: Page) => {
      const pages = import.meta.glob<DefineComponent>('./Pages/**/*.vue', { eager: true })

      if (page?.props.waitForComponent) {
        await fetch('/external-navigation/ready')
      }

      return pages[`./Pages/${name}.vue`]
    },
  }

  if (new URLSearchParams(location.search).has('custom')) {
    let unmount = () => {}

    await createInertiaApp({
      ...options,
      setup({ el, App, props, plugin }) {
        const app = createApp({ render: () => h(App, props) }).use(plugin)
        unmount = () => app.unmount()
        app.mount(el)
      },
    })

    return { dispose: unmount }
  }

  const app = await createInertiaApp(options)

  if (typeof app === 'function') {
    throw new Error('Expected a browser mount')
  }

  return app
})

void host.start(window.initialPage!)
