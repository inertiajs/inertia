import {
  buildSSRBody,
  createComponentResolver,
  loadInitialPage,
  setupProgress,
  type InertiaAppSSRResponse,
  type Page,
  type PageProps,
} from '@inertiajs/core'
import { createElement, ReactElement } from 'react'
import { hydrateRoot } from 'react-dom/client'
import App from './App'
import { config } from './index'
import { ReactComponent, ReactInertiaAppConfig } from './types'

type RenderToString = (element: ReactElement) => string

type ComponentResolver = (name: string) => ReactComponent | Promise<ReactComponent> | { default: ReactComponent }

type SetupOptions<SharedProps extends PageProps> = {
  el: ReactElement
  props: SharedProps
}

export type ConfigureInertiaAppOptions<SharedProps extends PageProps> = {
  id?: string
  resolve?: ComponentResolver
  pages?:
    | string
    | {
        path: string
        extension?: string | string[]
        transform?: (name: string) => string
      }
  setup?: (options: SetupOptions<SharedProps>) => ReactElement | void
  title?: (title: string) => string
  progress?: Parameters<typeof setupProgress>[0] | false
  defaults?: ReactInertiaAppConfig
}

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

  const { page, component } = await loadInitialPage<SharedProps, ReactComponent>(id, useScriptElement, resolveComponent)

  const appElement = createAppElement(page, component, resolveComponent, title)
  const finalElement = setup ? (setup({ el: appElement, props: page.props as SharedProps }) ?? appElement) : appElement

  hydrateRoot(document.getElementById(id)!, finalElement)

  if (progress) {
    setupProgress(progress)
  }
}

function createSSRRenderer<SharedProps extends PageProps>(
  id: string,
  resolveComponent: (name: string) => Promise<ReactComponent>,
  setup: ((options: SetupOptions<SharedProps>) => ReactElement | void) | undefined,
  title: ((title: string) => string) | undefined,
  useScriptElement: boolean,
): InertiaSSRRenderFunction<SharedProps> {
  return async (page: Page<SharedProps>, renderToString: RenderToString): Promise<InertiaAppSSRResponse> => {
    let head: string[] = []

    const component = await resolveComponent(page.component)
    const appElement = createAppElement(page, component, resolveComponent, title, (elements) => (head = elements))
    const finalElement = setup
      ? (setup({ el: appElement, props: page.props as SharedProps }) ?? appElement)
      : appElement

    const html = renderToString(finalElement)
    const body = buildSSRBody(id, page, html, useScriptElement)

    return { head, body }
  }
}

function createAppElement<SharedProps extends PageProps>(
  page: Page<SharedProps>,
  component: ReactComponent,
  resolveComponent: (name: string) => Promise<ReactComponent>,
  title?: (title: string) => string,
  onHeadUpdate?: (elements: string[]) => void,
): ReactElement {
  return createElement(App, {
    initialPage: page,
    initialComponent: component,
    resolveComponent,
    titleCallback: title,
    onHeadUpdate,
  })
}
