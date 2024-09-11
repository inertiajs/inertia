import { VERSION } from 'svelte/compiler'
import { router, setupProgress, type InertiaAppResponse, type Page } from '@inertiajs/core'
import type { ComponentType } from 'svelte'
import escape from 'html-escape'
import App from './components/App.svelte'
import SSR, { type SSRProps } from './components/SSR.svelte'
import store from './store'
import type { ComponentResolver, ResolvedComponent } from './types'

type SvelteRenderResult = { html: string; head: string; css?: { code: string } }
type SSRComponent = ComponentType<SSR> & { render: (props: SSRProps) => SvelteRenderResult }

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
}: CreateInertiaAppProps): InertiaAppResponse {
  const isServer = typeof window === 'undefined'
  const el = isServer ? null : document.getElementById(id)
  const initialPage: Page = page || JSON.parse(el?.dataset?.page || '{}')
  const resolveComponent = (name: string) => Promise.resolve(resolve(name))

  await resolveComponent(initialPage.component).then((initialComponent) => {
    store.set({
      component: initialComponent,
      page: initialPage,
    })
  })

  if (isServer) {
    const isSvelte5 = VERSION.startsWith('5')
    const { html, head, css } = await (async () => {
      if (isSvelte5) {
        const svelteServer = await dynamicImport('svelte/server')
        if (svelteServer && typeof svelteServer.render === 'function') {
          return svelteServer.render(App)
        }
      }

      return (SSR as SSRComponent).render({ id, initialPage })
    })() as SvelteRenderResult

    return css
      ? {
          body: html,
          head: [head, `<style data-vite-css>${css.code}</style>`],
        }
      : {
          body: `<div data-server-rendered="true" id="${id}" data-page="${escape(JSON.stringify(initialPage))}">${html}</div>`,
          head: [head],
        }
  }

  if (!el) {
    throw new Error(`Element with ID "${id}" not found.`)
  }

  router.init({
    initialPage,
    resolveComponent,
    swapComponent: async ({ component, page, preserveState }) => {
      store.update((current) => ({
        component: component as ResolvedComponent,
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
    App,
    props: {
      initialPage,
      resolveComponent,
    },
  })
}

async function dynamicImport(modulePath: string) {
  try {
    return await import(/* @vite-ignore */ modulePath)
  } catch {
    return null
  }
}