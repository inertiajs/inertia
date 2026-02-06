import {
  CreateInertiaAppOptionsForCSR,
  CreateInertiaAppOptionsForSSR,
  getInitialPageFromDOM,
  http as httpModule,
  InertiaAppResponse,
  InertiaAppSSRResponse,
  Page,
  PageProps,
  router,
  setupProgress,
} from '@inertiajs/core'
import { createElement, Fragment, ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import App, { InertiaAppProps, type InertiaApp } from './App'
import { config } from './index'
import { ReactComponent, ReactInertiaAppConfig } from './types'

export type SetupOptions<ElementType, SharedProps extends PageProps> = {
  el: ElementType
  App: InertiaApp
  props: InertiaAppProps<SharedProps>
}

// The 'unknown' type is necessary for backwards compatibility...
type ComponentResolver = (
  name: string,
  page?: Page,
) => ReactComponent | Promise<ReactComponent> | { default: ReactComponent } | unknown

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
  http,
}: InertiaAppOptionsForCSR<SharedProps> | InertiaAppOptionsForSSR<SharedProps>): InertiaAppResponse {
  config.replace(defaults)

  if (http) {
    httpModule.setClient(http)
  }

  const isServer = typeof window === 'undefined'
  const useDataElement = config.get('legacy.useDataElementForInitialPage')
  const initialPage = page || getInitialPageFromDOM<Page<SharedProps>>(id, useDataElement)!

  const resolveComponent = (name: string, page?: Page) =>
    Promise.resolve(resolve(name, page)).then((module) => {
      return ((module as { default?: ReactComponent }).default || module) as ReactComponent
    })

  let head: string[] = []

  const reactApp = await Promise.all([
    resolveComponent(initialPage.component, initialPage),
    router.decryptHistory().catch(() => {}),
  ]).then(([initialComponent]) => {
    const props = {
      initialPage,
      initialComponent,
      resolveComponent,
      titleCallback: title,
    }

    if (isServer) {
      const ssrSetup = setup as (options: SetupOptions<null, SharedProps>) => ReactElement

      return ssrSetup({
        el: null,
        App,
        props: { ...props, onHeadUpdate: (elements: string[]) => (head = elements) },
      })
    }

    const csrSetup = setup as (options: SetupOptions<HTMLElement, SharedProps>) => void

    return csrSetup({
      el: document.getElementById(id)!,
      App,
      props,
    })
  })

  if (!isServer && progress) {
    setupProgress(progress)
  }

  if (isServer && render) {
    const element = () => {
      if (useDataElement) {
        return createElement(
          'div',
          {
            id,
            'data-page': JSON.stringify(initialPage),
          },
          reactApp as ReactElement,
        )
      }

      return createElement(
        Fragment,
        null,
        createElement('script', {
          'data-page': id,
          type: 'application/json',
          dangerouslySetInnerHTML: { __html: JSON.stringify(initialPage).replace(/\//g, '\\/') },
        }),
        createElement('div', { id }, reactApp as ReactElement),
      )
    }

    const body = await render(element())

    return { head, body }
  }
}
