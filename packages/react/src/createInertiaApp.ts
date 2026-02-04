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
import { createElement, ReactElement } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import App, { InertiaApp, InertiaAppProps } from './App'
import { config } from './index'
import { ReactComponent, ReactInertiaAppConfig } from './types'

export type SetupOptions<ElementType, SharedProps extends PageProps> = {
  el: ElementType
  App: InertiaApp
  props: InertiaAppProps<SharedProps>
}

type ComponentResolver = (name: string, page?: Page) => ReactComponent | Promise<ReactComponent> | { default: ReactComponent }

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

// Options for Vite plugin auto-transform (setup is optional)
type InertiaAppOptionsAuto<SharedProps extends PageProps> = CreateInertiaAppOptionsBase<
  ComponentResolver,
  SetupOptions<HTMLElement | null, SharedProps>,
  ReactElement | void,
  ReactInertiaAppConfig
>

export type InertiaSSRRenderFunction<SharedProps extends PageProps = PageProps> = (
  page: Page<SharedProps>,
  renderToString: (element: ReactElement) => string,
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

  const resolveComponent = createComponentResolver(resolve) as (name: string, page?: Page) => Promise<ReactComponent>
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
    initialComponent: component as ReactComponent,
    resolveComponent: resolveComponent as (name: string, page?: Page) => ReactComponent | Promise<ReactComponent>,
    titleCallback: title,
  }

  const el = document.getElementById(id)!

  if (setup) {
    setup({
      el,
      App,
      props,
    })
  } else if (el.hasAttribute('data-server-rendered')) {
    hydrateRoot(el, createElement(App, props))
  } else {
    createRoot(el).render(createElement(App, props))
  }

  if (progress) {
    setupProgress(progress)
  }
}

function createSSRRenderer<SharedProps extends PageProps>(
  id: string,
  resolveComponent: (name: string, page?: Page) => Promise<ReactComponent>,
  setup: ((options: SetupOptions<null, SharedProps>) => ReactElement) | undefined,
  title: ((title: string) => string) | undefined,
  useScriptElement: boolean,
): InertiaSSRRenderFunction<SharedProps> {
  return async (page: Page<SharedProps>, renderToString: (element: ReactElement) => string): Promise<InertiaAppSSRResponse> => {
    let head: string[] = []

    const component = await resolveComponent(page.component, page)

    const props: InertiaAppProps<SharedProps> = {
      initialPage: page,
      initialComponent: component,
      resolveComponent,
      titleCallback: title,
      onHeadUpdate: (elements) => (head = elements),
    }

    let element: ReactElement

    if (setup) {
      element = setup({
        el: null,
        App,
        props,
      }) ?? createElement(App, props)
    } else {
      element = createElement(App, props)
    }

    const html = renderToString(element)
    const body = buildSSRBody(id, page, html, useScriptElement)

    return { head, body }
  }
}
