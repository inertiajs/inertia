import {
  buildSSRBody,
  createComponentResolver,
  loadInitialPage,
  setupProgress,
  type ConfigureInertiaAppOptions as ConfigureInertiaAppOptionsBase,
  type InertiaAppSSRResponse,
  type Page,
  type PageProps,
} from '@inertiajs/core'
import { createApp, createSSRApp, DefineComponent, h, Plugin, App as VueApp } from 'vue'
import App, { InertiaApp, InertiaAppProps, plugin } from './app'
import { config } from './index'
import { VueInertiaAppConfig } from './types'

type RenderToString = (app: VueApp) => Promise<string>

type ComponentResolver = (name: string, page?: Page) => DefineComponent | Promise<DefineComponent> | { default: DefineComponent }

type SetupOptions<SharedProps extends PageProps> = {
  el: HTMLElement | null
  App: InertiaApp
  props: InertiaAppProps<SharedProps>
  plugin: Plugin
}

export type CreateInertiaAppOptions<SharedProps extends PageProps> = ConfigureInertiaAppOptionsBase<
  ComponentResolver,
  SetupOptions<SharedProps>,
  VueApp | void,
  VueInertiaAppConfig
> & {
  page?: Page<SharedProps>
  render?: RenderToString
}

export type InertiaSSRRenderFunction<SharedProps extends PageProps = PageProps> = (
  page: Page<SharedProps>,
  renderToString: RenderToString,
) => Promise<InertiaAppSSRResponse>

export default async function createInertiaApp<SharedProps extends PageProps = PageProps>({
  id = 'app',
  resolve,
  setup,
  title,
  progress = {},
  page,
  render,
  defaults = {},
}: CreateInertiaAppOptions<SharedProps> = {}): Promise<InertiaSSRRenderFunction<SharedProps> | InertiaAppSSRResponse | void> {
  config.replace(defaults)

  if (!resolve) {
    throw new Error(
      'Inertia: Missing `resolve` option. Make sure to provide a resolve function or use the @inertiajs/vite plugin.',
    )
  }

  const resolveComponent = createComponentResolver(resolve)
  const useScriptElement = config.get('future.useScriptElementForInitialPage')

  if (typeof window === 'undefined') {
    const ssrRenderer = createSSRRenderer<SharedProps>(id, resolveComponent, setup, title, useScriptElement)

    // Backward compat: if page/render provided, render immediately (like createInertiaApp)
    if (page && render) {
      return ssrRenderer(page, render)
    }

    // Default: return render function (used by Vite plugin transform and createServer)
    return ssrRenderer
  }

  const { page: initialPage, component } = await loadInitialPage<SharedProps, DefineComponent>(
    id,
    useScriptElement,
    resolveComponent,
  )

  const props: InertiaAppProps<SharedProps> = {
    initialPage,
    initialComponent: component,
    resolveComponent,
    titleCallback: title,
  }

  const el = document.getElementById(id)!

  if (setup) {
    setup({ el, App, props, plugin })
  } else if (el.hasAttribute('data-server-rendered')) {
    const vueApp = createSSRVueApp(props)
    vueApp.use(plugin)
    vueApp.mount(el)
  } else {
    const vueApp = createClientVueApp(props)
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
  setup: ((options: SetupOptions<SharedProps>) => VueApp | void) | undefined,
  title: ((title: string) => string) | undefined,
  useScriptElement: boolean,
): InertiaSSRRenderFunction<SharedProps> {
  return async (page: Page<SharedProps>, renderToString: RenderToString): Promise<InertiaAppSSRResponse> => {
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
      }) as VueApp
    } else {
      vueApp = createSSRVueApp(props)
      vueApp.use(plugin)
    }

    const html = await renderToString(vueApp)
    const body = buildSSRBody(id, page, html, useScriptElement)

    return { head, body }
  }
}

function createSSRVueApp<SharedProps extends PageProps>(props: InertiaAppProps<SharedProps>): VueApp {
  return createSSRApp({
    render: () => h(App, props),
  })
}

function createClientVueApp<SharedProps extends PageProps>(props: InertiaAppProps<SharedProps>): VueApp {
  return createApp({
    render: () => h(App, props),
  })
}
