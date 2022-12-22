import { router, setupProgress } from '@inertiajs/core'
import App from './App.svelte'
import SSR from './SSR.svelte'
import store from './store'

export default async function createInertiaApp({ id = 'app', resolve, setup, progress = {}, page }) {
  const isServer = typeof window === 'undefined'
  const el = isServer ? null : document.getElementById(id)
  const initialPage = page || JSON.parse(el.dataset.page)
  const resolveComponent = (name) => Promise.resolve(resolve(name))

  await resolveComponent(initialPage.component).then((initialComponent) => {
    store.set({
      component: initialComponent,
      page: initialPage,
    })
  })

  if (!isServer) {
    router.init({
      initialPage,
      resolveComponent,
      swapComponent: async ({ component, page, preserveState }) => {
        store.update((current) => ({
          component,
          page,
          key: preserveState ? current.key : Date.now(),
        }))
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
    const { html, head } = SSR.render({ id, initialPage })

    return {
      body: html,
      head: [head],
    }
  }
}
