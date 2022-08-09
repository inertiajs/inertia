import App from './App'
import { createElement } from 'react'

export default async function createInertiaApp({ id = 'app', resolve, setup, title, page, render }) {
  const isServer = typeof window === 'undefined'
  const el = isServer ? null : document.getElementById(id)
  const initialPage = page || JSON.parse(el.dataset.page)
  const resolveComponent = name => Promise.resolve(resolve(name)).then(module => module.default || module)

  let head = []

  const reactApp = await resolveComponent(initialPage.component).then(initialComponent => {
    return setup({
      el,
      App,
      props: {
        initialPage,
        initialComponent,
        resolveComponent,
        titleCallback: title,
        onHeadUpdate: isServer ? elements => (head = elements) : null,
      },
    })
  })

  if (isServer) {
    const body = await render(
      createElement('div', {
        id,
        'data-page': JSON.stringify(initialPage),
      }, reactApp)
    )

    return { head, body }
  }
}
