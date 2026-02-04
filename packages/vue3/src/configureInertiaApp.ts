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
import { createSSRApp, DefineComponent, h, Plugin, App as VueApp } from 'vue'
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

export type ConfigureInertiaAppOptions<SharedProps extends PageProps> = ConfigureInertiaAppOptionsBase<
  ComponentResolver,
  SetupOptions<SharedProps>,
  VueApp | void,
  VueInertiaAppConfig
>

export type InertiaSSRRenderFunction<SharedProps extends PageProps = PageProps> = (
  page: Page<SharedProps>,
  renderToString: RenderToString,
) => Promise<InertiaAppSSRResponse>

export default async function configureInertiaApp<SharedProps extends PageProps = PageProps>({
  id = 'app',
  resolve,
  setup,
  title,
  progress = {},
  defaults = {},
}: ConfigureInertiaAppOptions<SharedProps> = {}): Promise<InertiaSSRRenderFunction<SharedProps> | void> {
  config.replace(defaults)

  if (!resolve) {
    throw new Error(
      'Inertia: Missing `resolve` option. Make sure to provide a resolve function or use the @inertiajs/vite plugin.',
    )
  }

  const resolveComponent = createComponentResolver(resolve)
  const useScriptElement = config.get('future.useScriptElementForInitialPage')

  if (typeof window === 'undefined') {
    return createSSRRenderer(id, resolveComponent, setup, title, useScriptElement)
  }

  const { page, component } = await loadInitialPage<SharedProps, DefineComponent>(
    id,
    useScriptElement,
    resolveComponent,
  )

  const props: InertiaAppProps<SharedProps> = {
    initialPage: page,
    initialComponent: component,
    resolveComponent,
    titleCallback: title,
  }

  if (setup) {
    setup({
      el: document.getElementById(id)!,
      App,
      props,
      plugin,
    })
  } else {
    const vueApp = createVueApp(props)
    vueApp.use(plugin)
    vueApp.mount(`#${id}`)
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
      vueApp = createVueApp(props)
      vueApp.use(plugin)
    }

    const html = await renderToString(vueApp)
    const body = buildSSRBody(id, page, html, useScriptElement)

    return { head, body }
  }
}

function createVueApp<SharedProps extends PageProps>(props: InertiaAppProps<SharedProps>): VueApp {
  return createSSRApp({
    render: () => h(App, props),
  })
}
