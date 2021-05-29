import App from './App'

export default async function createInertiaApp({ id = 'app', resolve, setup, page, render }) {
  const isServer = typeof window === 'undefined'
  const el = isServer ? null : document.getElementById(id)
  const initialPage = page || JSON.parse(el.dataset.page)
  const resolveComponent = name => Promise.resolve(resolve(name))

  let head = []

  const svelteApp = await resolveComponent(initialPage.component).then(initialComponent => {
    return setup({
      el,
      App,
      props: {
        initialPage,
        initialComponent,
        resolveComponent,
        onHeadUpdate: isServer ? elements => (head = elements) : null,
      },
    })
  })

  if (isServer) {
    // TODO
  }
}
