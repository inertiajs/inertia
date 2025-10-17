import {
  router,
  setupProgress,
  type CreateInertiaAppOptions,
  type InertiaAppResponse,
  type Page,
  type PageProps,
} from '@inertiajs/core'
import { escape } from 'lodash-es'
import type { ComponentType } from 'svelte'
import App from './components/App.svelte'
import type { ComponentResolver, InertiaAppProps } from './types'

type SvelteRenderResult = { html: string; head: string; css?: { code: string } }
type AppComponent<SharedProps extends PageProps = PageProps> = ComponentType<App> & {
  render: (props: InertiaAppProps<SharedProps>) => SvelteRenderResult
}

type SetupOptions<ElementType, SharedProps extends PageProps> = {
  el: ElementType
  App: AppComponent<SharedProps>
  props: InertiaAppProps<SharedProps>
}

interface InertiaAppOptionsForCSR<SharedProps extends PageProps = PageProps> extends CreateInertiaAppOptions {
  page?: Page<SharedProps>
  resolve: ComponentResolver
  setup: (options: SetupOptions<HTMLElement, SharedProps>) => void
}

interface InertiaAppOptionsForSSR<SharedProps extends PageProps = PageProps> extends CreateInertiaAppOptions {
  page: Page<SharedProps>
  resolve: ComponentResolver
  setup: (options: SetupOptions<null, SharedProps>) => SvelteRenderResult
}

export default async function createInertiaApp<SharedProps extends PageProps = PageProps>(
  options: InertiaAppOptionsForCSR<SharedProps>,
): InertiaAppResponse
export default async function createInertiaApp<SharedProps extends PageProps = PageProps>(
  options: InertiaAppOptionsForSSR<SharedProps>,
): InertiaAppResponse
export default async function createInertiaApp<SharedProps extends PageProps = PageProps>({
  id = 'app',
  page,
  resolve,
  setup,
  progress = {},
}: InertiaAppOptionsForCSR<SharedProps> | InertiaAppOptionsForSSR<SharedProps>): InertiaAppResponse {
  const isServer = typeof window === 'undefined'
  const el = isServer ? null : document.getElementById(id)
  const initialPage: Page<SharedProps> = page || JSON.parse(el?.dataset.page || '{}')
  const resolveComponent = (name: string) => Promise.resolve(resolve(name))

  const svelteApp = await Promise.all([
    resolveComponent(initialPage.component),
    router.decryptHistory().catch(() => {}),
  ]).then(([initialComponent]) => {
    const props = { initialPage, initialComponent, resolveComponent }

    if (isServer) {
      const ssrSetup = setup as (options: SetupOptions<null, SharedProps>) => SvelteRenderResult

      return ssrSetup({
        el: null,
        App: App as AppComponent<SharedProps>,
        props,
      })
    }

    const csrSetup = setup as (options: SetupOptions<HTMLElement, SharedProps>) => void

    return csrSetup({
      el: el!,
      App: App as AppComponent<SharedProps>,
      props,
    })
  })

  if (!isServer && progress) {
    setupProgress(progress)
  }

  if (isServer && svelteApp) {
    const { html, head, css } = svelteApp

    return {
      body: `<div data-server-rendered="true" id="${id}" data-page="${escape(JSON.stringify(initialPage))}">${html}</div>`,
      head: [head, css ? `<style data-vite-css>${css.code}</style>` : ''],
    }
  }
}
