import {
  CreateInertiaAppOptions,
  HeadManagerOnUpdateCallback,
  HeadManagerTitleCallback,
  InertiaAppResponse,
  Page,
  PageProps,
  router,
  setupProgress,
} from '@inertiajs/core'
import { ComponentType, FunctionComponent, Key, ReactElement, ReactNode, createElement } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'

type ReactPageResolver = (name: string) => Promise<ReactNode>

type SetupProps<SharedProps extends PageProps> = {
  initialPage: Page<SharedProps>
  initialComponent: ReactNode
  resolveComponent: ReactPageResolver
  titleCallback?: HeadManagerTitleCallback
  onHeadUpdate?: HeadManagerOnUpdateCallback
}

export type InertiaComponentType = ComponentType & {
  layout?: ((page: ReactNode) => ReactNode) | ComponentType[]
}

export type RenderChildrenOptions<SharedProps extends PageProps> = {
  Component: InertiaComponentType
  key: Key | null
  props: Page<SharedProps>['props']
}

export type AppOptions<SharedProps extends PageProps = PageProps> = SetupProps<SharedProps> & {
  children?: (props: RenderChildrenOptions<SharedProps>) => ReactNode
}

export type AppComponent<SharedProps extends PageProps = PageProps> = FunctionComponent<AppOptions<SharedProps>>

type SetupOptions<ElementType, SharedProps extends PageProps> = {
  el: ElementType
  App: AppComponent<SharedProps>
  props: Omit<AppOptions<SharedProps>, 'children'>
}

type InertiaAppOptionsForCSR<SharedProps extends PageProps> = CreateInertiaAppOptions & {
  title?: HeadManagerTitleCallback
  page?: Page<SharedProps>
  render?: undefined
  setup(options: SetupOptions<HTMLElement, SharedProps>): void
}

type InertiaAppOptionsForSSR<SharedProps extends PageProps> = CreateInertiaAppOptions & {
  title?: HeadManagerTitleCallback
  page: Page<SharedProps>
  render: typeof renderToString
  setup(options: SetupOptions<null, SharedProps>): ReactElement
}

export default async function createInertiaApp<SharedProps extends PageProps = PageProps>(
  options: InertiaAppOptionsForCSR<SharedProps>,
): InertiaAppResponse
export default async function createInertiaApp<SharedProps extends PageProps = PageProps>(
  options: InertiaAppOptionsForSSR<SharedProps>,
): InertiaAppResponse
export default async function createInertiaApp<SharedProps extends PageProps = PageProps>({
  id = 'app',
  resolve,
  setup,
  title,
  progress = {},
  page,
  render,
}: InertiaAppOptionsForCSR<SharedProps> | InertiaAppOptionsForSSR<SharedProps>): InertiaAppResponse {
  const isServer = typeof window === 'undefined'
  const el = isServer ? null : document.getElementById(id)
  const initialPage = page || (JSON.parse(el?.dataset.page ?? '{}') as Page<SharedProps>)
  const resolveComponent: ReactPageResolver = (name) =>
    Promise.resolve(resolve(name)).then((module) => {
      const m = module as { default?: ReactNode }
      return m.default || (module as ReactNode)
    })

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
      el: el as HTMLElement,
      App,
      props,
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
