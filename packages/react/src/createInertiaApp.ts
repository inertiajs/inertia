import {
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
}: InertiaAppOptionsForCSR<SharedProps> | InertiaAppOptionsForSSR<SharedProps>): InertiaAppResponse {
  config.replace(defaults)

  const isServer = typeof window === 'undefined'
  const useScriptElementForInitialPage = config.get('future.useScriptElementForInitialPage')
  const initialPage = page || getInitialPageFromDOM<Page<SharedProps>>(id, useScriptElementForInitialPage)!

  // @ts-expect-error - This can be improved once we remove the 'unknown' type from the resolver...
  const resolveComponent = (name) => Promise.resolve(resolve(name)).then((module) => module.default || module)

  let head: string[] = []

  const reactApp = await Promise.all([
    resolveComponent(initialPage.component),
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
      if (!useScriptElementForInitialPage) {
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
          dangerouslySetInnerHTML: { __html: JSON.stringify(initialPage) },
        }),
        createElement('div', { id }, reactApp as ReactElement),
      )
    }

    const body = await render(element())

    return { head, body }
  }
}
