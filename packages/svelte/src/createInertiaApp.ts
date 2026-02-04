import {
  buildSSRBody,
  getInitialPageFromDOM,
  router,
  setupProgress,
  type CreateInertiaAppOptions as CreateInertiaAppOptionsBase,
  type InertiaAppSSRResponse,
  type Page,
  type PageProps,
} from '@inertiajs/core'
import { hydrate, mount } from 'svelte'
import App, { type InertiaAppProps } from './components/App.svelte'
import { config } from './index'
import type { ComponentResolver, ResolvedComponent, SvelteInertiaAppConfig } from './types'

type SvelteRenderResult = { body: string; head: string }

type SvelteServerRender = <T>(
  component: T,
  options: { props?: Record<string, unknown> },
) => SvelteRenderResult

type SetupOptions<SharedProps extends PageProps> = {
  el: HTMLElement | null
  App: typeof App
  props: InertiaAppProps<SharedProps>
}

export type CreateInertiaAppOptions<SharedProps extends PageProps = PageProps> = Omit<
  CreateInertiaAppOptionsBase<ComponentResolver, SetupOptions<SharedProps>, SvelteRenderResult | void, SvelteInertiaAppConfig>,
  'title'
> & {
  page?: Page<SharedProps>
  render?: SvelteServerRender
}

export type InertiaSSRRenderFunction<SharedProps extends PageProps = PageProps> = (
  page: Page<SharedProps>,
  render: SvelteServerRender,
) => Promise<InertiaAppSSRResponse>

export default async function createInertiaApp<SharedProps extends PageProps = PageProps>({
  id = 'app',
  resolve,
  setup,
  progress = {},
  page,
  render,
  defaults = {},
}: CreateInertiaAppOptions<SharedProps> = {}): Promise<InertiaSSRRenderFunction<SharedProps> | InertiaAppSSRResponse | void> {
  config.replace(defaults)

  if (!resolve) {
    throw new Error(
      'Inertia: Missing `resolve` option. Make sure to provide a resolve function or use the @inertiajs/vite plugin.',
    )
  }

  const resolveComponent = (name: string, p?: Page) => Promise.resolve(resolve(name, p))
  const useScriptElement = config.get('future.useScriptElementForInitialPage')

  if (typeof window === 'undefined') {
    // Legacy pattern: page + setup provided (Svelte calls render in setup)
    if (page && setup) {
      const component = (await Promise.resolve(resolveComponent(page.component, page))) as ResolvedComponent

      const props: InertiaAppProps<SharedProps> = {
        initialPage: page,
        initialComponent: component,
        resolveComponent,
      }

      const result = setup({ el: null, App, props })

      if (!result) {
        throw new Error('Inertia SSR setup function must return a render result ({ body, head })')
      }

      const body = buildSSRBody(id, page, result.body, useScriptElement)

      return {
        body,
        head: [result.head],
      }
    }

    const ssrRenderer = createSSRRenderer<SharedProps>(id, resolveComponent, setup, useScriptElement)

    // Backward compat: if page/render provided, render immediately (like createInertiaApp)
    if (page && render) {
      return ssrRenderer(page, render)
    }

    // Default: return render function (used by Vite plugin transform and createServer)
    return ssrRenderer
  }

  const initialPage = page || getInitialPageFromDOM<Page<SharedProps>>(id, useScriptElement)!

  const [component] = await Promise.all([
    resolveComponent(initialPage.component, initialPage) as Promise<ResolvedComponent>,
    router.decryptHistory().catch(() => {}),
  ])

  const target = document.getElementById(id)!
  const props: InertiaAppProps<SharedProps> = {
    initialPage,
    initialComponent: component,
    resolveComponent,
  }

  if (setup) {
    setup({ el: target, App, props })
  } else if (target.hasAttribute('data-server-rendered')) {
    hydrate(App, { target, props })
  } else {
    mount(App, { target, props })
  }

  if (progress) {
    setupProgress(progress)
  }
}

function createSSRRenderer<SharedProps extends PageProps>(
  id: string,
  resolveComponent: ComponentResolver,
  setup: ((options: SetupOptions<SharedProps>) => SvelteRenderResult | void) | undefined,
  useScriptElement: boolean,
): InertiaSSRRenderFunction<SharedProps> {
  return async (page: Page<SharedProps>, render: SvelteServerRender): Promise<InertiaAppSSRResponse> => {
    const component = (await Promise.resolve(resolveComponent(page.component, page))) as ResolvedComponent

    const props: InertiaAppProps<SharedProps> = {
      initialPage: page,
      initialComponent: component,
      resolveComponent,
    }

    let html: string
    let head: string

    if (setup) {
      const result = setup({ el: null, App, props })

      if (result) {
        html = result.body
        head = result.head
      } else {
        const rendered = render(App, { props: props as unknown as Record<string, unknown> })
        html = rendered.body
        head = rendered.head
      }
    } else {
      const rendered = render(App, { props: props as unknown as Record<string, unknown> })
      html = rendered.body
      head = rendered.head
    }

    const body = buildSSRBody(id, page, html, useScriptElement)

    return {
      body,
      head: [head],
    }
  }
}
