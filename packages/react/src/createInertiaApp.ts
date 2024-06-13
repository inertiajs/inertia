import { Page, PageProps, PageResolver, setupProgress } from '@inertiajs/core'
import { ComponentType, FunctionComponent, Key, ReactElement, ReactNode, createElement } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'

type ReactInstance = ReactElement
type ReactComponent = ReactNode

type HeadManagerOnUpdate = (elements: string[]) => void // TODO: When shipped, replace with: Inertia.HeadManagerOnUpdate
type HeadManagerTitleCallback = (title: string) => string // TODO: When shipped, replace with: Inertia.HeadManagerTitleCallback

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
    initialComponent: ReactComponent
    resolveComponent: PageResolver
    titleCallback?: HeadManagerTitleCallback
    onHeadUpdate?: HeadManagerOnUpdate
  }
}

type BaseInertiaAppOptions = {
  title?: HeadManagerTitleCallback
  resolve: PageResolver
}

type CreateInertiaAppSetupReturnType = ReactInstance | void
type InertiaAppOptionsForCSR<SharedProps extends PageProps> = BaseInertiaAppOptions & {
  id?: string
  page?: Page | string
  render?: undefined
  progress?:
    | false
    | {
        delay?: number
        color?: string
        includeCSS?: boolean
        showSpinner?: boolean
      }
  setup(options: SetupOptions<HTMLElement, SharedProps>): CreateInertiaAppSetupReturnType
}

type CreateInertiaAppSSRContent = { head: string[]; body: string }
type InertiaAppOptionsForSSR<SharedProps extends PageProps> = BaseInertiaAppOptions & {
  id?: undefined
  page: Page | string
  render: typeof renderToString
  progress?: undefined
  setup(options: SetupOptions<null, SharedProps>): ReactInstance
}

export default async function createInertiaApp<SharedProps extends PageProps = PageProps>(
  options: InertiaAppOptionsForCSR<SharedProps>,
): Promise<CreateInertiaAppSetupReturnType>
export default async function createInertiaApp<SharedProps extends PageProps = PageProps>(
  options: InertiaAppOptionsForSSR<SharedProps>,
): Promise<CreateInertiaAppSSRContent>
export default async function createInertiaApp<SharedProps extends PageProps = PageProps>({
  id = 'app',
  resolve,
  setup,
  title,
  progress = {},
  page,
  render,
}: InertiaAppOptionsForCSR<SharedProps> | InertiaAppOptionsForSSR<SharedProps>): Promise<
  CreateInertiaAppSetupReturnType | CreateInertiaAppSSRContent
> {
  const isServer = typeof window === 'undefined'
  const el = isServer ? null : document.getElementById(id)
  const initialPage = page || JSON.parse(el.dataset.page)
  // @ts-expect-error
  const resolveComponent = (name, page) => Promise.resolve(resolve(name, page)).then((module) => module.default || module)

  let head = []

  const reactApp = await resolveComponent(initialPage.component, initialPage).then((initialComponent) => {
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

  if (isServer) {
    const body = await render(
      createElement(
        'div',
        {
          id,
          'data-page': JSON.stringify(initialPage),
        },
        // @ts-expect-error
        reactApp,
      ),
    )

    return { head, body }
  }
}
