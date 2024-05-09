import { router, setupProgress } from '@inertiajs/core'
import { render } from 'svelte/server'
import App from './App.svelte'
import SSR from './SSR.svelte'
import store from './store.svelte'

export default async function createInertiaApp({ id = 'app', resolve, setup, progress = {}, page }) {
  const isServer = typeof window === 'undefined'
  const el = isServer ? null : document.getElementById(id)
  const initialPage = page || JSON.parse(el.dataset.page)
  const resolveComponent = (name) => Promise.resolve(resolve(name))

  await resolveComponent(initialPage.component).then((initialComponent) => {
    store.component = initialComponent
    store.page = initialPage
  })

  if (!isServer) {
    router.init({
      initialPage,
      resolveComponent,
      swapComponent: async ({ component, page, preserveState }) => {
        store.component = component
        store.page = page
        store.key = preserveState ? store.key : Date.now()
      },
    })

    if (progress) {
      setupProgress(progress)
    }

    return setup({
      el,
      App,
      props: {
        initialPage,
        resolveComponent,
      },
    })
  }

  if (isServer) {
    const { html, head } = render(SSR, { props: { id, initialPage } })

    return {
      body: html,
      head: [head],
    }
  }
}
