import { router, setupProgress, type InertiaAppResponse, type Page } from '@inertiajs/core'
import type { ComponentType } from 'svelte'
import SvelteApp from './components/App.svelte'
import SSR from './components/SSR.svelte'
import store from './store'
import type { ComponentResolver, InertiaComponentType } from './types'

interface CreateInertiaAppProps {
  id?: string
  resolve: ComponentResolver
  setup: (props: {
    el: Element
    // @ts-ignore
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
}: CreateInertiaAppProps): InertiaAppResponse {
  const isServer = typeof window === 'undefined'
  const el = isServer ? null : document.getElementById(id)
  const initialPage = page || JSON.parse(el?.dataset.page ?? '{}')
  const resolveComponent = (name: string) => Promise.resolve(resolve(name))

  await resolveComponent(initialPage.component).then((initialComponent) => {
    store.set({
      component: initialComponent as unknown as InertiaComponentType,
      page: initialPage,
    })
  })

  if (!isServer) {
    if (!el) {
      throw new Error(`Element with ID "${id}" not found.`)
    }

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

    return
  }

  // Svelte types are written for the DOM API and not the SSR API.
  const { html, head, css } = (SSR as any).render({ id, initialPage })

  return {
    body: html,
    head: [head, `<style data-vite-css>${css.code}</style>`],
  }
}
