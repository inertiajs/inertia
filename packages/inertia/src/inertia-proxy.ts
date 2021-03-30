import { Inertia } from './inertia'
import { ErrorResolver, Method, Page, PageHandler, PageResolver, PropTransformer, RequestPayload, Visit } from './types'

let inertia: Inertia|null = null

export default {
  init({
    initialPage,
    resolveComponent,
    resolveErrors,
    swapComponent,
    transformProps,
  }: {
    initialPage: Page,
    resolveComponent: PageResolver,
    resolveErrors: ErrorResolver,
    swapComponent: PageHandler,
    transformProps: PropTransformer
    }): Inertia {
    inertia = new Inertia({
      initialPage,
      resolveComponent,
      resolveErrors,
      swapComponent: ({ component, page, preserveState}) => {
        this.page = page
        return swapComponent({ component, page, preserveState })
      },
      transformProps,
    })

    return this
  },

  visit(href: URL|string, {
    method = Method.GET,
    data = {},
    replace = false,
    preserveScroll = false,
    preserveState = false,
    only = [],
    headers = {},
    errorBag = '',
    forceFormData = false,
    onCancelToken = () => {},
    onBefore = () => {},
    onStart = () => {},
    onProgress = () => {},
    onFinish = () => {},
    onCancel = () => {},
    onBeforeRender = () => {},
    onSuccess = () => {},
    onError = () => {},
  }: {
    method?: Method,
    data?: RequestPayload,
    replace?: boolean,
    preserveScroll?: boolean,
    preserveState?: boolean
    only?: Array<string>,
    headers?: Record<string, string>,
    errorBag?: string,
    forceFormData?: boolean,
    onCancelToken?: { ({ cancel }: { cancel: VoidFunction }): void },
    onBefore?: (visit: Visit) => boolean|void,
    onStart?: (visit: Visit) => void,
    onProgress?: (event: { percentage: number }|void) => void,
    onFinish?: (visit: Visit) => void,
    onCancel?: () => void,
    onBeforeRender?: (page: Page) => void,
    onSuccess?: (page: Page) => void,
    onError?: (errors: Record<string, unknown>) => void,
  } = {}): void {
    return inertia?.visit(href, {
      method,
      data,
      replace,
      preserveScroll,
      preserveState,
      only,
      headers,
      errorBag,
      forceFormData,
      onCancelToken,
      onBefore,
      onStart,
      onProgress,
      onFinish,
      onCancel,
      onBeforeRender,
      onSuccess,
      onError,
    })
  },

  get(url: URL|string, data: RequestPayload = {}, options : Record<string, unknown> = {}): void {
    return this.visit(url, { ...options, method: Method.GET, data })
  },

  reload(options: Record<string, unknown> = {}): void {
    return this.visit(window.location.href, { ...options, preserveScroll: true, preserveState: true })
  },

  replace(url: URL|string, options: Record<string, unknown> = {}): void {
    console.warn(`Inertia.replace() has been deprecated and will be removed in a future release. Please use Inertia.${options.method ?? 'get'}() instead.`)
    return this.visit(url, { preserveState: true, ...options, replace: true })
  },

  post(url: URL|string, data: RequestPayload = {}, options: Record<string, unknown> = {}): void {
    return this.visit(url, { preserveState: true, ...options, method: Method.POST, data })
  },

  put(url: URL|string, data: RequestPayload = {}, options: Record<string, unknown> = {}): void {
    return this.visit(url, { preserveState: true, ...options, method: Method.PUT, data })
  },

  patch(url: URL|string, data: RequestPayload = {}, options: Record<string, unknown> = {}): void {
    return this.visit(url, { preserveState: true, ...options, method: Method.PATCH, data })
  },

  delete(url: URL|string, options: Record<string, unknown> = {}): void {
    return this.visit(url, { preserveState: true, ...options, method: Method.DELETE })
  },

  remember(data: unknown, key = 'default'): void {
    inertia?.remember(data, key)
  },

  restore(key: 'default'): unknown {
    return inertia?.restore(key)
  },

  on(type: string, callback: CallableFunction): VoidFunction {
    return Inertia.on(type, callback)
  },
}
