import * as Inertia from '@inertiajs/inertia'
import { Ref, ComputedRef, App as VueApp, DefineComponent, Plugin } from 'vue'

export interface InertiaAppProps {
  initialPage: Inertia.Page
  initialComponent?: object
  resolveComponent?: (name: string) => DefineComponent
  onHeadUpdate?: (elements: string[]) => void
}

type InertiaApp = DefineComponent<InertiaAppProps>

export declare const App: InertiaApp

export declare const plugin: Plugin

export interface CreateInertiaAppProps {
  id?: string
  resolve: (name: string) => 
    DefineComponent |
    Promise<DefineComponent> |
    { default: DefineComponent }
  setup: (props: {
    el: Element
    app: InertiaApp
    props: InertiaAppProps
    plugin: Plugin
  }) => void | VueApp
  title?: (title: string) => string
  page?: Inertia.Page
  render?: (app: VueApp) => Promise<string>
}

export declare function createInertiaApp(props: CreateInertiaAppProps): Promise<{ head: string[], body: string } | void>

export interface InertiaLinkProps {
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

export type InertiaLink = DefineComponent<InertiaLinkProps>

export declare const Link: InertiaLink

export interface InertiaFormProps<TForm> {
  isDirty: boolean
  errors: Record<keyof TForm, string>
  hasErrors: boolean
  processing: boolean
  progress: { percentage: number } | null
  wasSuccessful: boolean
  recentlySuccessful: boolean
  data(): TForm
  transform(callback: (data: TForm) => object): this
  reset(...fields: (keyof TForm)[]): this
  clearErrors(...fields: (keyof TForm)[]): this
  submit(method: string, url: string, options?: Partial<Inertia.VisitOptions>): void
  get(url: string, options?: Partial<Inertia.VisitOptions>): void
  post(url: string, options?: Partial<Inertia.VisitOptions>): void
  put(url: string, options?: Partial<Inertia.VisitOptions>): void
  patch(url: string, options?: Partial<Inertia.VisitOptions>): void
  delete(url: string, options?: Partial<Inertia.VisitOptions>): void
  cancel(): void
}

export type InertiaForm<TForm> = TForm & InertiaFormProps<TForm>

export declare function useForm<TForm>(data: TForm): InertiaForm<TForm>

export declare function useForm<TForm>(rememberKey: string, data: TForm): InertiaForm<TForm>

export declare function useRemember(data: object, key?: string): Ref<object>

export declare function usePage<PageProps>(): {
  props: ComputedRef<PageProps & Inertia.PageProps>
  url: ComputedRef<string>
  component: ComputedRef<string>
  version: ComputedRef<string | null>
}

export type InertiaHead = DefineComponent<{
  title?: string
}>

export declare const Head: InertiaHead

declare module 'vue' {
  export interface ComponentCustomProperties {
    $inertia: typeof Inertia.Inertia
    $page: Inertia.Page
    $headManager: ReturnType<typeof Inertia.createHeadManager>
  }

  export interface ComponentCustomOptions {
    remember?:
      string |
      string[] |
      {
        data: string | string[]
        key?: string | (() => string)
      }
  }
}
