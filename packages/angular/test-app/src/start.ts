import { createInertiaApp, router } from '@inertiajs/angular'
import { axiosAdapter, type HttpClient, type HttpClientOptions, type Page, type VisitOptions } from '@inertiajs/core'
import { AppLayout, DefaultLayout } from './layout-pages'
import { fallbackPage, pages, WITH_APP_VALUE } from './pages'

export async function start(page?: Page, unified = false): Promise<void> {
  window.testing = { Inertia: router }
  window.resolverReceivedPage = null
  const params = new URLSearchParams(window.location.search)

  await createInertiaApp({
    ...(page ? { page } : {}),
    dev: false,
    progress: { delay: 0, color: 'red' },
    http: getHttpConfig(params),
    ...(params.has('withAppDefaults')
      ? {
          defaults: {
            visitOptions: (_href: string, options: VisitOptions) => ({
              headers: { ...options.headers, 'X-From-App-Defaults': 'test' },
            }),
          },
        }
      : {}),
    resolve: async (name, resolvedPage) => {
      if (resolvedPage) window.resolverReceivedPage = resolvedPage
      if (name === 'DeferredProps/InstantReload') {
        await new Promise((resolve) => setTimeout(resolve, 50))
      }
      return pages[name] ?? fallbackPage
    },
    ...(unified
      ? {
          withApp: ({ page: currentPage }) => [
            {
              provide: WITH_APP_VALUE,
              useValue: {
                injected: 'injected-via-withApp',
                locale: String(currentPage.props['locale'] ?? 'unknown'),
                component: currentPage.component,
              },
            },
          ],
        }
      : {}),
    ...(params.has('withDefaultLayout') ? { layout: () => DefaultLayout } : {}),
    ...(params.has('withDefaultAppLayout') ? { layout: () => AppLayout } : {}),
    ...(params.has('withDefaultLayoutCallback')
      ? { layout: (name: string) => (name.startsWith('DefaultLayout/CallbackExcluded') ? null : DefaultLayout) }
      : {}),
    ...(params.has('withServerHead') ? { serverHead: true } : {}),
    ...(params.has('withServerHeadCallback')
      ? { serverHead: (currentPage: Page) => currentPage.props['head'] as string[] }
      : {}),
    ...(params.has('withServerHeadProp') ? { serverHead: 'metaTags' } : {}),
    ...(params.has('withTitleCallback')
      ? {
          title: (pageTitle: string, currentPage: Page) =>
            [pageTitle, currentPage.props['titleSuffix']].filter(Boolean).join(' | '),
        }
      : {}),
    ...(params.get('popover') === 'false' ? { progress: { popover: false } } : {}),
    ...(params.has('nonce') ? { nonce: params.get('nonce') === 'default' ? 'test-default-nonce' : 'test-nonce' } : {}),
  })
}

function getHttpConfig(params: URLSearchParams): HttpClient | HttpClientOptions | undefined {
  const customXsrf = params.get('customXsrf')
  if (customXsrf) return { xsrfCookieName: customXsrf, xsrfHeaderName: `X-${customXsrf}` }
  return window.inertiaHttpClient === 'axios' ? axiosAdapter() : undefined
}
