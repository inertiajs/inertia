import {
  buildSSRBody,
  loadInitialPage,
  setupProgress,
  type InertiaAppSSRResponse,
  type Page,
  type PageProps,
} from '@inertiajs/core'
import { hydrate, mount } from 'svelte'
import App from './components/App.svelte'
import { config } from './index'
import type { ComponentResolver, SvelteInertiaAppConfig } from './types'

type SvelteRenderResult = { html: string; head: string; css?: { code: string } }

export type ConfigureInertiaAppOptions = {
  id?: string
  resolve?: ComponentResolver
  pages?:
    | string
    | {
        path: string
        extension?: string | string[]
        transform?: (name: string) => string
      }
  progress?: Parameters<typeof setupProgress>[0] | false
  defaults?: SvelteInertiaAppConfig
}

export type InertiaSSRRenderFunction<SharedProps extends PageProps = PageProps> = (
  page: Page<SharedProps>,
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
  resolveComponent: (name: string) => Promise<unknown>,
  useScriptElement: boolean,
): InertiaSSRRenderFunction<SharedProps> {
  return async (page: Page<SharedProps>): Promise<InertiaAppSSRResponse> => {
    const component = await resolveComponent(page.component)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { html, head, css } = (App as any).render({
      initialPage: page,
      initialComponent: component,
      resolveComponent,
    }) as SvelteRenderResult

    const body = buildSSRBody(id, page, html, useScriptElement)

    return {
      body,
      head: [head, css ? `<style data-vite-css>${css.code}</style>` : ''],
    }
  }
}
