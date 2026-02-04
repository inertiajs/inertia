import {
  buildSSRBody,
  getInitialPageFromDOM,
  router,
  setupProgress,
  type CreateInertiaAppOptionsForCSR,
  type InertiaAppResponse,
  type Page,
  type PageProps,
} from '@inertiajs/core'
import { hydrate, mount } from 'svelte'
import App, { type InertiaAppProps } from './components/App.svelte'
import { config } from './index'
import type { ComponentResolver, ResolvedComponent, SvelteInertiaAppConfig } from './types'

type SvelteRenderResult = { body: string; head: string }

type SetupOptions<SharedProps extends PageProps> = {
  el: HTMLElement | null
  App: typeof App
  props: InertiaAppProps<SharedProps>
}

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
  const useScriptElement = config.get('future.useScriptElementForInitialPage')
  const initialPage = page || getInitialPageFromDOM<Page<SharedProps>>(id, useScriptElement)!

  const resolveComponent = (name: string, page?: Page) => Promise.resolve(resolve(name, page))

  const [initialComponent] = await Promise.all([
    resolveComponent(initialPage.component, initialPage) as Promise<ResolvedComponent>,
    router.decryptHistory().catch(() => {}),
  ])

  const props: InertiaAppProps<SharedProps> = { initialPage, initialComponent, resolveComponent }

  if (isServer) {
    if (!setup) {
      throw new Error('Inertia SSR requires a setup function that returns a render result ({ body, head })')
    }

    const svelteApp = await setup({ el: null, App, props })

    if (svelteApp) {
      const body = buildSSRBody(id, initialPage, svelteApp.body, useScriptElement)

      return {
        body,
        head: [svelteApp.head],
      }
    }

    return
  }

  const target = document.getElementById(id)!

  if (setup) {
    await setup({ el: target, App, props })
  } else if (target.hasAttribute('data-server-rendered')) {
    hydrate(App, { target, props })
  } else {
    mount(App, { target, props })
  }

  if (progress) {
    setupProgress(progress)
  }
}
