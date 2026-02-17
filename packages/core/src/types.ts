import { NamedInputEvent, ValidationConfig, Validator } from 'laravel-precognition'
import type { HttpCancelledError, HttpNetworkError, HttpResponseError } from './httpErrors'
import { Response } from './response'

export type HttpRequestHeaders = Record<string, unknown>

export type HttpResponseHeaders = Record<string, string>

export interface HttpProgressEvent {
  progress: number | undefined
  loaded: number
  total: number | undefined
  percentage?: number
}

export interface HttpRequestConfig {
  method: Method
  url: string
  data?: unknown
  params?: Record<string, unknown>
  headers?: HttpRequestHeaders
  signal?: AbortSignal
  onUploadProgress?: (event: HttpProgressEvent) => void
}

export interface HttpResponse {
  status: number
  data: string
  headers: HttpResponseHeaders
}

export interface HttpClient {
  request(config: HttpRequestConfig): Promise<HttpResponse>
}

export interface HttpClientOptions {
  xsrfCookieName?: string
  xsrfHeaderName?: string
}

export type HttpRequestHandler = (config: HttpRequestConfig) => HttpRequestConfig | Promise<HttpRequestConfig>

export type HttpResponseHandler = (response: HttpResponse) => HttpResponse | Promise<HttpResponse>

export type HttpErrorHandler = (
  error: HttpResponseError | HttpNetworkError | HttpCancelledError,
) => void | Promise<void>

export interface PageFlashData {
  [key: string]: unknown
}

export type DefaultInertiaConfig = {
  errorValueType: string
  flashDataType: PageFlashData
  sharedPageProps: PageProps
}
/**
 * Designed to allow overriding of some core types using TypeScript
 * interface declaration merging.
 *
 * @see {@link DefaultInertiaConfig} for keys to override
 * @example
 * ```ts
 * declare module '@inertiajs/core' {
 *   export interface InertiaConfig {
 *     errorValueType: string[]
 *     flashDataType: {
 *       toast?: { type: 'success' | 'error', message: string }
 *     }
 *     sharedPageProps: {
 *       auth: { user: User | null }
 *     }
 *   }
 * }
 * ```
 */
export interface InertiaConfig {}
export type InertiaConfigFor<Key extends keyof DefaultInertiaConfig> = Key extends keyof InertiaConfig
  ? InertiaConfig[Key]
  : DefaultInertiaConfig[Key]
export type ErrorValue = InertiaConfigFor<'errorValueType'>
export type FlashData = InertiaConfigFor<'flashDataType'>
export type SharedPageProps = InertiaConfigFor<'sharedPageProps'>

export type Errors = Record<string, ErrorValue>
export type ErrorBag = Record<string, Errors>

export type FormDataConvertibleValue = Blob | FormDataEntryValue | Date | boolean | number | null | undefined
export type FormDataConvertible =
  | Array<FormDataConvertible>
  | { [key: string]: FormDataConvertible }
  | FormDataConvertibleValue

export type FormDataType<T extends object> = {
  [K in keyof T]: T[K] extends infer U
    ? U extends FormDataConvertibleValue
      ? U
      : U extends (...args: unknown[]) => unknown
        ? never
        : U extends object | Array<unknown>
          ? FormDataType<U>
          : never
    : never
}

/**
 * Uses `0 extends 1 & T` to detect `any` type and prevent infinite recursion.
 */
export type FormDataKeys<T> = T extends Function | FormDataConvertibleValue
  ? never
  : T extends unknown[]
    ? ArrayFormDataKeys<T>
    : T extends object
      ? ObjectFormDataKeys<T>
      : never

/**
 * Helper type for array form data keys
 */
type ArrayFormDataKeys<T extends unknown[]> = number extends T['length']
  ? // Dynamic array
      | `${number}`
      | (0 extends 1 & T[number]
          ? never
          : T[number] extends FormDataConvertibleValue
            ? never
            : `${number}.${FormDataKeys<T[number]>}`)
  : // Tuple with known length
      | Extract<keyof T, `${number}`>
      | {
          [Key in Extract<keyof T, `${number}`>]: 0 extends 1 & T[Key]
            ? never
            : T[Key] extends FormDataConvertibleValue
              ? never
              : `${Key & string}.${FormDataKeys<T[Key & string] & string>}`
        }[Extract<keyof T, `${number}`>]

/**
 * Helper type for object form data keys
 */
type ObjectFormDataKeys<T extends object> = string extends keyof T
  ? string
  :
      | Extract<keyof T, string>
      | {
          [Key in Extract<keyof T, string>]: 0 extends 1 & T[Key]
            ? never
            : T[Key] extends FormDataConvertibleValue
              ? never
              : T[Key] extends any[]
                ? `${Key}.${FormDataKeys<T[Key]> & string}`
                : T[Key] extends Record<string, any>
                  ? `${Key}.${FormDataKeys<T[Key]> & string}`
                  : Exclude<T[Key], null | undefined> extends any[]
                    ? never
                    : Exclude<T[Key], null | undefined> extends Record<string, any>
                      ? `${Key}.${FormDataKeys<Exclude<T[Key], null | undefined>> & string}`
                      : never
        }[Extract<keyof T, string>]

type PartialFormDataErrors<T> = {
  [K in string extends keyof T ? string : Extract<keyof FormDataError<T>, string>]?: ErrorValue
}

export type FormDataErrors<T> = PartialFormDataErrors<T> & {
  [K in keyof PartialFormDataErrors<T>]: NonNullable<PartialFormDataErrors<T>[K]>
}

export type FormDataValues<T, K extends FormDataKeys<T>> = K extends `${infer P}.${infer Rest}`
  ? T extends unknown[]
    ? P extends `${infer I extends number}`
      ? Rest extends FormDataKeys<T[I]>
        ? FormDataValues<T[I], Rest>
        : never
      : never
    : P extends keyof T
      ? Rest extends FormDataKeys<T[P]>
        ? FormDataValues<T[P], Rest>
        : never
      : never
  : K extends keyof T
    ? T[K]
    : T extends unknown[]
      ? T[K & number]
      : never

export type FormDataError<T> = Partial<Record<FormDataKeys<T>, ErrorValue>>

export type Method = 'get' | 'post' | 'put' | 'patch' | 'delete'

export type RequestPayload = Record<string, FormDataConvertible> | FormData

export interface PageProps {
  [key: string]: unknown
}

export type ScrollProp = {
  pageName: string
  previousPage: number | string | null
  nextPage: number | string | null
  currentPage: number | string | null
  reset: boolean
}

export interface Page<SharedProps extends PageProps = PageProps> {
  component: string
  props: PageProps &
    SharedProps & {
      errors: Errors & ErrorBag
      deferred?: Record<string, VisitOptions['only']>
    }
  url: string
  version: string | null
  clearHistory: boolean
  encryptHistory: boolean
  deferredProps?: Record<string, NonNullable<VisitOptions['only']>>
  initialDeferredProps?: Record<string, NonNullable<VisitOptions['only']>>
  mergeProps?: string[]
  prependProps?: string[]
  deepMergeProps?: string[]
  matchPropsOn?: string[]
  scrollProps?: Record<keyof PageProps, ScrollProp>
  flash: FlashData
  onceProps?: Record<
    string,
    {
      prop: keyof PageProps
      expiresAt?: number | null
    }
  >

  /** @internal */
  rememberedState: Record<string, unknown>
}

export type ScrollRegion = {
  top: number
  left: number
}

export interface ClientSideVisitOptions<TProps = Page['props']> {
  component?: Page['component']
  url?: Page['url']
  props?: ((props: TProps, onceProps: Partial<TProps>) => PageProps) | PageProps
  flash?: ((flash: FlashData) => PageFlashData) | PageFlashData
  clearHistory?: Page['clearHistory']
  encryptHistory?: Page['encryptHistory']
  preserveScroll?: VisitOptions['preserveScroll']
  preserveState?: VisitOptions['preserveState']
  errorBag?: string | null
  viewTransition?: VisitOptions['viewTransition']
  onError?: (errors: Errors) => void
  onFinish?: (visit: ClientSideVisitOptions<TProps>) => void
  onFlash?: (flash: FlashData) => void
  onSuccess?: (page: Page) => void
}

export type PageResolver = (name: string, page?: Page) => Component

export type PageHandler<ComponentType = Component> = ({
  component,
  page,
  preserveState,
}: {
  component: ComponentType
  page: Page
  preserveState: boolean
}) => Promise<unknown>

export type PreserveStateOption = boolean | 'errors' | ((page: Page) => boolean)

export type QueryStringArrayFormatOption = 'indices' | 'brackets'

export type Progress = HttpProgressEvent

export type LocationVisit = {
  preserveScroll: boolean
}

export type CancelToken = {
  cancel: VoidFunction
}

export type CancelTokenCallback = (cancelToken: CancelToken) => void

export type OptimisticCallback<TProps = Page['props']> = (props: TProps) => Partial<TProps> | void

export type Visit<T extends RequestPayload = RequestPayload> = {
  method: Method
  data: T
  replace: boolean
  preserveScroll: PreserveStateOption
  preserveState: PreserveStateOption
  only: Array<string>
  except: Array<string>
  headers: Record<string, string>
  errorBag: string | null
  forceFormData: boolean
  queryStringArrayFormat: QueryStringArrayFormatOption
  async: boolean
  showProgress: boolean
  prefetch: boolean
  fresh: boolean
  reset: string[]
  preserveUrl: boolean
  preserveErrors: boolean
  invalidateCacheTags: string | string[]
  viewTransition: boolean | ((viewTransition: ViewTransition) => void)
  optimistic?: OptimisticCallback
  component: string | null
  pageProps: Record<string, unknown> | ((currentProps: PageProps) => Record<string, unknown>)
}

export type GlobalEventsMap<T extends RequestPayload = RequestPayload> = {
  before: {
    parameters: [PendingVisit<T>]
    details: {
      visit: PendingVisit<T>
    }
    result: boolean | void
  }
  start: {
    parameters: [PendingVisit<T>]
    details: {
      visit: PendingVisit<T>
    }
    result: void
  }
  progress: {
    parameters: [Progress | undefined]
    details: {
      progress: Progress | undefined
    }
    result: void
  }
  finish: {
    parameters: [ActiveVisit<T>]
    details: {
      visit: ActiveVisit<T>
    }
    result: void
  }
  cancel: {
    parameters: []
    details: {}
    result: void
  }
  beforeUpdate: {
    parameters: [Page]
    details: {
      page: Page
    }
    result: void
  }
  navigate: {
    parameters: [Page]
    details: {
      page: Page
    }
    result: void
  }
  success: {
    parameters: [Page]
    details: {
      page: Page
    }
    result: void
  }
  error: {
    parameters: [Errors]
    details: {
      errors: Errors
    }
    result: void
  }
  httpException: {
    parameters: [HttpResponse]
    details: {
      response: HttpResponse
    }
    result: boolean | void
  }
  networkError: {
    parameters: [Error]
    details: {
      exception: Error
    }
    result: boolean | void
  }
  prefetched: {
    parameters: [HttpResponse, ActiveVisit<T>]
    details: {
      response: HttpResponse
      fetchedAt: number
      visit: ActiveVisit<T>
    }
    result: void
  }
  prefetching: {
    parameters: [ActiveVisit<T>]
    details: {
      visit: ActiveVisit<T>
    }
    result: void
  }
  flash: {
    parameters: [Page['flash']]
    details: {
      flash: Page['flash']
    }
    result: void
  }
}

export type PageEvent = 'newComponent' | 'firstLoad'

export type GlobalEventNames<T extends RequestPayload = RequestPayload> = keyof GlobalEventsMap<T>

export type GlobalEvent<
  TEventName extends GlobalEventNames<T>,
  T extends RequestPayload = RequestPayload,
> = CustomEvent<GlobalEventDetails<TEventName, T>>

export type GlobalEventParameters<
  TEventName extends GlobalEventNames<T>,
  T extends RequestPayload = RequestPayload,
> = GlobalEventsMap<T>[TEventName]['parameters']

export type GlobalEventResult<
  TEventName extends GlobalEventNames<T>,
  T extends RequestPayload = RequestPayload,
> = GlobalEventsMap<T>[TEventName]['result']

export type GlobalEventDetails<
  TEventName extends GlobalEventNames<T>,
  T extends RequestPayload = RequestPayload,
> = GlobalEventsMap<T>[TEventName]['details']

export type GlobalEventTrigger<TEventName extends GlobalEventNames<T>, T extends RequestPayload = RequestPayload> = (
  ...params: GlobalEventParameters<TEventName, T>
) => GlobalEventResult<TEventName, T>

export type GlobalEventCallback<TEventName extends GlobalEventNames<T>, T extends RequestPayload = RequestPayload> = (
  ...params: GlobalEventParameters<TEventName, T>
) => GlobalEventResult<TEventName, T>

export type InternalEvent = 'missingHistoryItem' | 'loadDeferredProps' | 'historyQuotaExceeded'

export type VisitCallbacks<T extends RequestPayload = RequestPayload> = {
  onCancelToken: CancelTokenCallback
  onBefore: GlobalEventCallback<'before', T>
  onBeforeUpdate: GlobalEventCallback<'beforeUpdate', T>
  onStart: GlobalEventCallback<'start', T>
  onProgress: GlobalEventCallback<'progress', T>
  onFinish: GlobalEventCallback<'finish', T>
  onCancel: GlobalEventCallback<'cancel', T>
  onSuccess: GlobalEventCallback<'success', T>
  onError: GlobalEventCallback<'error', T>
  onHttpException: GlobalEventCallback<'httpException', T>
  onNetworkError: GlobalEventCallback<'networkError', T>
  onFlash: GlobalEventCallback<'flash', T>
  onPrefetched: GlobalEventCallback<'prefetched', T>
  onPrefetching: GlobalEventCallback<'prefetching', T>
}

export type VisitOptions<T extends RequestPayload = RequestPayload> = Partial<Visit<T> & VisitCallbacks<T>>

export type ReloadOptions<T extends RequestPayload = RequestPayload> = Omit<
  VisitOptions<T>,
  'preserveScroll' | 'preserveState'
>

export type PollOptions = {
  keepAlive?: boolean
  autoStart?: boolean
}

export type VisitHelperOptions<T extends RequestPayload = RequestPayload> = Omit<VisitOptions<T>, 'method' | 'data'>

export type RouterInitParams<ComponentType = Component> = {
  initialPage: Page
  resolveComponent: PageResolver
  swapComponent: PageHandler<ComponentType>
  onFlash?: (flash: Page['flash']) => void
}

export type PendingVisitOptions = {
  url: URL
  completed: boolean
  cancelled: boolean
  interrupted: boolean
}

export type PendingVisit<T extends RequestPayload = RequestPayload> = Visit<T> & PendingVisitOptions

export type ActiveVisit<T extends RequestPayload = RequestPayload> = PendingVisit<T> &
  Required<Omit<VisitOptions<T>, 'optimistic'>>

export type InternalActiveVisit = ActiveVisit & {
  onPrefetchResponse?: (response: Response) => void
  onPrefetchError?: (error: Error) => void
  deferredProps?: boolean
}

export type VisitId = unknown
export type Component = unknown

type FirstLevelOptional<T> = {
  [K in keyof T]?: T[K] extends object ? { [P in keyof T[K]]?: T[K][P] } : T[K]
}

type PagesOption =
  | string
  | {
      path: string
      extension?: string | string[]
      transform?: (name: string) => string
    }

type ProgressOptions = {
  delay?: number
  color?: string
  includeCSS?: boolean
  showSpinner?: boolean
}

interface BaseCreateInertiaAppOptions<TComponentResolver, TSetupOptions, TSetupReturn, TAdditionalInertiaAppConfig> {
  resolve: TComponentResolver
  pages?: PagesOption
  layout?: (name: string, page: Page) => unknown
  setup: (options: TSetupOptions) => TSetupReturn
  title?: HeadManagerTitleCallback
  defaults?: FirstLevelOptional<InertiaAppConfig & TAdditionalInertiaAppConfig>
  /** HTTP client or options to use for requests. Defaults to XhrHttpClient. */
  http?: HttpClient | HttpClientOptions
}

export interface CreateInertiaAppOptionsForCSR<
  SharedProps extends PageProps,
  TComponentResolver,
  TSetupOptions,
  TSetupReturn,
  TAdditionalInertiaAppConfig,
> extends BaseCreateInertiaAppOptions<TComponentResolver, TSetupOptions, TSetupReturn, TAdditionalInertiaAppConfig> {
  id?: string
  page?: Page<SharedProps>
  progress?: ProgressOptions | false
  render?: undefined
}

export interface CreateInertiaAppOptionsForSSR<
  SharedProps extends PageProps,
  TComponentResolver,
  TSetupOptions,
  TSetupReturn,
  TAdditionalInertiaAppConfig,
> extends BaseCreateInertiaAppOptions<TComponentResolver, TSetupOptions, TSetupReturn, TAdditionalInertiaAppConfig> {
  id?: undefined
  page: Page<SharedProps>
  progress?: undefined
  render: unknown
}

export type InertiaAppSSRResponse = { head: string[]; body: string }
export type InertiaAppResponse = Promise<InertiaAppSSRResponse | void>

export type HeadManagerTitleCallback = (title: string) => string

export interface CreateInertiaAppOptions<TComponentResolver, TSetupOptions, TSetupReturn, TAdditionalInertiaAppConfig> {
  id?: string
  resolve?: TComponentResolver
  pages?: PagesOption
  layout?: (name: string, page: Page) => unknown
  setup?: (options: TSetupOptions) => TSetupReturn
  title?: HeadManagerTitleCallback
  progress?: ProgressOptions | false
  defaults?: FirstLevelOptional<InertiaAppConfig & TAdditionalInertiaAppConfig>
  /** HTTP client or options to use for requests. Defaults to XhrHttpClient. */
  http?: HttpClient | HttpClientOptions
}
export type HeadManagerOnUpdateCallback = (elements: string[]) => void
export type HeadManager = {
  forceUpdate: () => void
  createProvider: () => {
    reconnect: () => void
    update: HeadManagerOnUpdateCallback
    disconnect: () => void
  }
}

export type LinkPrefetchOption = 'mount' | 'hover' | 'click'

export type TimeUnit = 'ms' | 's' | 'm' | 'h' | 'd'
export type CacheForOption = number | `${number}${TimeUnit}` | string

export type PrefetchOptions = {
  cacheFor: CacheForOption | CacheForOption[]
  cacheTags: string | string[]
}

export type InertiaAppConfig = {
  form: {
    recentlySuccessfulDuration: number
    forceIndicesArrayFormatInFormData: boolean
    withAllErrors: boolean
  }
  prefetch: {
    cacheFor: CacheForOption | CacheForOption[]
    hoverDelay: number
  }
  visitOptions?: (href: string, options: VisitOptions) => VisitOptions
}

export interface LinkComponentBaseProps extends Partial<
  Pick<
    Visit<RequestPayload>,
    | 'component'
    | 'data'
    | 'method'
    | 'replace'
    | 'preserveScroll'
    | 'preserveState'
    | 'preserveUrl'
    | 'only'
    | 'except'
    | 'headers'
    | 'queryStringArrayFormat'
    | 'async'
    | 'viewTransition'
  > &
    VisitCallbacks & {
      href: string | UrlMethodPair
      clientSide: boolean
      pageProps: Record<string, unknown> | ((currentProps: PageProps) => Record<string, unknown>)
      prefetch: boolean | LinkPrefetchOption | LinkPrefetchOption[]
      cacheFor: CacheForOption | CacheForOption[]
      cacheTags: string | string[]
    }
> {}

type PrefetchObject = {
  params: ActiveVisit
  response: Promise<Response>
}

export type InFlightPrefetch = PrefetchObject & {
  staleTimestamp: null
  inFlight: true
}

export type PrefetchCancellationToken = {
  isCancelled: boolean
  cancel: () => void
}

export type PrefetchedResponse = PrefetchObject & {
  staleTimestamp: number
  timestamp: number
  expiresAt: number
  singleUse: boolean
  inFlight: false
  tags: string[]
}

export type PrefetchRemovalTimer = {
  params: ActiveVisit
  timer: number
}

export type ProgressSettings = {
  minimum: number
  easing: string
  positionUsing: 'translate3d' | 'translate' | 'margin'
  speed: number
  trickle: boolean
  trickleSpeed: number
  showSpinner: boolean
  barSelector: string
  spinnerSelector: string
  parent: string
  template: string
  includeCSS: boolean
  color: string
}

export type UrlMethodPair = { url: string; method: Method; component?: string }

export type UseFormTransformCallback<TForm> = (data: TForm) => object
export type UseFormWithPrecognitionArguments =
  | [Method | (() => Method), string | (() => string)]
  | [UrlMethodPair | (() => UrlMethodPair)]

type UseFormInertiaArguments<TForm> =
  | []
  | [data: TForm | (() => TForm)]
  | [rememberKey: string, data: TForm | (() => TForm)]
type UseFormPrecognitionArguments<TForm> =
  | [urlMethodPair: UrlMethodPair | (() => UrlMethodPair), data: TForm | (() => TForm)]
  | [method: Method | (() => Method), url: string | (() => string), data: TForm | (() => TForm)]
export type UseFormArguments<TForm> = UseFormInertiaArguments<TForm> | UseFormPrecognitionArguments<TForm>

export type UseFormSubmitOptions = Omit<VisitOptions, 'data'>
export type UseFormSubmitArguments =
  | [Method, string, UseFormSubmitOptions?]
  | [UrlMethodPair, UseFormSubmitOptions?]
  | [UseFormSubmitOptions?]

export type UseHttpSubmitArguments<TResponse = unknown, TForm = unknown> =
  | [Method, string, UseHttpSubmitOptions<TResponse, TForm>?]
  | [UrlMethodPair, UseHttpSubmitOptions<TResponse, TForm>?]
  | [UseHttpSubmitOptions<TResponse, TForm>?]

export type FormComponentOptions = Pick<
  VisitOptions,
  'preserveScroll' | 'preserveState' | 'preserveUrl' | 'replace' | 'only' | 'except' | 'reset' | 'viewTransition'
>

export type FormComponentOptimisticCallback<TProps = Page['props']> = (
  props: TProps,
  formData: Record<string, FormDataConvertible>,
) => Partial<TProps> | void

export type FormComponentProps = Partial<
  Pick<Visit, 'headers' | 'queryStringArrayFormat' | 'errorBag' | 'showProgress' | 'invalidateCacheTags'> &
    Omit<VisitCallbacks, 'onPrefetched' | 'onPrefetching'>
> & {
  method?: Method | Uppercase<Method>
  action?: string | UrlMethodPair
  component?: string
  clientSide?: boolean
  transform?: (data: Record<string, FormDataConvertible>) => Record<string, FormDataConvertible>
  optimistic?: FormComponentOptimisticCallback
  options?: FormComponentOptions
  onSubmitComplete?: (props: FormComponentonSubmitCompleteArguments) => void
  disableWhileProcessing?: boolean
  resetOnSuccess?: boolean | string[]
  resetOnError?: boolean | string[]
  setDefaultsOnSuccess?: boolean
  validateFiles?: boolean
  validationTimeout?: number
  withAllErrors?: boolean | null
}

export type FormComponentMethods<TForm extends object = Record<string, any>> = {
  clearErrors: <K extends FormDataKeys<TForm>>(...fields: K[]) => void
  resetAndClearErrors: <K extends FormDataKeys<TForm>>(...fields: K[]) => void
  setError: {
    <K extends FormDataKeys<TForm>>(field: K, value: ErrorValue): void
    (errors: FormDataErrors<TForm>): void
  }
  reset: <K extends FormDataKeys<TForm>>(...fields: K[]) => void
  submit: () => void
  defaults: () => void
  getData: () => TForm
  getFormData: () => FormData
  valid: <K extends FormDataKeys<TForm>>(field: K) => boolean
  invalid: <K extends FormDataKeys<TForm>>(field: K) => boolean
  validate: <K extends FormDataKeys<TForm>>(
    field?: K | NamedInputEvent | ValidationConfig,
    config?: ValidationConfig,
  ) => void
  touch: <K extends FormDataKeys<TForm>>(...fields: K[]) => void
  touched: <K extends FormDataKeys<TForm>>(field?: K) => boolean
  validator: () => Validator
}

export type FormComponentonSubmitCompleteArguments<TForm extends object = Record<string, any>> = Pick<
  FormComponentMethods<TForm>,
  'reset' | 'defaults'
>

export type FormComponentState<TForm extends object = Record<string, any>> = {
  errors: FormDataErrors<TForm>
  hasErrors: boolean
  processing: boolean
  progress: Progress | null
  wasSuccessful: boolean
  recentlySuccessful: boolean
  isDirty: boolean
  validating: boolean
}

export type FormComponentSlotProps<TForm extends object = Record<string, any>> = FormComponentMethods<TForm> &
  FormComponentState<TForm>

export type FormComponentRef<TForm extends object = Record<string, any>> = FormComponentSlotProps<TForm>

export interface UseInfiniteScrollOptions {
  // Core data
  getPropName: () => string
  inReverseMode: () => boolean
  shouldFetchNext: () => boolean
  shouldFetchPrevious: () => boolean
  shouldPreserveUrl: () => boolean
  getReloadOptions?: () => ReloadOptions

  // Elements
  getTriggerMargin: () => number
  getStartElement: () => HTMLElement
  getEndElement: () => HTMLElement
  getItemsElement: () => HTMLElement
  getScrollableParent: () => HTMLElement | null

  // Callbacks
  onBeforePreviousRequest: () => void
  onBeforeNextRequest: () => void
  onCompletePreviousRequest: () => void
  onCompleteNextRequest: () => void
  onDataReset?: () => void
}

export interface UseInfiniteScrollDataManager {
  getLastLoadedPage: () => number | string | null
  getPageName: () => string
  getRequestCount: () => number
  hasPrevious: () => boolean
  hasNext: () => boolean
  fetchNext: (reloadOptions?: ReloadOptions) => void
  fetchPrevious: (reloadOptions?: ReloadOptions) => void
  removeEventListener: () => void
}

export interface UseInfiniteScrollElementManager {
  setupObservers: () => void
  enableTriggers: () => void
  disableTriggers: () => void
  refreshTriggers: () => void
  flushAll: () => void
  processManuallyAddedElements: () => void
  processServerLoadedElements: (loadedPage: string | number | null) => void
}

export interface UseInfiniteScrollProps {
  dataManager: UseInfiniteScrollDataManager
  elementManager: UseInfiniteScrollElementManager
  flush: () => void
}

export interface InfiniteScrollSlotProps {
  loading: boolean
  loadingPrevious: boolean
  loadingNext: boolean
}

export interface InfiniteScrollActionSlotProps {
  loading: boolean
  loadingPrevious: boolean
  loadingNext: boolean
  fetch: () => void
  autoMode: boolean
  manualMode: boolean
  hasMore: boolean
  hasPrevious: boolean
  hasNext: boolean
}

export interface InfiniteScrollRef {
  fetchNext: (reloadOptions?: ReloadOptions) => void
  fetchPrevious: (reloadOptions?: ReloadOptions) => void
  hasPrevious: () => boolean
  hasNext: () => boolean
}

export interface InfiniteScrollComponentBaseProps {
  data: string
  buffer?: number
  as?: string
  manual?: boolean
  manualAfter?: number
  preserveUrl?: boolean
  reverse?: boolean
  autoScroll?: boolean
  onlyNext?: boolean
  onlyPrevious?: boolean
}

export type UseHttpOptions<TResponse = unknown> = {
  onBefore?: () => boolean | void
  onStart?: () => void
  onProgress?: (progress: HttpProgressEvent) => void
  onSuccess?: (response: TResponse) => void
  onError?: (errors: Errors) => void
  onFinish?: () => void
  onCancel?: () => void
  onCancelToken?: (cancelToken: CancelToken) => void
}

export type UseHttpSubmitOptions<TResponse = unknown, TForm = unknown> = UseHttpOptions<TResponse> & {
  headers?: HttpRequestHeaders
  optimistic?: (currentData: TForm) => Partial<TForm>
}

declare global {
  interface DocumentEventMap {
    'inertia:before': GlobalEvent<'before'>
    'inertia:start': GlobalEvent<'start'>
    'inertia:progress': GlobalEvent<'progress'>
    'inertia:success': GlobalEvent<'success'>
    'inertia:error': GlobalEvent<'error'>
    'inertia:httpException': GlobalEvent<'httpException'>
    'inertia:networkError': GlobalEvent<'networkError'>
    'inertia:finish': GlobalEvent<'finish'>
    'inertia:beforeUpdate': GlobalEvent<'beforeUpdate'>
    'inertia:navigate': GlobalEvent<'navigate'>
    'inertia:flash': GlobalEvent<'flash'>
  }
}
