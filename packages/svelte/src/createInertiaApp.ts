import {
  router,
  setupProgress,
  type CreateInertiaAppOptionsForCSR,
  type InertiaAppResponse,
  type PageProps,
} from '@inertiajs/core'
import { escape } from 'lodash-es'
import App, { type InertiaAppProps } from './components/App.svelte'
import { config } from './index'
import type { ComponentResolver, SvelteInertiaAppConfig } from './types'

type SvelteRenderResult = { html: string; head: string; css?: { code: string } }

type SetupOptions<SharedProps extends PageProps> = {
  el: HTMLElement | null
  App: typeof App
  props: InertiaAppProps<SharedProps>
}

// Svelte doesn't use CreateInertiaAppOptionsForSSR as it doesn't pass a
// 'render' function, it calls it directly in the setup() method...
type InertiaAppOptions<SharedProps extends PageProps> = CreateInertiaAppOptionsForCSR<
  SharedProps,
  ComponentResolver,
  SetupOptions<SharedProps>,
  SvelteRenderResult | void,
  SvelteInertiaAppConfig
>

export default async function createInertiaApp<SharedProps extends PageProps = PageProps>({
  id = 'app',
  resolve,
  setup,
  progress = {},
  page,
  defaults = {},
}: InertiaAppOptions<SharedProps>): InertiaAppResponse {
  config.replace(defaults)

  const isServer = typeof window === 'undefined'
  const el = isServer ? null : document.getElementById(id)
  const initialPage = page || JSON.parse(el?.dataset.page || '{}')

  const resolveComponent = (name: string) => Promise.resolve(resolve(name))

  const svelteApp = await Promise.all([
    resolveComponent(initialPage.component),
    router.decryptHistory().catch(() => {}),
  ]).then(([initialComponent]) => {
    return setup({
      el,
      App,
      props: { initialPage, initialComponent, resolveComponent },
    })
  })

  if (isServer && svelteApp) {
    const { html, head, css } = svelteApp

    return {
      body: `<div data-server-rendered="true" id="${id}" data-page="${escape(JSON.stringify(initialPage))}">${html}</div>`,
      head: [head, css ? `<style data-vite-css>${css.code}</style>` : ''],
    }
  }

  if (!isServer && progress) {
    setupProgress(progress)
  }
}
