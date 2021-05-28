import Vue from 'vue'
import app, { plugin } from './app'

export default async function createInertiaApp({ id = 'app', resolve, setup, page, render }) {
  const isServer = typeof window === 'undefined'
  const el = isServer ? null : document.getElementById(id)
  const initialPage = page || JSON.parse(el.dataset.page)
  const resolveComponent = name => Promise.resolve(resolve(name)).then(module => module.default || module)

  Vue.use(plugin)

  let head = []

  const vueApp = await resolveComponent(initialPage.component).then(initialComponent => {
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
          onHeadUpdate: isServer ? elements => (head = elements) : null,
        },
      },
    })
  })

  if (isServer) {
    return render(vueApp)
      .then(body => ({ head, body }))
  }
}
