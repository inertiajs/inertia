import { AxiosProgressEvent, AxiosResponse } from 'axios'
import { Response } from './response'

declare module 'axios' {
  export interface AxiosProgressEvent {
    percentage: number | undefined
  }
}

export type Errors = Record<string, string>
export type ErrorBag = Record<string, Errors>

// View Transition API types
export type ViewTransitionType = string | string[]

export type ViewTransitionOptions = {
  enabled?: boolean
  types?: ViewTransitionType
  updateCallback?: () => void | Promise<void>
  onViewTransitionStart?: (transition: any) => void
  onViewTransitionEnd?: (transition: any) => void
  onViewTransitionError?: (error: Error) => void
}

export type FormDataConvertible =
  | Array<FormDataConvertible>
  | { [key: string]: FormDataConvertible }
  | Blob
  | FormDataEntryValue
  | Date
  | boolean
  | number
  | null
  | undefined

export type FormDataKeys<T extends Record<any, any>> = T extends T
  ? keyof T extends infer Key extends Extract<keyof T, string>
    ? Key extends Key
      ? T[Key] extends Record<any, any>
        ? `${Key}.${FormDataKeys<T[Key]>}` | Key
        : Key
      : never
    : never
  : never

export type FormDataValues<T extends Record<any, any>, K extends FormDataKeys<T>> = K extends `${infer P}.${infer Rest}`
  ? P extends keyof T
    ? Rest extends FormDataKeys<T[P]>
      ? FormDataValues<T[P], Rest>
      : never
    : never
  : K extends keyof T
    ? T[K]
    : never

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
  props?: ((props: Page['props']) => Page['props']) | Page['props']
  clearHistory?: Page['clearHistory']
  encryptHistory?: Page['encryptHistory']
  preserveScroll?: VisitOptions['preserveScroll']
  preserveState?: VisitOptions['preserveState']
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
  viewTransition?: ViewTransitionOptions
}

export type GlobalEventsMap = {
  before: {
    parameters: [PendingVisit]
    details: {
      visit: PendingVisit
    }
    result: boolean | void
  }
  start: {
    parameters: [PendingVisit]
    details: {
      visit: PendingVisit
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
    parameters: [ActiveVisit]
    details: {
      visit: ActiveVisit
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
    parameters: [AxiosResponse, ActiveVisit]
    details: {
      response: AxiosResponse
      fetchedAt: number
      visit: ActiveVisit
    }
    result: void
  }
  prefetching: {
    parameters: [ActiveVisit]
    details: {
      visit: ActiveVisit
    }
    result: void
  }
  'view-transition-start': {
    parameters: [any, ActiveVisit]
    details: {
      transition: any
      visit: ActiveVisit
    }
    result: void
  }
  'view-transition-end': {
    parameters: [any, ActiveVisit]
    details: {
      transition: any
      visit: ActiveVisit
    }
    result: void
  }
}

export type PageEvent = 'newComponent' | 'firstLoad'

export type GlobalEventNames = keyof GlobalEventsMap

export type GlobalEvent<TEventName extends GlobalEventNames> = CustomEvent<GlobalEventDetails<TEventName>>

export type GlobalEventParameters<TEventName extends GlobalEventNames> = GlobalEventsMap[TEventName]['parameters']

export type GlobalEventResult<TEventName extends GlobalEventNames> = GlobalEventsMap[TEventName]['result']

export type GlobalEventDetails<TEventName extends GlobalEventNames> = GlobalEventsMap[TEventName]['details']

export type GlobalEventTrigger<TEventName extends GlobalEventNames> = (
  ...params: GlobalEventParameters<TEventName>
) => GlobalEventResult<TEventName>

export type GlobalEventCallback<TEventName extends GlobalEventNames> = (
  ...params: GlobalEventParameters<TEventName>
) => GlobalEventResult<TEventName>

export type InternalEvent = 'missingHistoryItem' | 'loadDeferredProps'

export type VisitCallbacks = {
  onCancelToken: { ({ cancel }: { cancel: VoidFunction }): void }
  onBefore: GlobalEventCallback<'before'>
  onStart: GlobalEventCallback<'start'>
  onProgress: GlobalEventCallback<'progress'>
  onFinish: GlobalEventCallback<'finish'>
  onCancel: GlobalEventCallback<'cancel'>
  onSuccess: GlobalEventCallback<'success'>
  onError: GlobalEventCallback<'error'>
  onPrefetched: GlobalEventCallback<'prefetched'>
  onPrefetching: GlobalEventCallback<'prefetching'>
}

export type VisitOptions<T extends RequestPayload = RequestPayload> = Partial<Visit<T> & VisitCallbacks>

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

export type PendingVisit = Visit & PendingVisitOptions

export type ActiveVisit = PendingVisit & Required<VisitOptions> & {
  viewTransition: ViewTransitionOptions
}

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
    'inertia:view-transition-start': GlobalEvent<'view-transition-start'>
    'inertia:view-transition-end': GlobalEvent<'view-transition-end'>
  }
}
