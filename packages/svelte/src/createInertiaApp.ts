import { router, setupProgress, type InertiaAppResponse, type Page } from '@inertiajs/core'
import escape from 'html-escape'
import type { ComponentType } from 'svelte'
import { version as SVELTE_VERSION } from 'svelte/package.json'
import App from './components/App.svelte'
import store from './store'
import type { ComponentResolver, ResolvedComponent } from './types'

type SvelteRenderResult = { html: string; head: string; css?: { code: string } }
type AppComponent = ComponentType<App> & { render: () => SvelteRenderResult }

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
      key: null,
    })
  })

  if (isServer) {
    const isSvelte5 = SVELTE_VERSION.startsWith('5')
    const { html, head, css } = await (async () => {
      if (isSvelte5) {
        const { render } = await dynamicImport('svelte/server')
        if (typeof render === 'function') {
          return render(App) as SvelteRenderResult
        }
      }

      return (App as AppComponent).render()
    })()

    return {
      body: `<div data-server-rendered="true" id="${id}" data-page="${escape(JSON.stringify(initialPage))}">${html}</div>`,
      head: [head, css ? `<style data-vite-css>${css.code}</style>` : ''],
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

// Loads the module dynamically during execution instead of at
// build time. The `@vite-ignore` flag prevents Vite from
// analyzing or pre-bundling this import.
async function dynamicImport(module: string) {
  try {
    return await import(/* @vite-ignore */ module)
  } catch {
    return null
  }
}
