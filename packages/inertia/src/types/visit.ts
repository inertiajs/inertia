import { Errors, Method, Page } from '.'
import { CancelTokenSource } from 'axios'

export type PreserveStateOption = boolean|string|((page: Page) => boolean)

export type LocationVisit = {
  preserveScroll: boolean,
}

export interface Visit {
  url: URL,
  method: Method,
  data: Record<string, unknown>|FormData,
  replace: boolean,
  preserveScroll: PreserveStateOption,
  preserveState: PreserveStateOption,
  only: Array<string>,
  headers: Record<string, string>
  errorBag: string|null,
  forceFormData: boolean,

  completed: boolean,
  cancelled: boolean,
  interrupted: boolean,
}

export interface LocalEventCallbacks {
  onCancelToken?: { ({ cancel }: { cancel: VoidFunction }): void },
  onBefore: (visit: Visit) => boolean|void,
  onStart: (visit: Visit) => void,
  onProgress: (progress: { percentage: number }|void) => void,
  onFinish: (visit: Visit) => void,
  onCancel: () => void,
  onBeforeRender?: (page: Page) => void,
  onSuccess?: (page: Page) => void,
  onError?: (errors: Errors) => void,
}

export type VisitOptions = Visit & LocalEventCallbacks

export interface ActiveVisit extends VisitOptions {
  cancelToken: CancelTokenSource,
}

export type VisitId = unknown
