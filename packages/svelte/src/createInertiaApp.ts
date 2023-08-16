import { Page, router, setupProgress } from '@inertiajs/core'
import { ComponentType } from 'svelte'
import SvelteApp from './components/App.svelte'
import SSR from './components/SSR.svelte'
import store from './store'
import { ComponentResolver, InertiaComponentType } from './types'

interface CreateInertiaAppProps {
  id?: string
  resolve: ComponentResolver
  setup: (props: {
    el: Element
    App: ComponentType<SvelteApp>
    props: {
      initialPage: Page
      resolveComponent: ComponentResolver
    }
  }) => void | SvelteApp
  progress?:
    | false
    | {
        delay?: number
        color?: string
        includeCSS?: boolean
        showSpinner?: boolean
      }
  page?: Page
}

export default async function createInertiaApp({
  id = 'app',
  resolve,
  setup,
  progress = {},
  page,
}: CreateInertiaAppProps): Promise<{ head: string[]; body: string }> {
  const isServer = typeof window === 'undefined'
  const el = isServer ? null : document.getElementById(id)
  const initialPage = page || JSON.parse(el.dataset.page)
  const resolveComponent = (name) => Promise.resolve(resolve(name))

  await resolveComponent(initialPage.component).then((initialComponent) => {
    store.set({
      component: initialComponent as unknown as InertiaComponentType,
      page: initialPage,
    })
  })

  if (!isServer) {
    router.init({
      initialPage,
      resolveComponent,
      swapComponent: async ({ component, page, preserveState }) => {
        store.update((current) => ({
          component: component as InertiaComponentType,
          page,
          key: preserveState ? current.key : Date.now(),
        }))
      },
    })

    if (progress) {
      setupProgress(progress)
    }

    setup({
      el,
      App: SvelteApp,
      props: {
        initialPage,
        resolveComponent,
      },
    })
  }

  if (isServer) {
    // Svelte types are written for the DOM API and not the SSR API.
    const { html, head } = (SSR as any).render({ id, initialPage })

    return {
      body: html,
      head: [head],
    }
  }
}
