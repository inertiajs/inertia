import * as Inertia from '@inertiajs/inertia'
import { Ref, ComputedRef, App, Component, DefineComponent } from 'vue'

interface InertiaAppProps<
  PagePropsBeforeTransform extends Inertia.PagePropsBeforeTransform = Inertia.PagePropsBeforeTransform,
  PageProps extends Inertia.PageProps = Inertia.PageProps
> {
  initialPage: Inertia.Page<PageProps>
  resolveComponent: (name: string) => Component | Promise<Component>
  transformProps?: (props: PagePropsBeforeTransform) => PageProps
}

type InertiaApp<
  PagePropsBeforeTransform extends Inertia.PagePropsBeforeTransform = Inertia.PagePropsBeforeTransform,
  PageProps extends Inertia.PageProps = Inertia.PageProps
> = DefineComponent<InertiaAppProps<PagePropsBeforeTransform, PageProps>>

interface InertiaLinkProps {
  as?: string
  data?: object
  href: string
  method?: string
  headers?: object
  onClick?: (event: MouseEvent | KeyboardEvent) => void
  preserveScroll?: boolean | ((props: Inertia.PageProps) => boolean)
  preserveState?: boolean | ((props: Inertia.PageProps) => boolean) | null
  replace?: boolean
  only?: string[]
  onCancelToken?: (cancelToken: import('axios').CancelTokenSource) => void
  onBefore?: () => void
  onStart?: () => void
  onProgress?: (progress: number) => void
  onFinish?: () => void
  onCancel?: () => void
  onSuccess?: () => void
}

type InertiaLink = DefineComponent<InertiaLinkProps>

type ProgressEvent = {
  percentage: number
  [key: string]: any
}

interface Form<Data> {
  errors: { [K in keyof Data]: string | undefined }
  hasErrors: boolean
  processing: boolean
  progress: ProgressEvent | null
  wasSuccessful: boolean
  recentlySuccessful: boolean
  data(): Data
  transform(callback: (data: Data) => object): this
  reset(...fields: (keyof Data)[]): this
  clearErrors(...fields: (keyof Data)[]): this
  serialize(): { errors: { [K in keyof Data]: string | undefined }, [key: string]: any }
  unserialize(data: object): this
  submit(method: string, url: string, options?: Inertia.VisitOptions): void
  get(url: string, options?: Inertia.VisitOptions): void
  post(url: string, options?: Inertia.VisitOptions): void
  put(url: string, options?: Inertia.VisitOptions): void
  patch(url: string, options?: Inertia.VisitOptions): void
  delete(url: string, options?: Inertia.VisitOptions): void
}

type FormWithData<Data> = Data & Form<Data>

export const App: InertiaApp

export const Link: InertiaLink

export const plugin: {
  install(app: App): void
}

export declare function usePage<CustomPageProps extends Inertia.PageProps = Inertia.PageProps>(): {
  props: ComputedRef<CustomPageProps>
  url: ComputedRef<string>
  component: ComputedRef<string>
  version: ComputedRef<string | null>
}

export declare function useRemember(data: object, key?: string): Ref<object>

export declare function useForm<Data>(data: Data): Ref<FormWithData<Data>>

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $inertia: Inertia.Inertia
    $page: Inertia.Page
  }

  export interface ComponentCustomOptions {
    remember?:
      string |
      string[] |
      {
        data: string | string[],
        key?: string | (() => string)
      }
  }
}
