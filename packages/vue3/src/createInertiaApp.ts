import {
  CreateInertiaAppOptions,
  HeadOnUpdateCallback,
  HeadTitleCallback,
  InertiaAppResponse,
  Page,
  PageProps,
  router,
  setupProgress,
} from '@inertiajs/core'
import { DefineComponent, Plugin, App as VueApp, createSSRApp, h } from 'vue'
import App, { InertiaApp, InertiaAppProps, plugin } from './app'

type VuePageResolver = (name: string) => DefineComponent | Promise<DefineComponent>

export type SetupProps<SharedProps extends PageProps = PageProps> = {
  initialPage: Page<SharedProps>
  initialComponent: DefineComponent
  resolveComponent: VuePageResolver
  titleCallback?: HeadTitleCallback
  onHeadUpdate?: HeadOnUpdateCallback
}

type SetupOptions<ElementType, SharedProps extends PageProps> = {
  el: ElementType
  App: InertiaApp
  props: InertiaAppProps<SharedProps>
  plugin: Plugin
}

type CreateInertiaAppOptionsForCSR<SharedProps extends PageProps = PageProps> = CreateInertiaAppOptions & {
  resolve: (name: string) => DefineComponent | Promise<DefineComponent> | { default: DefineComponent }
  setup: (options: { el: HTMLElement; App: InertiaApp; props: InertiaAppProps<SharedProps>; plugin: Plugin }) => void
  title?: HeadTitleCallback
  page?: Page<SharedProps>
  render?: (app: VueApp) => Promise<string>
}

type CreateInertiaAppOptionsForSSR<SharedProps extends PageProps = PageProps> = CreateInertiaAppOptions & {
  resolve: (name: string) => DefineComponent | Promise<DefineComponent> | { default: DefineComponent }
  setup: (options: { el: null; App: InertiaApp; props: InertiaAppProps<SharedProps>; plugin: Plugin }) => VueApp
  title?: HeadTitleCallback
  page?: Page<SharedProps>
  render?: (app: VueApp) => Promise<string>
}

export default async function createInertiaApp<SharedProps extends PageProps = PageProps>(
  options: CreateInertiaAppOptionsForCSR<SharedProps>,
): InertiaAppResponse
export default async function createInertiaApp<SharedProps extends PageProps = PageProps>(
  options: CreateInertiaAppOptionsForSSR<SharedProps>,
): InertiaAppResponse
export default async function createInertiaApp<SharedProps extends PageProps = PageProps>({
  id = 'app',
  resolve,
  setup,
  title,
  progress = {},
  page,
  render,
}: CreateInertiaAppOptionsForCSR<SharedProps> | CreateInertiaAppOptionsForSSR<SharedProps>): InertiaAppResponse {
  const isServer = typeof window === 'undefined'
  const el = isServer ? null : document.getElementById(id)
  const initialPage = page || (JSON.parse(el?.dataset.page ?? '{}') as Page<SharedProps>)

  const resolveComponent = (name: string) =>
    Promise.resolve(resolve(name)).then((module) => {
      const typedModule = module as DefineComponent | { default: DefineComponent }
      return 'default' in typedModule ? typedModule.default : typedModule
    })

  let head: string[] = []

  const vueApp = await Promise.all([
    resolveComponent(initialPage.component),
    router.decryptHistory().catch(() => {}),
  ]).then(([initialComponent]) => {
    const props: SetupProps<SharedProps> = {
      initialPage,
      initialComponent,
      resolveComponent,
      titleCallback: title,
    }

    if (isServer) {
      const ssrSetup = setup as (options: SetupOptions<null, SharedProps>) => VueApp

      return ssrSetup({
        el: null,
        App,
        props: { ...props, onHeadUpdate: (elements: string[]) => (head = elements) },
        plugin,
      })
    }

    const csrSetup = setup as (options: SetupOptions<HTMLElement, SharedProps>) => void

    return csrSetup({
      el: el!,
      App,
      props,
      plugin,
    })
  })

  if (!isServer && progress) {
    setupProgress(progress)
  }

  if (isServer && render) {
    const body = await render(
      createSSRApp({
        render: () =>
          h('div', {
            id,
            'data-page': JSON.stringify(initialPage),
            innerHTML: vueApp ? render(vueApp) : '',
          }),
      }),
    )

    return { head, body }
  }
}
