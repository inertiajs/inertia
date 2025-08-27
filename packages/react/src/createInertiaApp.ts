import {
  HeadOnUpdateCallback,
  HeadTitleCallback,
  InertiaAppProgressOptions,
  InertiaAppSSRContent,
  Page,
  PageProps,
  PageResolver,
  router,
  setupProgress,
} from '@inertiajs/core'
import { ComponentType, FunctionComponent, Key, ReactElement, ReactNode, createElement } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'

type AppType<SharedProps extends PageProps = PageProps> = FunctionComponent<
  {
    children?: (props: { Component: ComponentType; key: Key; props: Page<SharedProps>['props'] }) => ReactNode
  } & SetupOptions<unknown, SharedProps>['props']
>

export type SetupOptions<ElementType, SharedProps extends PageProps> = {
  el: ElementType
  App: AppType
  props: {
    initialPage: Page<SharedProps>
    initialComponent: ReactNode
    resolveComponent: PageResolver
    titleCallback?: HeadTitleCallback
    onHeadUpdate?: HeadOnUpdateCallback
  }
}

type BaseInertiaAppOptions = {
  id?: string
  title?: HeadTitleCallback
  progress?: InertiaAppProgressOptions | false
  resolve: PageResolver
}

type CreateInertiaAppSetupReturnType = ReactElement | void
type InertiaAppOptionsForCSR<SharedProps extends PageProps> = BaseInertiaAppOptions & {
  page?: Page
  render?: undefined
  setup(options: SetupOptions<HTMLElement, SharedProps>): CreateInertiaAppSetupReturnType
}

type InertiaAppOptionsForSSR<SharedProps extends PageProps> = BaseInertiaAppOptions & {
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
}: InertiaAppOptions<SharedProps>): Promise<CreateInertiaAppSetupReturnType | InertiaAppSSRContent> {
  const isServer = typeof window === 'undefined'
  const el = isServer ? null : document.getElementById(id)
  const initialPage = page || JSON.parse(el.dataset.page)
  // @ts-expect-error
  const resolveComponent = (name) => Promise.resolve(resolve(name)).then((module) => module.default || module)

  let head = []

  const reactApp = await Promise.all([
    resolveComponent(initialPage.component),
    router.decryptHistory().catch(() => {}),
  ]).then(([initialComponent]) => {
    return setup({
      // @ts-expect-error
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

  if (isServer && reactApp) {
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
