import { createSSRApp, h } from 'vue'
import { default as app, plugin } from './app'

export default async function createInertiaApp({ id = 'app', resolve, setup, page, render }) {
  const isServer = typeof window === 'undefined'
  const el = isServer ? null : document.getElementById(id)
  const initialPage = page || JSON.parse(el.dataset.page)
  const resolveComponent = name => Promise.resolve(resolve(name)).then(module => module.default || module)

  let head = []

  const vueApp = await resolveComponent(initialPage.component).then(initialComponent => {
    return setup({
      el,
      app,
      props: {
        initialPage,
        initialComponent,
        resolveComponent,
        onHeadUpdate: isServer ? elements => (head = elements) : null,
      },
      plugin,
    })
  })

  if (isServer) {
    const body = await render(createSSRApp({
      render: () => h('div', {
        id,
        'data-page': JSON.stringify(initialPage),
        innerHTML: render(vueApp),
      }),
    }))

    return { head, body }
  }
}
