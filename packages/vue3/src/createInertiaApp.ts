import {
  buildSSRBody,
  createComponentResolver,
  getInitialPageFromDOM,
  router,
  setupProgress,
  type CreateInertiaAppOptions as CreateInertiaAppOptionsBase,
  type CreateInertiaAppOptionsForCSR,
  type CreateInertiaAppOptionsForSSR,
  type InertiaAppSSRResponse,
  type Page,
  type PageProps,
} from '@inertiajs/core'
import { createApp, createSSRApp, DefineComponent, h, Plugin, App as VueApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import App, { InertiaApp, InertiaAppProps, plugin } from './app'
import { config } from './index'
import { VueInertiaAppConfig } from './types'

type ComponentResolver = (name: string, page?: Page) => DefineComponent | Promise<DefineComponent> | { default: DefineComponent }

type SetupOptions<ElementType, SharedProps extends PageProps> = {
  el: ElementType
  App: InertiaApp
  props: InertiaAppProps<SharedProps>
  plugin: Plugin
}

type InertiaAppOptionsForCSR<SharedProps extends PageProps> = CreateInertiaAppOptionsForCSR<
  SharedProps,
  ComponentResolver,
  SetupOptions<HTMLElement, SharedProps>,
  void,
  VueInertiaAppConfig
>

type InertiaAppOptionsForSSR<SharedProps extends PageProps> = CreateInertiaAppOptionsForSSR<
  SharedProps,
  ComponentResolver,
  SetupOptions<null, SharedProps>,
  VueApp,
  VueInertiaAppConfig
> & {
  render: typeof renderToString
}

// Options for Vite plugin auto-transform (setup is optional)
type InertiaAppOptionsAuto<SharedProps extends PageProps> = CreateInertiaAppOptionsBase<
  ComponentResolver,
  SetupOptions<HTMLElement | null, SharedProps>,
  VueApp | void,
  VueInertiaAppConfig
>

export type InertiaSSRRenderFunction<SharedProps extends PageProps = PageProps> = (
  page: Page<SharedProps>,
  renderToString: (app: VueApp) => Promise<string>,
) => Promise<InertiaAppSSRResponse>

// Overload 1: CSR with setup (returns void)
export default async function createInertiaApp<SharedProps extends PageProps = PageProps>(
  options: InertiaAppOptionsForCSR<SharedProps>,
): Promise<void>
// Overload 2: SSR with setup + page + render (returns SSR response)
export default async function createInertiaApp<SharedProps extends PageProps = PageProps>(
  options: InertiaAppOptionsForSSR<SharedProps>,
): Promise<InertiaAppSSRResponse>
// Overload 3: Auto/Vite plugin (setup optional, returns SSR function or void)
export default async function createInertiaApp<SharedProps extends PageProps = PageProps>(
  options?: InertiaAppOptionsAuto<SharedProps>,
): Promise<InertiaSSRRenderFunction<SharedProps> | void>
// Implementation
export default async function createInertiaApp<SharedProps extends PageProps = PageProps>(
  options: InertiaAppOptionsForCSR<SharedProps> | InertiaAppOptionsForSSR<SharedProps> | InertiaAppOptionsAuto<SharedProps> = {} as InertiaAppOptionsAuto<SharedProps>,
): Promise<InertiaSSRRenderFunction<SharedProps> | InertiaAppSSRResponse | void> {
  const {
    id = 'app',
    resolve,
    setup,
    title,
    progress = {},
    page,
    render,
    defaults = {},
  } = options as any

  config.replace(defaults)

  if (!resolve) {
    throw new Error(
      'Inertia: Missing `resolve` option. Make sure to provide a resolve function or use the @inertiajs/vite plugin.',
    )
  }

  const resolveComponent = createComponentResolver(resolve) as (name: string, page?: Page) => Promise<DefineComponent>
  const useScriptElement = config.get('future.useScriptElementForInitialPage')

  // SSR path
  if (typeof window === 'undefined') {
    const ssrRenderer = createSSRRenderer<SharedProps>(id, resolveComponent, setup as any, title, useScriptElement)

    // Legacy SSR: if page/render provided, render immediately
    if (page && render) {
      return ssrRenderer(page, render)
    }

    // Vite plugin: return render function
    return ssrRenderer
  }

  // CSR path
  const initialPage = page || getInitialPageFromDOM<Page<SharedProps>>(id, useScriptElement)!

  const [component] = await Promise.all([
    resolveComponent(initialPage.component, initialPage),
    router.decryptHistory().catch(() => {}),
  ])

  const props: InertiaAppProps<SharedProps> = {
    initialPage,
    initialComponent: component,
    resolveComponent,
    titleCallback: title,
  }

  const el = document.getElementById(id)!

  if (setup) {
    setup({
      el,
      App,
      props,
      plugin,
    })
  } else if (el.hasAttribute('data-server-rendered')) {
    const vueApp = createSSRApp({ render: () => h(App, props) })
    vueApp.use(plugin)
    vueApp.mount(el)
  } else {
    const vueApp = createApp({ render: () => h(App, props) })
    vueApp.use(plugin)
    vueApp.mount(el)
  }

  if (progress) {
    setupProgress(progress)
  }
}

function createSSRRenderer<SharedProps extends PageProps>(
  id: string,
  resolveComponent: (name: string, page?: Page) => Promise<DefineComponent>,
  setup: ((options: SetupOptions<null, SharedProps>) => VueApp) | undefined,
  title: ((title: string) => string) | undefined,
  useScriptElement: boolean,
): InertiaSSRRenderFunction<SharedProps> {
  return async (page: Page<SharedProps>, renderToString: (app: VueApp) => Promise<string>): Promise<InertiaAppSSRResponse> => {
    let head: string[] = []

    const component = await resolveComponent(page.component, page)

    const props: InertiaAppProps<SharedProps> = {
      initialPage: page,
      initialComponent: component,
      resolveComponent,
      titleCallback: title,
      onHeadUpdate: (elements) => (head = elements),
    }

    let vueApp: VueApp

    if (setup) {
      vueApp = setup({
        el: null,
        App,
        props,
        plugin,
      })
    } else {
      vueApp = createSSRApp({ render: () => h(App, props) })
      vueApp.use(plugin)
    }

    const html = await renderToString(vueApp)
    const body = buildSSRBody(id, page, html, useScriptElement)

    return { head, body }
  }
}
