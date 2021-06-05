import { CancelTokenSource } from 'axios'

export type Errors = Record<string, string>
export type ErrorBag = Record<string, Errors>

export type FormDataConvertible = Date|File|Blob|Array<any>|boolean|string|number|null|undefined

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

export interface Page {
  component: string,
  props: PageProps & {
    errors: Errors & ErrorBag;
  }
  url: string,
  version: string|null

  // Refactor away
  scrollRegions: Array<{ top: number, left: number }>
  rememberedState: Record<string, unknown>
  resolvedErrors: Errors
}

export type PageResolver = (name: string) => Component

export type PageHandler = ({
  component,
  page,
  preserveState,
}: {
  component: Component,
  page: Page,
  preserveState: PreserveStateOption,
}) => Promise<unknown>

export type PreserveStateOption = boolean|string|((page: Page) => boolean)

export type LocationVisit = {
  preserveScroll: boolean,
}

export type Visit = {
  method: Method,
  data: Record<string, FormDataConvertible>|FormData,
  replace: boolean,
  preserveScroll: PreserveStateOption,
  preserveState: PreserveStateOption,
  only: Array<string>,
  headers: Record<string, string>
  errorBag: string|null,
  forceFormData: boolean,
}

export type VisitOptions = Visit & {
  onCancelToken: { ({ cancel }: { cancel: VoidFunction }): void },
  onBefore: (visit: PendingVisit) => boolean|void,
  onStart: (visit: PendingVisit) => void,
  onProgress: (progress: { percentage: number }|void) => void,
  onFinish: (visit: ActiveVisit) => void,
  onCancel: () => void,
  onSuccess: (page: Page) => void,
  onError: (errors: Errors) => void,
}

export type PendingVisit = Visit & {
  url: URL,
  completed: boolean,
  cancelled: boolean,
  interrupted: boolean,
};

export type ActiveVisit = PendingVisit & VisitOptions & {
  cancelToken: CancelTokenSource,
}

export type VisitId = unknown
export type Component = unknown
