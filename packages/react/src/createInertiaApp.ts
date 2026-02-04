import {
  buildSSRBody,
  createComponentResolver,
  getInitialPageFromDOM,
  router,
  setupProgress,
  type CreateInertiaAppOptions as CreateInertiaAppOptionsBase,
  type InertiaAppSSRResponse,
  type Page,
  type PageProps,
} from '@inertiajs/core'
import { createElement, ReactElement } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App, { InertiaApp, InertiaAppProps } from './App'
import { config } from './index'
import { ReactComponent, ReactInertiaAppConfig } from './types'

type RenderToString = (element: ReactElement) => string

type ComponentResolver = (name: string, page?: Page) => ReactComponent | Promise<ReactComponent> | { default: ReactComponent }

type SetupOptions<SharedProps extends PageProps> = {
  el: HTMLElement | null
  App: InertiaApp
  props: InertiaAppProps<SharedProps>
}

export type CreateInertiaAppOptions<SharedProps extends PageProps> = CreateInertiaAppOptionsBase<
  ComponentResolver,
  SetupOptions<SharedProps>,
  ReactElement | void,
  ReactInertiaAppConfig
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
    setup({ el, App, props })
  } else if (el.hasAttribute('data-server-rendered')) {
    hydrateRoot(el, createAppElement(props))
  } else {
    createRoot(el).render(createAppElement(props))
  }

  if (progress) {
    setupProgress(progress)
  }
}

function createSSRRenderer<SharedProps extends PageProps>(
  id: string,
  resolveComponent: (name: string, page?: Page) => Promise<ReactComponent>,
  setup: ((options: SetupOptions<SharedProps>) => ReactElement | void) | undefined,
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

    const element = setup
      ? (setup({ el: null, App, props }) ?? createAppElement(props))
      : createAppElement(props)

    const html = renderToString(element)
    const body = buildSSRBody(id, page, html, useScriptElement)

    return { head, body }
  }
}

function createAppElement<SharedProps extends PageProps>(props: InertiaAppProps<SharedProps>): ReactElement {
  return createElement(App, props)
}
