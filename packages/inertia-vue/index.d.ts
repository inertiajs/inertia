import * as Inertia from '@inertiajs/inertia'
import { Component, FunctionalComponentOptions, PluginObject } from 'vue'

interface AppData<PageProps extends Inertia.PageProps = Inertia.PageProps> {
  component: Component | null
  key: number | null
  props: PageProps | {}
}

interface AppProps<
  PagePropsBeforeTransform extends Inertia.PagePropsBeforeTransform = Inertia.PagePropsBeforeTransform,
  PageProps extends Inertia.PageProps = Inertia.PageProps
> {
  initialPage: Inertia.Page<PageProps>
  resolveComponent: (name: string) => Component | Promise<Component>
}

type App<
  PagePropsBeforeTransform extends Inertia.PagePropsBeforeTransform = Inertia.PagePropsBeforeTransform,
  PageProps extends Inertia.PageProps = Inertia.PageProps
> = Component<
  AppData<PageProps>,
  never,
  never,
  AppProps<PagePropsBeforeTransform, PageProps>
>

export const InertiaApp: App

export const App: App

export const plugin: PluginObject<any>

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

type InertiaLink = FunctionalComponentOptions<InertiaLinkProps>

export const InertiaLink: InertiaLink

interface InertiaFormProps<TForm> {
  isDirty: boolean
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

interface InertiaFormTrait {
  form<TForm>(data: TForm): InertiaForm<TForm>
  form<TForm>(rememberKey: string, data: TForm): InertiaForm<TForm>
}

declare module 'vue/types/vue' {
  export interface Vue {
    $inertia: Inertia.Inertia & InertiaFormTrait
    $page: Inertia.Page
  }
}
