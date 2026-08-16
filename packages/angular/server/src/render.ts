import { DOCUMENT } from '@angular/common'
import { createApplication, provideClientHydration } from '@angular/platform-browser'
import { provideServerRendering, renderApplication } from '@angular/platform-server'
import {
  App,
  provideInertiaApp,
  type AngularWithApp,
  type ComponentResolver,
  type InertiaAppProps,
  type ResolvedComponent,
} from '@inertiajs/angular'
import { resolveServerHead, type InertiaAppSSRResponse, type Page, type PageProps } from '@inertiajs/core'

export interface RenderAngularAppOptions<SharedProps extends PageProps = PageProps> {
  id?: string
  resolve: ComponentResolver
  title?: (title: string, page: Page) => string
  layout?: (name: string, page: Page) => unknown
  serverHead?: boolean | string | ((page: Page) => string[] | null | undefined)
  withApp?: AngularWithApp<SharedProps>
  document?: string
}

function resolveComponent(resolve: ComponentResolver, name: string, page: Page): Promise<ResolvedComponent> {
  return Promise.resolve(resolve(name, page)).then((module) =>
    'default' in (module as { default?: ResolvedComponent })
      ? (module as { default: ResolvedComponent }).default
      : (module as ResolvedComponent),
  )
}

export async function renderAngularApp<SharedProps extends PageProps = PageProps>(
  page: Page<SharedProps>,
  options: RenderAngularAppOptions<SharedProps>,
): Promise<InertiaAppSSRResponse> {
  const id = options.id ?? 'app'
  const component = await resolveComponent(options.resolve, page.component, page)
  let inertiaHead: string[] = []
  const props: InertiaAppProps<SharedProps> = {
    initialPage: page,
    initialComponent: component,
    resolveComponent: (name, currentPage) => resolveComponent(options.resolve, name, currentPage ?? page),
    ...(options.title ? { titleCallback: options.title } : {}),
    ...(options.layout ? { defaultLayout: options.layout } : {}),
    ...(options.serverHead !== undefined ? { serverHead: options.serverHead } : {}),
    onHeadUpdate: (elements) => {
      inertiaHead = elements
    },
  }
  const json = JSON.stringify(page).replaceAll('/', '\\/')
  const document =
    options.document ??
    `<!doctype html><html><head></head><body><script data-page="${id}" type="application/json">${json}</script><div data-server-rendered="true" id="${id}"></div></body></html>`
  const html = await renderApplication(
    async (context) => {
      const application = await createApplication(
        {
          providers: [
            provideServerRendering(),
            provideClientHydration(),
            provideInertiaApp(props, options.withApp?.({ ssr: true, page }) ?? []),
          ],
        },
        context,
      )
      const host = application.injector.get(DOCUMENT).getElementById(id)
      if (!host) throw new Error(`Unable to find the Inertia root element #${id} in the server document.`)
      application.bootstrap(App, { hostElement: host })
      return application
    },
    { document, url: page.url },
  )
  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i)
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  const angularHead = headMatch?.[1]?.trim()
  const head = [
    ...resolveServerHead(page, options.serverHead),
    ...inertiaHead,
    ...(angularHead ? [angularHead] : []),
  ].filter((element, index, elements) => elements.indexOf(element) === index)

  return { head, body: bodyMatch?.[1]?.trim() ?? '' }
}
