import { CancelTokenSource } from 'axios'

export type Errors = Record<string, string>
export type ErrorBag = Record<string, Errors>

export type FormDataConvertible = Date|File|Blob|boolean|string|number|null|undefined

export enum Method {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  PATCH = 'patch',
  DELETE = 'delete',
}

export type RequestPayload = Record<string, FormDataConvertible>|FormData

export interface Page {
  component: string,
  props: {
    [key: string]: unknown,
    errors: Errors & ErrorBag,
  }
  url: string,
  version: string|null

  // Refactor away
  scrollRegions: Array<{ top: number, left: number }>
  rememberedState: Record<string, unknown>
  resolvedErrors: Errors
}

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

export interface GlobalEventCallbacks {
  before: (event: CustomEvent<{
    visit: Visit
  }>) => boolean | void
  start: (event: CustomEvent<{
    visit: Visit
  }>) => void
  progress: (event: CustomEvent) => void
  success: (event: CustomEvent<{
    page: Page
  }>) => void
  invalid: (event: CustomEvent) => void
  error: (event: CustomEvent) => void
  finish: (event: CustomEvent<{
    visit: Visit
  }>) => void
  navigate: (event: CustomEvent<{
    page: Page
  }>) => void
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

export type Component = unknown
export type PageResolver = (name: string) => Component
export type Props = Record<string, unknown>

export type PageHandler = ({
  component,
  page,
  preserveState,
}: {
  component: Component,
  page: Page,
  preserveState: PreserveStateOption,
}) => Promise<unknown>
