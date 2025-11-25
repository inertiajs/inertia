import { App as VueApp, createSSRApp, h } from 'vue'
import App, { InertiaAppProps, plugin } from './app'

export function createVueApp(el: HTMLElement | null, props: InertiaAppProps): VueApp {
  const app = createSSRApp({
    render: () => h(App, props),
  }).use(plugin)

  const isServer = typeof window === 'undefined'

  if (!isServer && el) {
    app.mount(el)
  }

  return app
}
