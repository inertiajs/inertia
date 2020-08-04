import * as Inertia from '@inertiajs/inertia'
import { Component, FunctionalComponentOptions } from 'vue'

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
  data?: object
  href: string
  method?: string
  onClick?: (event: MouseEvent | KeyboardEvent) => void
  preserveScroll?: boolean
  preserveState?: boolean
  replace?: boolean
}

type InertiaLink = FunctionalComponentOptions<InertiaLinkProps>

export const InertiaLink: InertiaLink

export const InertiaApp: App
