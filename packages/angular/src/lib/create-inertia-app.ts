import { ApplicationRef, isDevMode, type EnvironmentProviders, type Provider } from '@angular/core'
import { createApplication, provideClientHydration } from '@angular/platform-browser'
import {
  exposeInterceptors,
  getInitialPageFromDOM,
  http as httpModule,
  router,
  setupProgress,
  type Page,
  type PageProps,
  type SharedPageProps,
} from '@inertiajs/core'
import { App } from './app'
import { config } from './config'
import { provideInertiaApp } from './providers'
import type { AngularCreateInertiaAppOptions, InertiaAppProps, ResolvedComponent, SetupOptions } from './types'

export default async function createInertiaApp<SharedProps extends PageProps = PageProps & SharedPageProps>(
  options: AngularCreateInertiaAppOptions<SharedProps>,
): Promise<ApplicationRef | void> {
  const {
    id = 'app',
    resolve,
    setup,
    title,
    progress = {},
    page,
    defaults = {},
    nonce,
    http,
    layout,
    serverHead,
    withApp,
    dev = isDevMode(),
  } = options

  if (!resolve) {
    throw new Error('createInertiaApp requires a component resolver.')
  }

  config.replace(defaults)

  if (nonce) {
    config.set('nonce', nonce)
  }

  if (http) {
    httpModule.setClient(http)
  }

  if (dev) {
    exposeInterceptors()
  }

  if (typeof document === 'undefined') {
    throw new Error('Use @inertiajs/angular/server to render an Angular Inertia application on the server.')
  }

  const initialPage = page ?? getInitialPageFromDOM<Page<SharedProps>>(id)
  if (!initialPage) {
    throw new Error(`Unable to find the initial Inertia page for #${id}.`)
  }

  const resolveComponent = (name: string, currentPage?: Page): Promise<ResolvedComponent> =>
    Promise.resolve(resolve(name, currentPage)).then((module) =>
      'default' in (module as { default?: ResolvedComponent })
        ? (module as { default: ResolvedComponent }).default
        : (module as ResolvedComponent),
    )

  const [initialComponent] = await Promise.all([
    resolveComponent(initialPage.component, initialPage),
    router.decryptHistory().catch(() => undefined),
  ])

  const props: InertiaAppProps<SharedProps> = {
    initialPage,
    initialComponent,
    resolveComponent,
    ...(title ? { titleCallback: title } : {}),
    ...(layout ? { defaultLayout: layout } : {}),
    ...(serverHead !== undefined ? { serverHead } : {}),
  }

  const el = document.getElementById(id)
  if (!el) {
    throw new Error(`Unable to find the Inertia root element #${id}.`)
  }

  const providers: Array<Provider | EnvironmentProviders> = [
    ...(el.hasAttribute('data-server-rendered') ? [provideClientHydration()] : []),
    provideInertiaApp(props as InertiaAppProps<PageProps>, withApp?.({ ssr: false, page: initialPage }) ?? []),
  ]

  if (setup) {
    const setupOptions: SetupOptions<SharedProps> = { el, App, props, providers }
    const result = await setup(setupOptions)
    if (progress) {
      setupProgress(progress)
    }
    return result
  }

  const application = await createApplication({ providers })
  application.bootstrap(App, { hostElement: el })

  if (progress) {
    setupProgress(progress)
  }

  return application
}
