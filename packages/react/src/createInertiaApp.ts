import {
  CreateInertiaAppProps,
  HeadManagerOnUpdateCallback,
  HeadManagerTitleCallback,
  InertiaAppResponse,
  InertiaAppSSRContent,
  Page,
  PageProps,
  PageResolver,
  router,
  setupProgress,
} from '@inertiajs/core'
import { ReactElement, createElement } from 'react'
import { renderToString } from 'react-dom/server'
import App, { type InertiaApp } from './App'
import { ReactComponent } from './types'

export type SetupOptions<ElementType, SharedProps extends PageProps> = {
  el: ElementType
  App: InertiaApp
  props: {
    initialPage: Page<SharedProps>
    initialComponent: ReactComponent
    resolveComponent: PageResolver
    titleCallback?: HeadManagerTitleCallback
    onHeadUpdate?: HeadManagerOnUpdateCallback
  }
}

type InertiaAppOptionsForCSR<SharedProps extends PageProps> = CreateInertiaAppProps<
  SharedProps,
  PageResolver,
  SetupOptions<HTMLElement, SharedProps>,
  void
> & {
  title?: HeadManagerTitleCallback
  render?: undefined
}

type InertiaAppOptionsForSSR<SharedProps extends PageProps> = CreateInertiaAppProps<
  SharedProps,
  PageResolver,
  SetupOptions<null, SharedProps>,
  ReactElement
> & {
  title?: HeadManagerTitleCallback
  render: typeof renderToString
}

export default async function createInertiaApp<SharedProps extends PageProps = PageProps>(
  options: InertiaAppOptionsForCSR<SharedProps>,
): Promise<void>
export default async function createInertiaApp<SharedProps extends PageProps = PageProps>(
  options: InertiaAppOptionsForSSR<SharedProps>,
): Promise<InertiaAppSSRContent>
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
  const initialPage = page || JSON.parse(el?.dataset.page || '{}')
  // @ts-expect-error
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
      onHeadUpdate: isServer ? (elements: string[]) => (head = elements) : undefined,
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

  if (isServer && render) {
    const body = await render(
      createElement(
        'div',
        {
          id,
          'data-page': JSON.stringify(initialPage),
        },
        reactApp as ReactElement,
      ),
    )

    return { head, body }
  }
}
