import { Inertia } from '@inertiajs/inertia'
import SSR from './SSR.svelte'
import App from './App.svelte'
import store from './store'

export default async function createInertiaApp({ id = 'app', resolve, setup, visitOptions, page }) {
  const isServer = typeof window === 'undefined'
  const el = isServer ? null : document.getElementById(id)
  const initialPage = page || JSON.parse(el.dataset.page)
  const resolveComponent = name => Promise.resolve(resolve(name))

  const initialComponent = await resolveComponent(initialPage.component)

  store.set({
    component: initialComponent,
    page: initialPage,
    key: null
  })

  if (isServer) {
    const { html, head } = SSR.render({id, initialPage})
    return {
      body: html,
      head: [head]
    }
  }
  else {
    Inertia.init({
      initialPage,
      resolveComponent,
      swapComponent: async ({ component, page, preserveState }) => {
        store.update((current) => ({
          component,
          page,
          key: preserveState ? current.key : Date.now()
        }))
      },
      visitOptions
    })
    return setup({
      el,
      App,
      props: {
        initialPage,
        initialComponent,
        resolveComponent,
        visitOptions,
      },
    })
  }
}
