import {
  buildSSRBody,
  CreateInertiaAppOptionsForCSR,
  CreateInertiaAppOptionsForSSR,
  getInitialPageFromDOM,
  InertiaAppResponse,
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

export default async function createInertiaApp<SharedProps extends PageProps = PageProps>(
  options: InertiaAppOptionsForCSR<SharedProps>,
): Promise<void>
export default async function createInertiaApp<SharedProps extends PageProps = PageProps>(
  options: InertiaAppOptionsForSSR<SharedProps>,
): Promise<InertiaAppSSRResponse>
export default async function createInertiaApp<SharedProps extends PageProps = PageProps>({
  id = 'app',
  resolve,
  setup,
  title,
  progress = {},
  page,
  render,
  defaults = {},
}: InertiaAppOptionsForCSR<SharedProps> | InertiaAppOptionsForSSR<SharedProps>): InertiaAppResponse {
  config.replace(defaults)

  const isServer = typeof window === 'undefined'
  const useScriptElement = config.get('future.useScriptElementForInitialPage')
  const initialPage = page || getInitialPageFromDOM<Page<SharedProps>>(id, useScriptElement)!

  const resolveComponent = (name: string, page?: Page) =>
    Promise.resolve(resolve(name, page)).then((module) => {
      return ((module as { default?: ReactComponent }).default || module) as ReactComponent
    })

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
    const body = buildSSRBody(id, initialPage, html, useScriptElement)

    return { head, body }
  }
}
