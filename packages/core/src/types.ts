import { AxiosProgressEvent, AxiosResponse } from 'axios'
import { Response } from './response'

declare module 'axios' {
  export interface AxiosProgressEvent {
    percentage: number | undefined
  }
}

export type DefaultInertiaConfig = {
  errorValueType: string
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
 *   }
 * }
 * ```
 */
export interface InertiaConfig {}
export type InertiaConfigFor<Key extends keyof DefaultInertiaConfig> = Key extends keyof InertiaConfig
  ? InertiaConfig[Key]
  : DefaultInertiaConfig[Key]
export type ErrorValue = InertiaConfigFor<'errorValueType'>

export type Errors = Record<string, ErrorValue>
export type ErrorBag = Record<string, Errors>

export type FormDataConvertibleValue = Blob | FormDataEntryValue | Date | boolean | number | null | undefined
export type FormDataConvertible =
  | Array<FormDataConvertible>
  | { [key: string]: FormDataConvertible }
  | FormDataConvertibleValue

export type FormDataType<T extends object> = {
  [K in keyof T]: T[K] extends FormDataConvertibleValue
    ? T[K]
    : T[K] extends (...args: unknown[]) => unknown
      ? never
      : T[K] extends object | Array<unknown>
        ? FormDataType<T[K]>
        : never
}

export type FormDataKeys<T> = T extends Function | FormDataConvertibleValue
  ? never
  : T extends Array<unknown>
    ? number extends T['length']
      ? `${number}` | `${number}.${FormDataKeys<T[number]>}`
      :
          | Extract<keyof T, `${number}`>
          | {
              [Key in Extract<keyof T, `${number}`>]: `${Key & string}.${FormDataKeys<T[Key & string]> & string}`
            }[Extract<keyof T, `${number}`>]
    : string extends keyof T
        ? string
        : | Extract<keyof T, string>
          | {
              [Key in Extract<keyof T, string>]: `${Key}.${FormDataKeys<T[Key]> & string}`
            }[Extract<keyof T, string>]

export type FormDataKeyOrString<T> = FormDataKeys<T> | string

export type FormErrorsFor<T> = {
  [K in string extends keyof T ? string : Extract<keyof FormDataError<T>, string>]?: ErrorValue
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
  deferredProps?: Record<string, VisitOptions['only']>
  mergeProps?: string[]
  deepMergeProps?: string[]
  matchPropsOn?: string[]

  /** @internal */
  rememberedState: Record<string, unknown>
}

export type ScrollRegion = {
  top: number
  left: number
}

export interface ClientSideVisitOptions {
  component?: Page['component']
  url?: Page['url']
  props?: ((props: Page['props']) => PageProps) | PageProps
  clearHistory?: Page['clearHistory']
  encryptHistory?: Page['encryptHistory']
  preserveScroll?: VisitOptions['preserveScroll']
  preserveState?: VisitOptions['preserveState']
  errorBag?: string | null
  onError?: (errors: Errors) => void
  onFinish?: (visit: ClientSideVisitOptions) => void
  onSuccess?: (page: Page) => void
}

export type PageResolver = (name: string) => Component

export type PageHandler = ({
  component,
  page,
  preserveState,
}: {
  component: Component
  page: Page
  preserveState: PreserveStateOption
}) => Promise<unknown>

export type PreserveStateOption = boolean | 'errors' | ((page: Page) => boolean)

export type Progress = AxiosProgressEvent

export type LocationVisit = {
  preserveScroll: boolean
}

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
  queryStringArrayFormat: 'indices' | 'brackets'
  async: boolean
  showProgress: boolean
  prefetch: boolean
  fresh: boolean
  reset: string[]
  preserveUrl: boolean
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
  invalid: {
    parameters: [AxiosResponse]
    details: {
      response: AxiosResponse
    }
    result: boolean | void
  }
  exception: {
    parameters: [Error]
    details: {
      exception: Error
    }
    result: boolean | void
  }
  prefetched: {
    parameters: [AxiosResponse, ActiveVisit<T>]
    details: {
      response: AxiosResponse
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
}

export type PageEvent = 'newComponent' | 'firstLoad'

export type GlobalEventNames<T extends RequestPayload = RequestPayload> = keyof GlobalEventsMap<T>

export type GlobalEvent<TEventName extends GlobalEventNames<T>, T extends RequestPayload = RequestPayload> = CustomEvent<GlobalEventDetails<TEventName, T>>

export type GlobalEventParameters<TEventName extends GlobalEventNames<T>, T extends RequestPayload = RequestPayload> = GlobalEventsMap<T>[TEventName]['parameters']

export type GlobalEventResult<TEventName extends GlobalEventNames<T>, T extends RequestPayload = RequestPayload> = GlobalEventsMap<T>[TEventName]['result']

export type GlobalEventDetails<TEventName extends GlobalEventNames<T>, T extends RequestPayload = RequestPayload> = GlobalEventsMap<T>[TEventName]['details']

export type GlobalEventTrigger<TEventName extends GlobalEventNames<T>, T extends RequestPayload = RequestPayload> = (
  ...params: GlobalEventParameters<TEventName, T>
) => GlobalEventResult<TEventName, T>

export type GlobalEventCallback<TEventName extends GlobalEventNames<T>, T extends RequestPayload = RequestPayload> = (
  ...params: GlobalEventParameters<TEventName, T>
) => GlobalEventResult<TEventName, T>

export type InternalEvent = 'missingHistoryItem' | 'loadDeferredProps'

export type VisitCallbacks<T extends RequestPayload = RequestPayload> = {
  onCancelToken: { ({ cancel }: { cancel: VoidFunction }): void }
  onBefore: GlobalEventCallback<'before', T>
  onStart: GlobalEventCallback<'start', T>
  onProgress: GlobalEventCallback<'progress', T>
  onFinish: GlobalEventCallback<'finish', T>
  onCancel: GlobalEventCallback<'cancel', T>
  onSuccess: GlobalEventCallback<'success', T>
  onError: GlobalEventCallback<'error', T>
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

export type RouterInitParams = {
  initialPage: Page
  resolveComponent: PageResolver
  swapComponent: PageHandler
}

export type PendingVisitOptions = {
  url: URL
  completed: boolean
  cancelled: boolean
  interrupted: boolean
}

export type PendingVisit<T extends RequestPayload = RequestPayload> = Visit<T> & PendingVisitOptions

export type ActiveVisit<T extends RequestPayload = RequestPayload> = PendingVisit<T> & Required<VisitOptions<T>>

export type InternalActiveVisit = ActiveVisit & {
  onPrefetchResponse?: (response: Response) => void
}

export type VisitId = unknown
export type Component = unknown

export type InertiaAppResponse = Promise<{ head: string[]; body: string } | void>

export type LinkPrefetchOption = 'mount' | 'hover' | 'click'

export type CacheForOption = number | string

export type PrefetchOptions = {
  cacheFor: CacheForOption | CacheForOption[]
}

export interface LinkComponentBaseProps
  extends Partial<
    Pick<
      Visit<RequestPayload>,
      | 'data'
      | 'method'
      | 'replace'
      | 'preserveScroll'
      | 'preserveState'
      | 'only'
      | 'except'
      | 'headers'
      | 'queryStringArrayFormat'
      | 'async'
    > &
      Omit<VisitCallbacks, 'onCancelToken'> & {
        href: string | { url: string; method: Method }
        onCancelToken: (cancelToken: import('axios').CancelTokenSource) => void
        prefetch: boolean | LinkPrefetchOption | LinkPrefetchOption[]
        cacheFor: CacheForOption | CacheForOption[]
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
  singleUse: boolean
  inFlight: false
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

declare global {
  interface DocumentEventMap {
    'inertia:before': GlobalEvent<'before'>
    'inertia:start': GlobalEvent<'start'>
    'inertia:progress': GlobalEvent<'progress'>
    'inertia:success': GlobalEvent<'success'>
    'inertia:error': GlobalEvent<'error'>
    'inertia:invalid': GlobalEvent<'invalid'>
    'inertia:exception': GlobalEvent<'exception'>
    'inertia:finish': GlobalEvent<'finish'>
    'inertia:navigate': GlobalEvent<'navigate'>
  }
}
