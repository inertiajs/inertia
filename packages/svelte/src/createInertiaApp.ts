import {
  buildSSRBody,
  getInitialPageFromDOM,
  http as httpModule,
  router,
  setupProgress,
  type CreateInertiaAppOptions,
  type CreateInertiaAppOptionsForCSR,
  type InertiaAppSSRResponse,
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

type InertiaAppOptionsForCSR<SharedProps extends PageProps> = CreateInertiaAppOptionsForCSR<
  SharedProps,
  ComponentResolver,
  SetupOptions<SharedProps>,
  SvelteRenderResult | void,
  SvelteInertiaAppConfig
>

type InertiaAppOptionsAuto<SharedProps extends PageProps> = CreateInertiaAppOptions<
  ComponentResolver,
  SetupOptions<SharedProps>,
  SvelteRenderResult | void,
  SvelteInertiaAppConfig
> & {
  page?: Page<SharedProps>
}

type SvelteServerRender = (component: typeof App, options: { props: InertiaAppProps<PageProps> }) => SvelteRenderResult

type RenderFunction<SharedProps extends PageProps> = (
  page: Page<SharedProps>,
  render: SvelteServerRender,
) => Promise<InertiaAppSSRResponse>

export default async function createInertiaApp<SharedProps extends PageProps = PageProps>(
  options: InertiaAppOptionsForCSR<SharedProps>,
): Promise<InertiaAppSSRResponse | void>
export default async function createInertiaApp<SharedProps extends PageProps = PageProps>(
  options?: InertiaAppOptionsAuto<SharedProps>,
): Promise<void | RenderFunction<SharedProps>>
export default async function createInertiaApp<SharedProps extends PageProps = PageProps>({
  id = 'app',
  resolve,
  setup,
  progress = {},
  page,
  defaults = {},
  http,
}: InertiaAppOptionsForCSR<SharedProps> | InertiaAppOptionsAuto<SharedProps> = {} as InertiaAppOptionsAuto<SharedProps>): Promise<
  InertiaAppSSRResponse | RenderFunction<SharedProps> | void
> {
  config.replace(defaults)

  if (http) {
    httpModule.setClient(http)
  }

  const isServer = typeof window === 'undefined'
  const useDataAttribute = config.get('legacy.useDataAttributeForInitialPage')

  const resolveComponent = (name: string, page?: Page) => Promise.resolve(resolve!(name, page))

  // SSR render function factory - when on server without page, return a render function
  // This is used by the Vite plugin's SSR transform
  if (isServer && !page) {
    return async (page: Page<SharedProps>, render: SvelteServerRender) => {
      const initialComponent = (await resolveComponent(page.component, page)) as ResolvedComponent

      const props: InertiaAppProps<SharedProps> = {
        initialPage: page,
        initialComponent,
        resolveComponent,
      }

      let svelteApp: SvelteRenderResult

      if (setup) {
        const result = await setup({ el: null, App, props })
        if (!result) {
          throw new Error('Inertia SSR setup function must return a render result ({ body, head })')
        }
        svelteApp = result
      } else {
        svelteApp = render(App, { props })
      }

      const body = buildSSRBody(id, page, svelteApp.body, !useDataAttribute)

      return {
        body,
        head: [svelteApp.head],
      }
    }
  }

  const initialPage = page || getInitialPageFromDOM<Page<SharedProps>>(id, useDataAttribute)!

  const [initialComponent] = await Promise.all([
    resolveComponent(initialPage.component, initialPage) as Promise<ResolvedComponent>,
    router.decryptHistory().catch(() => {}),
  ])

  const props: InertiaAppProps<SharedProps> = { initialPage, initialComponent, resolveComponent }

  // SSR with page provided (legacy pattern used by ssr.ts)
  if (isServer) {
    if (!setup) {
      throw new Error('Inertia SSR requires a setup function that returns a render result ({ body, head })')
    }

    const svelteApp = await setup({ el: null, App, props })

    if (svelteApp) {
      const body = buildSSRBody(id, initialPage, svelteApp.body, !useDataAttribute)

      return {
        body,
        head: [svelteApp.head],
      }
    }

    return
  }

  // CSR
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
