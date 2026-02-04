import {
  buildSSRBody,
  CreateInertiaAppOptions,
  CreateInertiaAppOptionsForCSR,
  CreateInertiaAppOptionsForSSR,
  getInitialPageFromDOM,
  InertiaAppSSRResponse,
  Page,
  PageProps,
  router,
  setupProgress,
} from '@inertiajs/core'
import { createApp, createSSRApp, DefineComponent, h, Plugin, App as VueApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import App, { InertiaApp, InertiaAppProps, plugin } from './app'
import { config } from './index'
import { VueInertiaAppConfig } from './types'

type ComponentResolver = (
  name: string,
  page?: Page,
) => DefineComponent | Promise<DefineComponent> | { default: DefineComponent }

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

type InertiaAppOptionsAuto<SharedProps extends PageProps> = CreateInertiaAppOptions<
  ComponentResolver,
  SetupOptions<HTMLElement | null, SharedProps>,
  VueApp | void,
  VueInertiaAppConfig
> & {
  page?: Page<SharedProps>
  render?: undefined
}

type RenderToString = (app: VueApp) => Promise<string>

type RenderFunction<SharedProps extends PageProps> = (
  page: Page<SharedProps>,
  renderToString: RenderToString,
) => Promise<InertiaAppSSRResponse>

export default async function createInertiaApp<SharedProps extends PageProps = PageProps>(
  options: InertiaAppOptionsForCSR<SharedProps>,
): Promise<void>
export default async function createInertiaApp<SharedProps extends PageProps = PageProps>(
  options: InertiaAppOptionsForSSR<SharedProps>,
): Promise<InertiaAppSSRResponse>
export default async function createInertiaApp<SharedProps extends PageProps = PageProps>(
  options: InertiaAppOptionsAuto<SharedProps>,
): Promise<void | RenderFunction<SharedProps>>
export default async function createInertiaApp<SharedProps extends PageProps = PageProps>({
  id = 'app',
  resolve,
  setup,
  title,
  progress = {},
  page,
  render,
  defaults = {},
}: InertiaAppOptionsForCSR<SharedProps> | InertiaAppOptionsForSSR<SharedProps> | InertiaAppOptionsAuto<SharedProps>): Promise<
  InertiaAppSSRResponse | RenderFunction<SharedProps> | void
> {
  config.replace(defaults)

  const isServer = typeof window === 'undefined'
  const useScriptElement = config.get('future.useScriptElementForInitialPage')

  const resolveComponent = (name: string, page?: Page) =>
    Promise.resolve(resolve!(name, page)).then((module) => module.default || module)

  // SSR render function factory - when on server without page/render, return a render function
  // This is used by the Vite plugin's SSR transform
  if (isServer && !page && !render) {
    return async (page: Page<SharedProps>, renderToString: RenderToString) => {
      let head: string[] = []

      const initialComponent = await resolveComponent(page.component, page)

      const props: InertiaAppProps<SharedProps> = {
        initialPage: page,
        initialComponent,
        resolveComponent,
        titleCallback: title,
        onHeadUpdate: (elements: string[]) => (head = elements),
      }

      let vueApp: VueApp

      if (setup) {
        vueApp = (setup as (options: SetupOptions<null, SharedProps>) => VueApp)({
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

  const initialPage = page || getInitialPageFromDOM<Page<SharedProps>>(id, useScriptElement)!

  let head: string[] = []

  const vueApp = await Promise.all([
    resolveComponent(initialPage.component, initialPage),
    router.decryptHistory().catch(() => {}),
  ]).then(([initialComponent]) => {
    const props: InertiaAppProps<SharedProps> = {
      initialPage,
      initialComponent,
      resolveComponent,
      titleCallback: title,
      onHeadUpdate: isServer ? (elements: string[]) => (head = elements) : undefined,
    }

    if (isServer) {
      return (setup as (options: SetupOptions<null, SharedProps>) => VueApp)({
        el: null,
        App,
        props,
        plugin,
      })
    }

    const el = document.getElementById(id)!

    if (setup) {
      return (setup as (options: SetupOptions<HTMLElement, SharedProps>) => void)({
        el,
        App,
        props,
        plugin,
      })
    }

    // Default mounting when setup is not provided
    if (el.hasAttribute('data-server-rendered')) {
      const app = createSSRApp({ render: () => h(App, props) })
      app.use(plugin)
      app.mount(el)
    } else {
      const app = createApp({ render: () => h(App, props) })
      app.use(plugin)
      app.mount(el)
    }
  })

  if (!isServer && progress) {
    setupProgress(progress)
  }

  if (isServer && render && vueApp) {
    const html = await render(vueApp)
    const body = buildSSRBody(id, initialPage, html, useScriptElement)

    return { head, body }
  }
}
