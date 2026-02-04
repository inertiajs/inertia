import {
  buildSSRBody,
  loadInitialPage,
  setupProgress,
  type ConfigureInertiaAppOptions as ConfigureInertiaAppOptionsBase,
  type InertiaAppSSRResponse,
  type Page,
  type PageProps,
} from '@inertiajs/core'
import { hydrate, mount } from 'svelte'
import App from './components/App.svelte'
import { config } from './index'
import type { ComponentResolver, ResolvedComponent, SvelteInertiaAppConfig } from './types'

type SvelteRenderResult = { body: string; head: string }

type SvelteServerRender = <T>(
  component: T,
  options: { props?: Record<string, unknown> },
) => SvelteRenderResult

export type ConfigureInertiaAppOptions = Omit<
  ConfigureInertiaAppOptionsBase<ComponentResolver, never, never, SvelteInertiaAppConfig>,
  'setup' | 'title'
>

export type InertiaSSRRenderFunction<SharedProps extends PageProps = PageProps> = (
  page: Page<SharedProps>,
  render: SvelteServerRender,
) => Promise<InertiaAppSSRResponse>

export default async function configureInertiaApp<SharedProps extends PageProps = PageProps>({
  id = 'app',
  resolve,
  progress = {},
  defaults = {},
}: ConfigureInertiaAppOptions = {}): Promise<InertiaSSRRenderFunction<SharedProps> | void> {
  config.replace(defaults)

  if (!resolve) {
    throw new Error(
      'Inertia: Missing `resolve` option. Make sure to provide a resolve function or use the @inertiajs/vite plugin.',
    )
  }

  const resolveComponent = (name: string) => Promise.resolve(resolve(name))
  const useScriptElement = config.get('future.useScriptElementForInitialPage')

  if (typeof window === 'undefined') {
    return createSSRRenderer(id, resolveComponent, useScriptElement)
  }

  const { page, component } = await loadInitialPage(id, useScriptElement, resolveComponent)

  const target = document.getElementById(id)!
  const props = { initialPage: page, initialComponent: component, resolveComponent }

  if (target.hasAttribute('data-server-rendered')) {
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
  useScriptElement: boolean,
): InertiaSSRRenderFunction<SharedProps> {
  return async (page: Page<SharedProps>, render: SvelteServerRender): Promise<InertiaAppSSRResponse> => {
    const component = (await Promise.resolve(resolveComponent(page.component))) as ResolvedComponent

    const { body: html, head } = render(App, {
      props: {
        initialPage: page,
        initialComponent: component,
        resolveComponent,
      },
    })

    const body = buildSSRBody(id, page, html, useScriptElement)

    return {
      body,
      head: [head],
    }
  }
}
