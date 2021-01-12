import { CancelTokenSource } from "axios"

declare global {
  // These open interfaces may be extended in an application-specific manner via
  // declaration merging / interface augmentation.
  namespace Inertia {
    interface PagePropsBeforeTransform {}

    interface PageProps {}
  }
}

export type PagePropsBeforeTransform = Inertia.PagePropsBeforeTransform
export type PageProps = Inertia.PageProps

export interface Page<CustomPageProps extends PageProps = PageProps> {
  component: string
  props: CustomPageProps
  url: string
  version: string | null
  scrollRegions: { top: number, left: number }[]
  rememberedState: {
    [key: string]: any
  }
}

type VisitOptions = {
  method?: string
  replace?: boolean
  preserveScroll?: boolean | ((props: Page<Inertia.PageProps>) => boolean)
  preserveState?: boolean | ((props: Page<Inertia.PageProps>) => boolean) | null
  only?: string[]
  headers?: object
  onCancelToken?: (cancelToken: CancelTokenSource) => void
  onStart?: (visit: VisitOptions & {url: string}) => void | boolean
  onProgress?: (progress: ProgressEvent) => void
  onFinish?: () => void
  onCancel?: () => void
  onSuccess?: (page: Page) => void | Promise<any>
  onError?: (errors: Record<string, string>) => void
}

type InertiaEvent = 'before' | 'start' | 'progress' | 'success' | 'invalid' | 'error' | 'finish' | 'navigate'

interface Inertia {
  init: <
    Component,
    CustomPageProps extends PagePropsBeforeTransform = PagePropsBeforeTransform
  >(arguments: {
    initialPage: Page<CustomPageProps>
    resolveComponent: (name: string) => Component | Promise<Component>
    updatePage: (
      component: Component,
      props: CustomPageProps,
      options: {
        preserveState: boolean
      }
    ) => void
  }) => void

  visit: (
    url: string,
    options?: VisitOptions & { data?: object }
  ) => Promise<void>

  get: (url: string, data?: object, options?: VisitOptions) => Promise<void>

  patch: (url: string, data?: object, options?: VisitOptions) => Promise<void>

  post: (url: string, data?: object, options?: VisitOptions) => Promise<void>

  put: (url: string, data?: object, options?: VisitOptions) => Promise<void>

  delete: (url: string, options?: VisitOptions) => Promise<void>

  reload: (options?: VisitOptions) => Promise<void>

  replace: (url: string, options?: VisitOptions) => Promise<void>

  remember: (data: object, key?: string) => void

  restore: (key?: string) => object

  on: (type: InertiaEvent, callback: (event: Event) => boolean | void) => () => void
}

export const Inertia: Inertia

export const shouldIntercept: (event: MouseEvent | KeyboardEvent) => boolean
