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

export const App: InertiaApp

export const Link: InertiaLink

export const plugin: {
  install(app: App): void
}

type ProgressEvent = {
  percentage: number
}

interface InertiaFormProps<TForm> {
  errors: Record<keyof TForm, string>
  hasErrors: boolean
  processing: boolean
  progress: ProgressEvent | null
  wasSuccessful: boolean
  recentlySuccessful: boolean
  data(): TForm
  transform(callback: (data: TForm) => object): this
  reset(...fields: (keyof TForm)[]): this
  clearErrors(...fields: (keyof TForm)[]): this
  submit(method: string, url: string, options?: Inertia.VisitOptions): void
  get(url: string, options?: Inertia.VisitOptions): void
  post(url: string, options?: Inertia.VisitOptions): void
  put(url: string, options?: Inertia.VisitOptions): void
  patch(url: string, options?: Inertia.VisitOptions): void
  delete(url: string, options?: Inertia.VisitOptions): void
  cancel(): void
}

type InertiaForm<TForm> = TForm & InertiaFormProps<TForm>

export declare function useForm<TForm>(data: TForm): InertiaForm<TForm>

export declare function useForm<TForm>(rememberKey: string, data: TForm): InertiaForm<TForm>

export declare function useRemember(data: object, key?: string): Ref<object>

export declare function usePage<CustomPageProps extends Inertia.PageProps = Inertia.PageProps>(): {
  props: ComputedRef<CustomPageProps>
  url: ComputedRef<string>
  component: ComputedRef<string>
  version: ComputedRef<string | null>
}

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
