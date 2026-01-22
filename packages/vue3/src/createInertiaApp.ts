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
import { createSSRApp, DefineComponent, h, Plugin, App as VueApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import App, { InertiaApp, InertiaAppProps, plugin } from './app'
import { config } from './index'
import { VueInertiaAppConfig } from './types'

type ComponentResolver = (
  name: string,
  page?: Page,
) => DefineComponent | Promise<DefineComponent> | { default: DefineComponent }

type SetupOptions<ElementType, SharedProps extends PageProps> = {
  el: ElementType
  App: InertiaApp
  props: InertiaAppProps<SharedProps>
  plugin: Plugin
}

type InertiaAppOptionsForCSR<SharedProps extends PageProps> = CreateInertiaAppOptionsForCSR<
  SharedProps,
  ComponentResolver,
  SetupOptions<HTMLElement, SharedProps>,
  void,
  VueInertiaAppConfig
>

type InertiaAppOptionsForSSR<SharedProps extends PageProps> = CreateInertiaAppOptionsForSSR<
  SharedProps,
  ComponentResolver,
  SetupOptions<null, SharedProps>,
  VueApp,
  VueInertiaAppConfig
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

  const resolveComponent = (name: string, page?: Page) =>
    Promise.resolve(resolve(name, page)).then((module) => module.default || module)

  let head: string[] = []

  const vueApp = await Promise.all([
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
      el: document.getElementById(id)!,
      App,
      props,
      plugin,
    })
  })

  if (!isServer && progress) {
    setupProgress(progress)
  }

  if (isServer && render) {
    const element = () => {
      if (!useScriptElementForInitialPage) {
        return h('div', {
          id,
          'data-page': JSON.stringify(initialPage),
          innerHTML: vueApp ? render(vueApp) : '',
        })
      }

      return [
        h('script', {
          'data-page': id,
          type: 'application/json',
          innerHTML: JSON.stringify(initialPage).replace(/\//g, '\\/'),
        }),
        h('div', {
          id,
          innerHTML: vueApp ? render(vueApp) : '',
        }),
      ]
    }

    const body = await render(
      createSSRApp({
        render: () => element(),
      }),
    )

    return { head, body }
  }
}
