import {
  buildSSRBody,
  CreateInertiaAppOptions,
  CreateInertiaAppOptionsForCSR,
  CreateInertiaAppOptionsForSSR,
  getInitialPageFromDOM,
  http as httpModule,
  InertiaAppSSRResponse,
  Page,
  PageProps,
  router,
  setupProgress,
} from '@inertiajs/core'
import { createElement, ReactElement } from 'react'
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
  page?: Page,
) => ReactComponent | Promise<ReactComponent> | { default: ReactComponent }

type InertiaAppOptionsForCSR<SharedProps extends PageProps> = CreateInertiaAppOptionsForCSR<
  SharedProps,
  ComponentResolver,
  SetupOptions<HTMLElement, SharedProps>,
  void,
  ReactInertiaAppConfig
>

type InertiaAppOptionsForSSR<SharedProps extends PageProps> = CreateInertiaAppOptionsForSSR<
  SharedProps,
  ComponentResolver,
  SetupOptions<null, SharedProps>,
  ReactElement,
  ReactInertiaAppConfig
> & {
  render: typeof renderToString
}

type InertiaAppOptionsAuto<SharedProps extends PageProps> = CreateInertiaAppOptions<
  ComponentResolver,
  SetupOptions<HTMLElement | null, SharedProps>,
  ReactElement | void,
  ReactInertiaAppConfig
> & {
  page?: Page<SharedProps>
  render?: undefined
}

type RenderToString = (element: ReactElement) => string

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
  http,
  layout,
}:
  | InertiaAppOptionsForCSR<SharedProps>
  | InertiaAppOptionsForSSR<SharedProps>
  | InertiaAppOptionsAuto<SharedProps>): Promise<InertiaAppSSRResponse | RenderFunction<SharedProps> | void> {
  config.replace(defaults)

  if (http) {
    httpModule.setClient(http)
  }

  const isServer = typeof window === 'undefined'
  const useDataAttribute = config.get('legacy.useDataAttributeForInitialPage')

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

      const props: InertiaAppProps<SharedProps> = {
        initialPage: page,
        initialComponent,
        resolveComponent,
        titleCallback: title,
        onHeadUpdate: (elements: string[]) => (head = elements),
        defaultLayout: layout,
      }

      let reactApp: ReactElement

      if (setup) {
        reactApp = (setup as (options: SetupOptions<null, SharedProps>) => ReactElement)({
          el: null,
          App,
          props,
        })
      } else {
        reactApp = createElement(App, props)
      }

      const html = renderToString(reactApp)
      const body = buildSSRBody(id, page, html, !useDataAttribute)

      return { head, body }
    }
  }

  const initialPage = page || getInitialPageFromDOM<Page<SharedProps>>(id, useDataAttribute)!

  let head: string[] = []

  const reactApp = await Promise.all([
    resolveComponent(initialPage.component, initialPage),
    router.decryptHistory().catch(() => {}),
  ]).then(([initialComponent]) => {
    const props: InertiaAppProps<SharedProps> = {
      initialPage,
      initialComponent,
      resolveComponent,
      titleCallback: title,
      onHeadUpdate: isServer ? (elements: string[]) => (head = elements) : undefined,
      defaultLayout: layout,
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

    // Default mounting when setup is not provided
    if (el.hasAttribute('data-server-rendered')) {
      hydrateRoot(el, createElement(App, props))
    } else {
      createRoot(el).render(createElement(App, props))
    }
  })

  if (!isServer && progress) {
    setupProgress(progress)
  }

  if (isServer && render && reactApp) {
    const html = render(reactApp)
    const body = buildSSRBody(id, initialPage, html, !useDataAttribute)

    return { head, body }
  }
}
