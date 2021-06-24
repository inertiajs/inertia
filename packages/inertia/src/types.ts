import { AxiosResponse, CancelTokenSource } from 'axios'

export type Errors = Record<string, string>
export type ErrorBag = Record<string, Errors>

export type FormDataConvertible = Array<FormDataConvertible>|Blob|FormDataEntryValue|Date|boolean|number|null

export enum Method {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  PATCH = 'patch',
  DELETE = 'delete',
}

export type RequestPayload = Record<string, FormDataConvertible>|FormData

export interface PageProps {
  [key: string]: unknown
}

export interface PagePayload<SharedProps = PageProps> {
  component: string,
  props: PageProps & SharedProps & {
    errors: Errors & ErrorBag;
  }
  url: string,
}

export interface DialogPayload extends PagePayload {
  eager?: boolean
}

export interface Page<SharedProps = PageProps> extends PagePayload<SharedProps> {
  type?: string,
  dialog?: DialogPayload,
  context: string,
  version: string|null,

  // Refactor away
  scrollRegions: Array<{ top: number, left: number }>
  rememberedState?: Record<string, unknown>
  resolvedErrors: Errors
}

export type PageResolver = (name: string) => Component

export type PageHandler = ({
  component,
  page,
  preserveState,
  dialogComponent,
}: {
  component: Component,
  page: Page,
  preserveState: PreserveStateOption,
  dialogComponent?: Component|null
}) => Promise<unknown>

export type PreserveStateOption = boolean|string|((page: Page) => boolean)

export type LocationVisit = {
  preserveScroll: boolean,
}

export type Visit = {
  method: Method,
  data: RequestPayload,
  replace: boolean,
  preserveScroll: PreserveStateOption,
  preserveState: PreserveStateOption,
  only: Array<string>,
  headers: Record<string, string>
  errorBag: string|null,
  forceFormData: boolean,
}

export type GlobalEventsMap = {
  before: {
    parameters: [PendingVisit],
    details: {
      visit: PendingVisit,
    },
    result: boolean|void,
  },
  start: {
    parameters: [PendingVisit],
    details: {
      visit: PendingVisit,
    },
    result: void,
  },
  progress: {
    parameters: [{ percentage: number }|undefined],
    details: {
      progress: { percentage: number }|undefined,
    },
    result: void,
  },
  finish: {
    parameters: [ActiveVisit],
    details: {
      visit: ActiveVisit,
    },
    result: void,
  },
  cancel: {
    parameters: [],
    details: {
    },
    result: void,
  },
  navigate: {
    parameters: [Page],
    details: {
        page: Page
    },
    result: void,
  },
  success: {
    parameters: [Page],
    details: {
        page: Page
    },
    result: void,
  },
  error: {
    parameters: [Errors],
    details: {
        errors: Errors
    },
    result: void,
  },
  invalid: {
    parameters: [AxiosResponse],
    details: {
        response: AxiosResponse
    },
    result: boolean,
  },
  exception: {
    parameters: [Error],
    details: {
        exception: Error
    },
    result: boolean,
  },
}

export type GlobalEventNames = keyof GlobalEventsMap

export type GlobalEvent<TEventName extends GlobalEventNames> = CustomEvent<GlobalEventDetails<TEventName>>

export type GlobalEventParameters<TEventName extends GlobalEventNames> = GlobalEventsMap[TEventName]['parameters']

export type GlobalEventResult<TEventName extends GlobalEventNames> = GlobalEventsMap[TEventName]['result']

export type GlobalEventDetails<TEventName extends GlobalEventNames> = GlobalEventsMap[TEventName]['details']

export type GlobalEventTrigger<TEventName extends GlobalEventNames> = (...params: GlobalEventParameters<TEventName>) => GlobalEventResult<TEventName>

export type GlobalEventCallback<TEventName extends GlobalEventNames> = (...params: GlobalEventParameters<TEventName>) => GlobalEventResult<TEventName>

export type VisitOptions = Partial<Visit & {
  onCancelToken: { ({ cancel }: { cancel: VoidFunction }): void },
  onBefore: GlobalEventCallback<'before'>,
  onStart: GlobalEventCallback<'start'>,
  onProgress: GlobalEventCallback<'progress'>,
  onFinish: GlobalEventCallback<'finish'>,
  onCancel: GlobalEventCallback<'cancel'>,
  onSuccess: GlobalEventCallback<'success'>,
  onError: GlobalEventCallback<'error'>,
}>

export type PendingVisit = Visit & {
  url: URL,
  completed: boolean,
  cancelled: boolean,
  interrupted: boolean,
};

export type ActiveVisit = PendingVisit & Required<VisitOptions> & {
  cancelToken: CancelTokenSource,
}

export type VisitId = unknown
export type Component = unknown
