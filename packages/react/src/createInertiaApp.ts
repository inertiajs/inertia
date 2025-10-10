import {
  CreateInertiaAppOptions,
  HeadOnUpdateCallback,
  HeadTitleCallback,
  InertiaAppResponse,
  Page,
  PageProps,
  PageResolver,
  router,
  setupProgress,
} from '@inertiajs/core'
import { ComponentType, FunctionComponent, Key, ReactElement, ReactNode, createElement } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'

type SetupProps<SharedProps extends PageProps> = {
  initialPage: Page<SharedProps>
  initialComponent: ReactNode
  resolveComponent: PageResolver
  titleCallback?: HeadTitleCallback
  onHeadUpdate?: HeadOnUpdateCallback
}

export type AppOptions<SharedProps extends PageProps = PageProps> = SetupProps<SharedProps> & {
  children?: (props: { Component: ComponentType; key: Key; props: Page<SharedProps>['props'] }) => ReactNode
}

export type SetupOptions<ElementType, SharedProps extends PageProps> = {
  el: ElementType
  App: FunctionComponent<AppOptions<SharedProps>>
  props: Omit<AppOptions<SharedProps>, 'children'>
}

type InertiaAppOptionsForCSR<SharedProps extends PageProps> = CreateInertiaAppOptions & {
  title?: HeadTitleCallback
  page?: Page
  render?: undefined
  setup(options: SetupOptions<HTMLElement, SharedProps>): void
}

type InertiaAppOptionsForSSR<SharedProps extends PageProps> = CreateInertiaAppOptions & {
  title?: HeadTitleCallback
  page: Page
  render: typeof renderToString
  setup(options: SetupOptions<null, SharedProps>): ReactElement
}

type InertiaAppOptions<SharedProps extends PageProps> =
  | InertiaAppOptionsForCSR<SharedProps>
  | InertiaAppOptionsForSSR<SharedProps>

export default async function createInertiaApp<SharedProps extends PageProps = PageProps>({
  id = 'app',
  resolve,
  setup,
  title,
  progress = {},
  page,
  render,
}: InertiaAppOptions<SharedProps>): InertiaAppResponse {
  const isServer = typeof window === 'undefined'
  const el = isServer ? null : document.getElementById(id)
  const initialPage = page || (JSON.parse(el?.dataset.page ?? '{}') as Page<SharedProps>)
  const resolveComponent: PageResolver = (name) =>
    Promise.resolve(resolve(name)).then((module) => module.default || module)

  let head: string[] = []

  const reactApp = await Promise.all([
    resolveComponent(initialPage.component),
    router.decryptHistory().catch(() => {}),
  ]).then(([initialComponent]) => {
    return setup({
      el,
      App,
      props: {
        initialPage,
        initialComponent,
        resolveComponent,
        titleCallback: title,
        onHeadUpdate: isServer ? (elements) => (head = elements) : null,
      },
    })
  })

  if (!isServer && progress) {
    setupProgress(progress)
  }

  if (isServer && reactApp && render) {
    const body = await render(
      createElement(
        'div',
        {
          id,
          'data-page': JSON.stringify(initialPage),
        },
        reactApp,
      ),
    )

    return { head, body }
  }
}
