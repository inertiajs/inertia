import { router, setupProgress, type Page } from '@inertiajs/core'
import type { ComponentType } from 'svelte'
import { render } from 'svelte/server'
import App from './App.svelte'
import SSR from './SSR.svelte'
import store from './store.svelte'
import type { ComponentResolver, InertiaComponentType } from './types'

interface CreateInertiaAppProps {
  id?: string
  resolve: ComponentResolver
  setup: (props: {
    el: Element
    App: ComponentType<App>
    props: {
      initialPage: Page
      resolveComponent: ComponentResolver
    }
  }) => void | App
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
}: CreateInertiaAppProps) {
  const isServer = typeof window === 'undefined'
  const el = isServer ? null : document.getElementById(id)
  const initialPage: Page = page || JSON.parse(el?.dataset?.page || '{}')
  const resolveComponent = (name: string) => Promise.resolve(resolve(name))

  await resolveComponent(initialPage.component).then((initialComponent) => {
    store.component = initialComponent as InertiaComponentType
    store.page = initialPage
  })

  if (!isServer) {
    if (!el) {
      throw new Error(`Element with ID "${id}" not found.`)
    }

    router.init({
      initialPage,
      resolveComponent,
      swapComponent: async ({ component, page, preserveState }) => {
        store.component = component as InertiaComponentType
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
    const { html, head } = render(SSR as any, { props: { id, initialPage } })

    return {
      body: html,
      head: [head],
    }
  }
}
