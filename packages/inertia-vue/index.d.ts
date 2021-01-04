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
  transformProps?: (props: PagePropsBeforeTransform) => PageProps
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

export const InertiaApp: App

export const App: App

export const plugin: PluginObject<any>
