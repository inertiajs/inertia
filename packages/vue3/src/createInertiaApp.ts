import { Page, setupProgress, renderSSRHead, getActiveHead } from '@inertiajs/core'
import type { SSRHeadPayload } from '@inertiajs/core'
import { DefineComponent, Plugin, App as VueApp, createSSRApp, h } from 'vue'
import App, { InertiaApp, InertiaAppProps, plugin } from './app'

interface CreateInertiaAppProps {
  id?: string
  resolve: (name: string) => DefineComponent | Promise<DefineComponent> | { default: DefineComponent }
  setup: (props: { el: Element; App: InertiaApp; props: InertiaAppProps; plugin: Plugin }) => void | VueApp
  progress?:
    | false
    | {
        delay?: number
        color?: string
        includeCSS?: boolean
        showSpinner?: boolean
      }
  page?: Page
  render?: (app: VueApp) => Promise<string>
}

export default async function createInertiaApp({
  id = 'app',
  resolve,
  setup,
  progress = {},
  page,
  render,
}: CreateInertiaAppProps): Promise<{ head: string[]; body: string, unhead: SSRHeadPayload }> {
  const isServer = typeof window === 'undefined'
  const el = isServer ? null : document.getElementById(id)
  const initialPage = page || JSON.parse(el.dataset.page)
  const resolveComponent = (name) => Promise.resolve(resolve(name)).then((module) => module.default || module)

  const vueApp = await resolveComponent(initialPage.component).then((initialComponent) => {
    return setup({
      el,
      App,
      props: {
        initialPage,
        initialComponent,
        resolveComponent,
      },
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

    const unhead = await renderSSRHead(getActiveHead())

    const head = `${unhead.headTags}${unhead.bodyTagsOpen}${unhead.bodyTags}`.split('\n')

    return { head, body, unhead }
  }
}
