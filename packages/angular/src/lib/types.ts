import type { ApplicationRef, EnvironmentProviders, Provider, Type } from '@angular/core'
import type {
  CreateInertiaAppOptions,
  LayoutCallbackReturn,
  Page,
  PageProps,
  ServerHeadOption,
  SharedPageProps,
} from '@inertiajs/core'

export type AngularRenderNode = {
  component: Type<unknown>
  children: AngularRenderNode[]
}

export type AngularRenderFunction = (
  h: (component: Type<unknown>, children?: AngularRenderNode | AngularRenderNode[]) => AngularRenderNode,
  page: AngularRenderNode,
) => AngularRenderNode

export type LayoutCallback = (props: SharedPageProps) => LayoutCallbackReturn<Type<unknown>>

export type AngularLayout =
  | Type<unknown>
  | Type<unknown>[]
  | LayoutCallback
  | AngularRenderFunction
  | LayoutCallbackReturn<Type<unknown>>

export type ResolvedComponent = Type<unknown> & {
  layout?: AngularLayout
}

export type ComponentResolver = (
  name: string,
  page?: Page<SharedPageProps>,
) => ResolvedComponent | Promise<ResolvedComponent> | { default: ResolvedComponent }

export type InertiaAppProps<SharedProps extends PageProps = PageProps> = {
  initialPage: Page<SharedProps>
  initialComponent: ResolvedComponent
  resolveComponent: (name: string, page?: Page) => Promise<ResolvedComponent>
  titleCallback?: (title: string, page: Page) => string
  defaultLayout?: (name: string, page: Page) => unknown
  serverHead?: ServerHeadOption
  onHeadUpdate?: (elements: string[]) => void
}

export type SetupOptions<SharedProps extends PageProps = PageProps> = {
  el: HTMLElement | null
  App: Type<unknown>
  props: InertiaAppProps<SharedProps>
  providers: Array<Provider | EnvironmentProviders>
}

export type AngularWithApp<SharedProps extends PageProps = PageProps> = (options: {
  ssr: boolean
  page: Page<SharedProps>
}) => Array<Provider | EnvironmentProviders>

export type AngularInertiaAppConfig = Record<never, never>

export type AngularCreateInertiaAppOptions<SharedProps extends PageProps = PageProps & SharedPageProps> = Omit<
  CreateInertiaAppOptions<ComponentResolver, SetupOptions<SharedProps>, ApplicationRef | void, AngularInertiaAppConfig>,
  'setup'
> & {
  page?: Page<SharedProps>
  setup?: (options: SetupOptions<SharedProps>) => ApplicationRef | void | Promise<ApplicationRef | void>
  withApp?: AngularWithApp<SharedProps>
}
