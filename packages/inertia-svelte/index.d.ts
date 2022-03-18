import * as Inertia from '@inertiajs/inertia'
import { SvelteComponent, SvelteComponentTyped } from 'svelte'
import { Readable, Writable } from 'svelte/store'

export type PageResolver = (name: string) => SvelteComponent | Promise<SvelteComponent>
export type HeadManagerTitleCallback = (title: string) => string // TODO: When shipped, replace with: Inertia.HeadManagerTitleCallback

export class AppType<SharedProps = Inertia.PageProps> extends SvelteComponentTyped<
  SetupOptions<unknown, SharedProps>['props']
> {}

export interface Action<Parameter = void, Return = ActionReturn<Parameter>> {
  <Node extends HTMLElement>(node: Node, parameter: Parameter): Return
}

export interface ActionReturn<Parameter> {
  update?: (parameter: Parameter) => void
  destroy?: () => void
}

interface BaseInertiaLinkProps {
  data?: Inertia.RequestPayload
  href: string
  method?: string
  replace?: boolean
  preserveScroll?: Inertia.PreserveStateOption
  preserveState?: Inertia.PreserveStateOption
  only?: string[]
  headers?: Record<string, string>
}

type InertiaLinkProps = BaseInertiaLinkProps & Omit<HTMLAnchorElement, keyof BaseInertiaLinkProps>
interface InertiaLinkEvents {
  click: MouseEvent
}
type InertiaLink = SvelteComponentTyped<InertiaLinkProps, InertiaLinkEvents>

export const page: Readable<Inertia.Page>

export function useRemember<State>(initialState: State, key?: string): Writable<State>
export const remember: typeof useRemember

export const InertiaLink: InertiaLink
export const Link: InertiaLink

export const inertia: Action<Inertia.VisitOptions & { href?: string }>

export const InertiaApp: typeof AppType
export const App: typeof AppType

type setDataByKeyValuePair<TForm> = <K extends keyof TForm>(key: K, value: TForm[K]) => void

type MethodOptions = Exclude<Inertia.VisitOptions, 'method' | 'data'>
export type InertiaFormProps<TForm = Record<string, any>> = Writable<
  TForm & {
    isDirty: boolean
    errors: Record<keyof TForm, string>
    hasErrors: boolean
    progress: Inertia.Progress | null
    wasSuccessful: boolean
    recentlySuccessful: boolean
    processing: boolean
    setStore<K extends keyof TForm>(key: K, value: TForm[K]): void
    data(): TForm
    transform(callback: (data: TForm) => TForm): ThisType<InertiaFormProps<TForm>>
    defaults(): ThisType<InertiaFormProps<TForm>>
    defaults(field: keyof TForm, value: string): ThisType<InertiaFormProps<TForm>>
    defaults(fields: Record<keyof TForm, string>): ThisType<InertiaFormProps<TForm>>
    reset(...fields: (keyof TForm)[]): ThisType<InertiaFormProps<TForm>>
    setError(field: keyof TForm, value: string): ThisType<InertiaFormProps<TForm>>
    setError(errors: Record<keyof TForm, string>): ThisType<InertiaFormProps<TForm>>
    clearErrors(...fields: (keyof TForm)[]): ThisType<InertiaFormProps<TForm>>
    submit(method: Inertia.Method, url: string, options?: MethodOptions): void
    get(url: string, options?: MethodOptions): void
    post(url: string, options?: MethodOptions): void
    put(url: string, options?: MethodOptions): void
    patch(url: string, options?: MethodOptions): void
    delete(url: string, options?: MethodOptions): void
    cancel(): void
  }
>

export function useForm<TForm = Record<string, any>>(initialValues?: TForm): InertiaFormProps<TForm>
export function useForm<TForm = Record<string, any>>(
  rememberKey: string,
  initialValues?: TForm
): InertiaFormProps<TForm>

export interface SetupOptions<ElementType, SharedProps> {
  el: ElementType
  App: typeof AppType
  props: {
    initialPage: Inertia.Page<SharedProps>
    initialComponent: SvelteComponent
    resolveComponent: PageResolver
    onHeadUpdate?: null
    visitOptions?: Inertia.VisitOptions
  }
}

export type CreateInertiaAppSetupReturnType = SvelteComponent | void
export interface InertiaAppOptions<SharedProps> {
  id?: string
  resolve: PageResolver
  title?: HeadManagerTitleCallback
  page?: Inertia.Page | string
  render?: undefined
  visitOptions?: Inertia.VisitOptions
  setup(options: SetupOptions<HTMLElement, SharedProps>): CreateInertiaAppSetupReturnType
}

export function createInertiaApp<SharedProps = Inertia.PageProps>(options: InertiaAppOptions<SharedProps>): void
