import {
  bootstrapSSRServer,
  buildSSRBody,
  createComponentResolver,
  isSSRDevMode,
  loadInitialPage,
  setupProgress,
  type InertiaAppSSRResponse,
  type Page,
  type PageProps,
} from '@inertiajs/core'
import { createSSRApp, DefineComponent, h, App as VueApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import App, { plugin } from './app'
import { config } from './index'
import { VueInertiaAppConfig } from './types'

type ComponentResolver = (name: string) => DefineComponent | Promise<DefineComponent> | { default: DefineComponent }

type SetupOptions<SharedProps extends PageProps> = {
  app: VueApp
  props: SharedProps
}

export type ConfigureInertiaAppOptions<SharedProps extends PageProps> = {
  id?: string
  resolve?: ComponentResolver
  setup?: (options: SetupOptions<SharedProps>) => void
  title?: (title: string) => string
  progress?: Parameters<typeof setupProgress>[0] | false
  defaults?: VueInertiaAppConfig
}

export type InertiaSSRRenderFunction<SharedProps extends PageProps = PageProps> = (
  page: Page<SharedProps>,
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
    return handleSSR({ id, resolveComponent, setup, title, useScriptElement })
  }

  const { page, component } = await loadInitialPage<SharedProps, DefineComponent>(
    id,
    useScriptElement,
    resolveComponent,
  )

  const vueApp = createVueApp(page, component, resolveComponent, title)
  vueApp.use(plugin)

  if (setup) {
    setup({ app: vueApp, props: page.props as SharedProps })
  }

  vueApp.mount(`#${id}`)

  if (progress) {
    setupProgress(progress)
  }
}

async function handleSSR<SharedProps extends PageProps>({
  id,
  resolveComponent,
  setup,
  title,
  useScriptElement,
}: {
  id: string
  resolveComponent: (name: string) => Promise<DefineComponent>
  setup?: (options: SetupOptions<SharedProps>) => void
  title?: (title: string) => string
  useScriptElement: boolean
}): Promise<InertiaSSRRenderFunction<SharedProps>> {
  const render = async (page: Page<SharedProps>): Promise<InertiaAppSSRResponse> => {
    let head: string[] = []
    const component = await resolveComponent(page.component)

    const vueApp = createVueApp(page, component, resolveComponent, title, (elements: string[]) => (head = elements))
    vueApp.use(plugin)

    if (setup) {
      setup({ app: vueApp, props: page.props as SharedProps })
    }

    const html = await renderToString(vueApp)
    const body = buildSSRBody(id, page, html, useScriptElement)

    return { head, body }
  }

  if (isSSRDevMode()) {
    return render
  }

  await bootstrapSSRServer(render as (page: Page) => Promise<InertiaAppSSRResponse>)

  return render
}

function createVueApp<SharedProps extends PageProps>(
  page: Page<SharedProps>,
  component: DefineComponent,
  resolveComponent: (name: string) => Promise<DefineComponent>,
  title?: (title: string) => string,
  onHeadUpdate?: (elements: string[]) => void,
): VueApp {
  return createSSRApp({
    render: () =>
      h(App, {
        initialPage: page,
        initialComponent: component,
        resolveComponent,
        titleCallback: title,
        onHeadUpdate,
      }),
  })
}
