import { Page, setupProgress } from '@inertiajs/core'
import { Component, PluginObject } from 'vue'
import App, { InertiaApp, InertiaProps, plugin } from './app'

interface CreateInertiaAppProps {
  id?: string
  resolve: (name: string, page: Page) => Component | Promise<Component> | { default: Component }
  setup: (props: {
    el: Element
    App: InertiaApp
    props: {
      attrs: { id: string; 'data-page': string }
      props: InertiaProps
    }
    plugin: PluginObject<any>
  }) => void | Vue
  title?: (title: string) => string
  progress?:
    | false
    | {
        delay?: number
        color?: string
        includeCSS?: boolean
        showSpinner?: boolean
      }
  page?: Page
  render?: (vm: Vue) => Promise<string>
}

export default async function createInertiaApp({
  id = 'app',
  resolve,
  setup,
  title,
  progress = {},
  page,
  render,
}: CreateInertiaAppProps): Promise<{ head: string[]; body: string } | void> {
  const isServer = typeof window === 'undefined'
  const el = isServer ? null : document.getElementById(id)
  const initialPage = page || JSON.parse(el.dataset.page)
  // @ts-expect-error
  const resolveComponent = (name, page) => Promise.resolve(resolve(name, page)).then((module) => module.default || module)

  let head = []

  const vueApp = await resolveComponent(initialPage.component, initialPage).then((initialComponent) => {
    return setup({
      el,
      App,
      props: {
        attrs: {
          id,
          'data-page': JSON.stringify(initialPage),
        },
        props: {
          initialPage,
          initialComponent,
          // @ts-expect-error
          resolveComponent,
          titleCallback: title,
          onHeadUpdate: isServer ? (elements) => (head = elements) : null,
        },
      },
      plugin,
    })
  })

  if (!isServer && progress) {
    setupProgress(progress)
  }

  if (isServer) {
    // @ts-expect-error
    return render(vueApp).then((body) => ({ head, body }))
  }
}
