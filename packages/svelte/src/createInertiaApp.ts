import {
  getInitialPageFromDOM,
  router,
  setupProgress,
  type CreateInertiaAppOptionsForCSR,
  type InertiaAppResponse,
  type Page,
  type PageProps,
} from '@inertiajs/core'
import { escape } from 'lodash-es'
import App, { type InertiaAppProps } from './components/App.svelte'
import { config } from './index'
import type { ComponentResolver, SvelteInertiaAppConfig } from './types'

type SvelteRenderResult = { body: string; head: string; css?: { code: string } }

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
  const useScriptElementForInitialPage = config.get('future.useScriptElementForInitialPage')
  const initialPage = page || getInitialPageFromDOM<Page<SharedProps>>(id, useScriptElementForInitialPage)!

  const resolveComponent = (name: string) => Promise.resolve(resolve(name))

  const [initialComponent] = await Promise.all([
    resolveComponent(initialPage.component),
    router.decryptHistory().catch(() => {}),
  ]).then(([initialComponent]) => {
    return setup({
      el: isServer ? null : document.getElementById(id),
      App,
      props: { initialPage, initialComponent, resolveComponent },
    })
  ])

  const props: InertiaAppProps<SharedProps> = { initialPage, initialComponent, resolveComponent }

  const svelteApp = await setup({
    el,
    App,
    props,
  })

  if (isServer && svelteApp) {
    const { body, head, css } = svelteApp

    return {
      body: useScriptElementForInitialPage
        ? `<script data-page="${id}" type="application/json">${JSON.stringify(initialPage).replace(/\//g, '\\/')}</script><div data-server-rendered="true" id="${id}">${html}</div>`
        : `<div data-server-rendered="true" id="${id}" data-page="${escape(JSON.stringify(initialPage))}">${html}</div>`,
        ? `<script data-page="${id}" type="application/json">${JSON.stringify(initialPage)}</script><div data-server-rendered="true" id="${id}">${body}</div>`
        : `<div data-server-rendered="true" id="${id}" data-page="${escape(JSON.stringify(initialPage))}">${body}</div>`,
      head: [head, css ? `<style data-vite-css>${css.code}</style>` : ''],
    }
  }

  if (!isServer && progress) {
    setupProgress(progress)
  }
}
