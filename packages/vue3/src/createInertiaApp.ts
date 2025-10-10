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
import { ComponentPublicInstance, DefineComponent, Plugin, App as VueApp, createSSRApp, h } from 'vue'
import App, { InertiaApp, InertiaAppProps, plugin } from './app'

type VuePageResolver = (name: string) => DefineComponent | Promise<DefineComponent>

export type SetupProps<SharedProps extends PageProps = PageProps> = {
  initialPage: Page<SharedProps>
  initialComponent: ComponentPublicInstance | Promise<ComponentPublicInstance>
  resolveComponent: VuePageResolver
  titleCallback?: HeadTitleCallback
  onHeadUpdate?: HeadOnUpdateCallback
}

interface CreateInertiaAppProps extends CreateInertiaAppOptions {
  resolve: (name: string) => DefineComponent | Promise<DefineComponent> | { default: DefineComponent }
  setup: (props: { el: Element; App: InertiaApp; props: InertiaAppProps; plugin: Plugin }) => void | VueApp
  title?: HeadTitleCallback
  page?: Page
  render?: (app: VueApp) => Promise<string>
}

export default async function createInertiaApp({
  id = 'app',
  resolve,
  setup,
  title,
  progress = {},
  page,
  render,
}: CreateInertiaAppProps): InertiaAppResponse {
  const isServer = typeof window === 'undefined'
  const el = isServer ? null : document.getElementById(id)
  const initialPage = page || (JSON.parse(el?.dataset.page ?? '{}') as Page)

  const resolveComponent = (name: string) => Promise.resolve(resolve(name)).then((module) => module.default || module)

  let head: string[] = []

  const vueApp = await Promise.all([
    resolveComponent(initialPage.component),
    router.decryptHistory().catch(() => {}),
  ]).then(([initialComponent]) => {
    const setupProps: SetupProps = {
      initialPage,
      initialComponent,
      resolveComponent,
      titleCallback: title,
    }

    if (isServer) {
      return setup({
        el: null,
        App,
        props: { ...setupProps, onHeadUpdate: (elements) => (head = elements) },
        plugin,
      })
    }

    return setup({
      el: el as HTMLElement,
      App,
      props: setupProps,
      plugin,
    })
  })

  if (!isServer && progress) {
    setupProgress(progress)
  }

  if (isServer) {
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
