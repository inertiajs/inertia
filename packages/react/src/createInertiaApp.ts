import {
  buildSSRBody,
  CreateInertiaAppOptions,
  CreateInertiaAppOptionsForCSR,
  CreateInertiaAppOptionsForSSR,
  createHeadManager,
  getInitialPageFromDOM,
  http as httpModule,
  InertiaAppSSRResponse,
  Page,
  PageProps,
  router,
  setupProgress,
  SharedPageProps,
} from '@inertiajs/core'
import { createElement, ReactElement, StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import App, { InertiaAppProps, type InertiaApp } from './App'
import { config } from './index'
import { ReactComponent, ReactInertiaAppConfig } from './types'

export type SetupOptions<ElementType, SharedProps extends PageProps> = {
  el: ElementType
  App: InertiaApp
  props: InertiaAppProps<SharedProps>
}

type ComponentResolver = (
  name: string,
  page?: Page<SharedPageProps>,
) => ReactComponent | Promise<ReactComponent> | { default: ReactComponent }

type ReactWithApp = (app: ReactElement, options: { ssr: boolean }) => ReactElement

type InertiaAppOptionsForCSR<SharedProps extends PageProps> = CreateInertiaAppOptionsForCSR<
  SharedProps,
  ComponentResolver,
  SetupOptions<HTMLElement, SharedProps>,
  void,
  ReactInertiaAppConfig
> & {
  strictMode?: undefined
  withApp?: never
}

type InertiaAppOptionsForSSR<SharedProps extends PageProps> = CreateInertiaAppOptionsForSSR<
  SharedProps,
  ComponentResolver,
  SetupOptions<null, SharedProps>,
  ReactElement,
  ReactInertiaAppConfig
> & {
  render: typeof renderToString
  strictMode?: undefined
  withApp?: never
}

type InertiaAppOptionsAuto<SharedProps extends PageProps> = Omit<
  CreateInertiaAppOptions<
    ComponentResolver,
    SetupOptions<HTMLElement | null, SharedProps>,
    ReactElement | void,
    ReactInertiaAppConfig
  >,
  'setup'
> & {
  page?: Page<SharedProps>
  render?: undefined
  strictMode?: boolean
} & (
    | { setup?: undefined; withApp?: ReactWithApp }
    | { setup: (options: SetupOptions<HTMLElement | null, SharedProps>) => ReactElement | void; withApp?: never }
  )

type RenderToString = (element: ReactElement) => string

type RenderFunction<SharedProps extends PageProps> = (
  page: Page<SharedProps>,
  renderToString: RenderToString,
) => Promise<InertiaAppSSRResponse>

export default async function createInertiaApp<SharedProps extends PageProps = PageProps & SharedPageProps>(
  options: InertiaAppOptionsForCSR<SharedProps>,
): Promise<void>
export default async function createInertiaApp<SharedProps extends PageProps = PageProps & SharedPageProps>(
  options: InertiaAppOptionsForSSR<SharedProps>,
): Promise<InertiaAppSSRResponse>
export default async function createInertiaApp<SharedProps extends PageProps = PageProps & SharedPageProps>(
  options?: InertiaAppOptionsAuto<SharedProps>,
): Promise<void | RenderFunction<SharedProps>>
export default async function createInertiaApp<SharedProps extends PageProps = PageProps & SharedPageProps>(
  {
    id = 'app',
    resolve,
    setup,
    title,
    progress = {},
    page,
    render,
    defaults = {},
    http,
    layout,
    strictMode = false,
    withApp,
  }:
    | InertiaAppOptionsForCSR<SharedProps>
    | InertiaAppOptionsForSSR<SharedProps>
    | InertiaAppOptionsAuto<SharedProps> = {} as InertiaAppOptionsAuto<SharedProps>,
): Promise<InertiaAppSSRResponse | RenderFunction<SharedProps> | void> {
  config.replace(defaults)

  if (http) {
    httpModule.setClient(http)
  }

  const isServer = typeof window === 'undefined'

  const wrapWithStrictMode = (element: ReactElement): ReactElement => {
    return strictMode ? createElement(StrictMode, null, element) : element
  }

  const resolveComponent = (name: string, page?: Page) =>
    Promise.resolve(resolve!(name, page)).then((module) => {
      return ((module as { default?: ReactComponent }).default || module) as ReactComponent
    })

  // SSR render function factory - when on server without page/render, return a render function
  // This is used by the Vite plugin's SSR transform
  if (isServer && !page && !render) {
    return async (page: Page<SharedProps>, renderToString: RenderToString) => {
      let head: string[] = []

      const initialComponent = await resolveComponent(page.component, page)

      const headManager = createHeadManager(isServer, title || ((title) => title), (elements: string[]) => (head = elements))

      const props: InertiaAppProps<SharedProps> = {
        initialPage: page,
        initialComponent,
        resolveComponent,
        titleCallback: title,
        onHeadUpdate: (elements: string[]) => (head = elements),
        defaultLayout: layout,
        headManager,
      }

      let reactApp: ReactElement

      if (setup) {
        reactApp = (setup as (options: SetupOptions<null, SharedProps>) => ReactElement)({
          el: null,
          App,
          props,
        })
      } else {
        reactApp = wrapWithStrictMode(createElement(App, props))

        if (withApp) {
          reactApp = withApp(reactApp, { ssr: true })
        }
      }

      const html = renderToString(reactApp)

      if (headManager && headManager.renderSSR) {
        head = await headManager.renderSSR()
      }

      const body = buildSSRBody(id, page, html)

      return { head, body }
    }
  }

  const initialPage = page || getInitialPageFromDOM<Page<SharedProps>>(id)!

  let head: string[] = []
  let ssrHeadManager: ReturnType<typeof createHeadManager> | undefined

  const reactApp = await Promise.all([
    resolveComponent(initialPage.component, initialPage),
    router.decryptHistory().catch(() => {}),
  ]).then(([initialComponent]) => {
    if (isServer) {
      ssrHeadManager = createHeadManager(isServer, title || ((title) => title), (elements: string[]) => (head = elements))
    }

    const props: InertiaAppProps<SharedProps> = {
      initialPage,
      initialComponent,
      resolveComponent,
      titleCallback: title,
      onHeadUpdate: isServer ? (elements: string[]) => (head = elements) : undefined,
      defaultLayout: layout,
      headManager: ssrHeadManager,
    }

    if (isServer) {
      return (setup as (options: SetupOptions<null, SharedProps>) => ReactElement)({
        el: null,
        App,
        props,
      })
    }

    const el = document.getElementById(id)!

    if (setup) {
      return (setup as (options: SetupOptions<HTMLElement, SharedProps>) => void)({
        el,
        App,
        props,
      })
    }

    let appElement = wrapWithStrictMode(createElement(App, props))

    if (withApp) {
      appElement = withApp(appElement, { ssr: false })
    }

    if (el.hasAttribute('data-server-rendered')) {
      hydrateRoot(el, appElement)
    } else {
      createRoot(el).render(appElement)
    }
  })

  if (!isServer && progress) {
    setupProgress(progress)
  }

  if (isServer && render && reactApp) {
    const html = render(reactApp)

    if (ssrHeadManager && ssrHeadManager.renderSSR) {
      head = await ssrHeadManager.renderSSR()
    }

    const body = buildSSRBody(id, initialPage, html)

    return { head, body }
  }
}
