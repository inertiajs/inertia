import { router, setupProgress, type InertiaAppResponse, type Page } from '@inertiajs/core'
import type { ComponentType } from 'svelte'
import App from './components/App.svelte'
import SSR, { type SSRProps } from './components/SSR.svelte'
import store from './store'
import type { ComponentResolver, InertiaComponentType } from './types'

type SSRRenderResult = { html: string; head: string; css?: { code: string } }
type SSRComponentType = ComponentType<SSR> & { render?: (props: SSRProps) => SSRRenderResult }

interface CreateInertiaAppProps {
  id?: string
  resolve: ComponentResolver
  setup: (props: {
    el: Element
    App: ComponentType<App> | SSRComponentType
    props: {
      initialPage: Page
      resolveComponent: ComponentResolver
    }
  }) => void | SSRRenderResult
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
  }

  let result = setup({
    // @ts-expect-error
    el,
    App: !isServer ? App : SSR,
    props: {
      id,
      initialPage,
      resolveComponent,
    },
  })

  if (isServer) {
    if (!result && typeof (SSR as SSRComponentType).render !== 'function') {
      throw new Error(`setup(...) must return rendered result when in SSR mode.`)
    } else if (!result) {
      console.warn('Deprecated: setup(...) must be defined and must return rendered result in SSR mode.')
      console.warn('For Svelte 5: `return render(App, { props })` or for Svelte 4: `return App.render(props)`')
      result = (SSR as SSRComponentType).render!({ id, initialPage })
    }

    const { html, head, css } = result

    return {
      body: html,
      head: [
        head,
        // Note: Svelte 5 no longer output CSS
        ...(css?.code ? [`<style data-vite-css>${css?.code}</style>`] : []),
      ],
    }
  }
}
