import * as Inertia from '@inertiajs/inertia'
import Vue, { Component, ComponentOptions, FunctionalComponentOptions, PluginObject } from 'vue'

export interface InertiaData {
  component: Component | null
  key: number | null
  props: Inertia.PageProps
}

export interface InertiaProps {
  initialPage: Inertia.Page
  initialComponent?: object
  resolveComponent?: (name: string) => Component
  onHeadUpdate?: (elements: string[]) => void
}

type InertiaApp = ComponentOptions<never, InertiaData, never, never, InertiaProps>

export declare const InertiaApp: InertiaApp

export declare const App: InertiaApp

export declare const plugin: PluginObject<any>

export interface CreateInertiaAppProps {
  id?: string
  resolve: (name: string) => 
    Component |
    Promise<Component> |
    { default: Component }
  setup: (props: {
    el: Element
    app: InertiaApp
    props: {
      attrs: { id: string, 'data-page': string }
      props: InertiaProps
    }
  }) => void | Vue
  title?: (title: string) => string
  page?: Inertia.Page
  render?: (vm: Vue) => Promise<string>
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

export type InertiaLink = FunctionalComponentOptions<InertiaLinkProps>

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

export type InertiaHeadManager = ReturnType<typeof Inertia.createHeadManager>

export interface InertiaHeadProps {
  title?: string
}

export type InertiaHead = ComponentOptions<never, never, never, never, InertiaHeadProps>

export declare const Head: InertiaHead

export interface InertiaFormTrait {
  form<TForm>(data: TForm): InertiaForm<TForm>
  form<TForm>(rememberKey: string, data: TForm): InertiaForm<TForm>
}

declare module 'vue/types/vue' {
  export interface Vue {
    $inertia: typeof Inertia.Inertia & InertiaFormTrait
    $page: Inertia.Page
    $headManager: InertiaHeadManager
  }
}
