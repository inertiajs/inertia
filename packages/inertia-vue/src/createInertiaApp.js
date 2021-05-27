import Vue from 'vue'
import app, { plugin } from './app'

export default function createInertiaApp({ id = 'app', page, resolve, onHeadUpdate, setup }) {
  const isServer = typeof window === 'undefined'
  const el = isServer ? null : document.getElementById(id)
  const initialPage = page || JSON.parse(el.dataset.page)
  const resolveComponent = name => Promise.resolve(resolve(name)).then(module => module.default || module)

  Vue.use(plugin)

  return resolveComponent(initialPage.component).then(initialComponent => {
    return setup({
      el,
      app,
      props: {
        attrs: {
          id,
          'data-page': JSON.stringify(initialPage),
        },
        props: {
          initialPage,
          initialComponent,
          resolveComponent,
          onHeadUpdate,
        },
      },
    })
  })
}
