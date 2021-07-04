import Vue from 'vue'
import { Renderer } from 'vue-server-renderer'
import { App, AppType, plugin } from './app'
import { Component, Page, PageResolver, HeadManagerTitleCallback } from '@inertiajs/inertia/types/types'
import { HeadManagerOnUpdate, VisitOptions } from '@inertiajs/inertia'

type SetupOptions<ElementType> = {
  el: ElementType,
  App: AppType,
  app: AppType
  props: {
    attrs: {
      id: string,
      'data-page': string,
    },
    props: {
      initialPage: Page,
      initialComponent: Component,
      resolveComponent: PageResolver,
      titleCallback?: HeadManagerTitleCallback
      onHeadUpdate: HeadManagerOnUpdate|null
    }
  },
}

type BaseInertiaAppOptions = {
  title?: HeadManagerTitleCallback,
  resolve: PageResolver
}

type InertiaAppOptionsForSSR = BaseInertiaAppOptions & {
  id?: undefined,
  page: Page|string,
  render: Renderer['renderToString'],
  visitOptions?: undefined,
  setup(options: SetupOptions<null>): InstanceType<typeof Vue>
}

type InertiaAppOptionsForCSR = BaseInertiaAppOptions & {
  id?: string,
  page?: undefined,
  render?: undefined,
  visitOptions?: VisitOptions,
  setup(options: SetupOptions<HTMLElement>): void
}

export function createInertiaApp(options: InertiaAppOptionsForCSR): Promise<void>
export function createInertiaApp(options: InertiaAppOptionsForSSR): Promise<{ head: string[]; body: string }>

export async function createInertiaApp({ id, resolve, setup, title, visitOptions, page, render }: InertiaAppOptionsForSSR | InertiaAppOptionsForCSR): Promise<{ head: string[]; body: string } | void> {
  const elementId: string = id || 'app'
  const isServer: boolean = typeof window === 'undefined'
  const el: HTMLElement|null = isServer ? null : document.getElementById(elementId)
  const initialPage: Page = page || JSON.parse(<string>el?.dataset.page)
  const resolveComponent: PageResolver = name => Promise.resolve(resolve(name)).then(module => (module as Record<string, unknown>).default || module)

  Vue.use(plugin)

  let head: string[] = []

  const vueApp = await resolveComponent(initialPage.component).then(initialComponent => {
    const options = {
      el,
      app: App, // deprecated
      App,
      props: {
        attrs: {
          id: elementId,
          'data-page': JSON.stringify(initialPage),
        },
        props: {
          initialPage,
          initialComponent,
          resolveComponent,
          titleCallback: title,
          onHeadUpdate: isServer ? (elements: string[]) => (head = elements) : null,
          visitOptions,
        },
      },
      plugin,
    }

    if (isServer) {
      return (setup as InertiaAppOptionsForSSR['setup'])({ ... options, el: null })
    }

    if (el === null) {
      throw new Error(`Could not find required document element with id [${elementId}].`)
    }

    return (setup as InertiaAppOptionsForCSR['setup'])({... options, el: (el as HTMLElement)})
  })

  if (isServer && vueApp && render) {
    return render(vueApp)
      .then(body => ({ head, body }))
  }
}
