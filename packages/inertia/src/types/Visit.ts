import { CancelTokenSource } from 'axios'
import { Page, HttpMethod } from '.'

export interface Visit {
  onCancel: (token: CancelTokenSource) => void
}

export interface PendingVisit {
  url: URL,
  method: HttpMethod,
  data: Record<string, unknown>|FormData,
  replace: boolean,
  preserveScroll: boolean,
  preserveState: boolean,
  only: Array<string>,
  headers: Record<string, string>
  errorBag: string,
  forceFormData: boolean,
  onCancelToken: (cancel: CallableFunction) => void,
  onBefore: (visit: PendingVisit) => boolean|void,
  onStart: (visit: PendingVisit) => void,
  onProgress: (progress: Record<string, unknown>) => void,
  onFinish: (visit: PendingVisit) => void,
  onCancel: () => void,
  onBeforeRender?: (page: Page) => void,
  onSuccess?: (page: Page) => void,
  onError?: (errors: Record<string, unknown>) => void,

  completed?: boolean,
  cancelled?: boolean,
  interrupted?: boolean,
  cancelToken?: CancelTokenSource,
}
