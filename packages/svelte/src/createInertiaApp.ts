import {
  buildSSRBody,
  createHeadManager,
  exposeInterceptors,
  getInitialPageFromDOM,
  http as httpModule,
  resolveServerHead,
  router,
  setupProgress,
  type CreateInertiaAppOptions,
  type CreateInertiaAppOptionsForCSR,
  type InertiaAppSSRResponse,
  type Page,
  type PageProps,
  type SharedPageProps,
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

type SvelteWithApp<SharedProps extends PageProps> = (
  context: Map<any, any>,
  options: { ssr: boolean; page: Page<SharedProps> },
) => void

type InertiaAppOptionsForCSR<SharedProps extends PageProps> = CreateInertiaAppOptionsForCSR<
  SharedProps,
  ComponentResolver,
  SetupOptions<SharedProps>,
  SvelteRenderResult | void,
  SvelteInertiaAppConfig
> & {
  withApp?: never
}

type InertiaAppOptionsAuto<SharedProps extends PageProps> = Omit<
  CreateInertiaAppOptions<
    ComponentResolver,
    SetupOptions<SharedProps>,
    SvelteRenderResult | void,
    SvelteInertiaAppConfig
  >,
  'setup'
> & {
  page?: Page<SharedProps>
} & (
    | { setup?: undefined; withApp?: SvelteWithApp<SharedProps> }
    | { setup: (options: SetupOptions<SharedProps>) => SvelteRenderResult | void; withApp?: never }
  )

type SvelteServerRender = (
  component: typeof App,
  options: { props: InertiaAppProps<PageProps>; context?: Map<any, any> },
) => SvelteRenderResult

type RenderFunction<SharedProps extends PageProps> = (
  page: Page<SharedProps>,
  render: SvelteServerRender,
) => Promise<InertiaAppSSRResponse>

export default async function createInertiaApp<SharedProps extends PageProps = PageProps & SharedPageProps>(
  options: InertiaAppOptionsForCSR<SharedProps>,
): Promise<InertiaAppSSRResponse | void>
export default async function createInertiaApp<SharedProps extends PageProps = PageProps & SharedPageProps>(
  options?: InertiaAppOptionsAuto<SharedProps>,
): Promise<void | RenderFunction<SharedProps>>
export default async function createInertiaApp<SharedProps extends PageProps = PageProps & SharedPageProps>(
  {
    id = 'app',
    resolve,
    setup,
    progress = {},
    page,
    defaults = {},
    nonce,
    http,
    layout,
    serverHead,
    withApp,
    dev = !!import.meta.env?.DEV,
  }:
    | InertiaAppOptionsForCSR<SharedProps>
    | InertiaAppOptionsAuto<SharedProps> = {} as InertiaAppOptionsAuto<SharedProps>,
): Promise<InertiaAppSSRResponse | RenderFunction<SharedProps> | void> {
  config.replace(defaults)

  if (nonce) {
    config.set('nonce', nonce)
  }

  if (http) {
    httpModule.setClient(http)
  }

  if (dev) {
    exposeInterceptors()
  }

  const isServer = typeof window === 'undefined'

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
        defaultLayout: layout,
      }

      let svelteApp: SvelteRenderResult

      if (setup) {
        const result = await setup({ el: null, App, props })
        if (!result) {
          throw new Error('Inertia SSR setup function must return a render result ({ body, head })')
        }
        svelteApp = result
      } else {
        const context = new Map()

        if (withApp) {
          withApp(context, { ssr: true, page })
        }

        svelteApp = await render(App, { props, context })
      }

      const body = buildSSRBody(id, page, svelteApp.body)

      return {
        body,
        head: [...resolveServerHead(page, serverHead), svelteApp.head],
      }
    }
  }

  const initialPage = page || getInitialPageFromDOM<Page<SharedProps>>(id)!
  const serverHeadManager =
    !isServer && serverHead
      ? createHeadManager(
          false,
          (title) => title,
          () => {},
          resolveServerHead(initialPage, serverHead),
        )
      : null

  const [initialComponent] = await Promise.all([
    resolveComponent(initialPage.component, initialPage) as Promise<ResolvedComponent>,
    router.decryptHistory().catch(() => {}),
  ])

  const props: InertiaAppProps<SharedProps> = { initialPage, initialComponent, resolveComponent, defaultLayout: layout }

  // SSR with page provided (legacy pattern used by ssr.ts)
  if (isServer) {
    if (!setup) {
      throw new Error('Inertia SSR requires a setup function that returns a render result ({ body, head })')
    }

    const svelteApp = await setup({ el: null, App, props })

    if (svelteApp) {
      const body = buildSSRBody(id, initialPage, svelteApp.body)

      return {
        body,
        head: [...resolveServerHead(initialPage, serverHead), svelteApp.head],
      }
    }

    return
  }

  // CSR
  const target = document.getElementById(id)!

  if (setup) {
    await setup({ el: target, App, props })
  } else {
    const context = new Map()

    if (withApp) {
      withApp(context, { ssr: false, page: initialPage })
    }

    if (target.hasAttribute('data-server-rendered')) {
      hydrate(App, { target, props, context })
    } else {
      mount(App, { target, props, context })
    }
  }

  if (serverHeadManager) {
    const syncServerHead = (event: { detail: { page: Page } }) => {
      serverHeadManager.updateServerHead(resolveServerHead(event.detail.page, serverHead))
    }

    router.on('navigate', syncServerHead)
    router.on('clientVisit', syncServerHead)
  }

  if (progress) {
    setupProgress(progress)
  }
}
