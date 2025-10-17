import {
  CreateInertiaAppProps,
  HeadManagerTitleCallback,
  InertiaAppResponse,
  PageProps,
  router,
  setupProgress,
} from '@inertiajs/core'
import { createSSRApp, DefineComponent, h, Plugin, App as VueApp } from 'vue'
import App, { InertiaApp, InertiaAppProps, plugin } from './app'

type ComponentResolver = (name: string) => DefineComponent | Promise<DefineComponent> | { default: DefineComponent }

interface CreateInertiaVueAppProps<SharedProps extends PageProps = PageProps>
  extends CreateInertiaAppProps<
    SharedProps,
    ComponentResolver,
    {
      el: HTMLElement | null
      App: InertiaApp
      props: InertiaAppProps<SharedProps>
      plugin: Plugin
    },
    VueApp
  > {
  title?: HeadManagerTitleCallback
  render?: (app: VueApp) => Promise<string>
}

export default async function createInertiaApp<SharedProps extends PageProps = PageProps>({
  id = 'app',
  resolve,
  setup,
  title,
  progress = {},
  page,
  render,
}: CreateInertiaVueAppProps<SharedProps>): InertiaAppResponse {
  const isServer = typeof window === 'undefined'
  const el = isServer ? null : document.getElementById(id)
  const initialPage = page || JSON.parse(el?.dataset.page || '{}')
  const resolveComponent = (name: string) => Promise.resolve(resolve(name)).then((module) => module.default || module)

  let head: string[] = []

  const vueApp = await Promise.all([
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
        onHeadUpdate: isServer ? (elements) => (head = elements) : undefined,
      },
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
