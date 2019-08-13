declare namespace Inertia {
  interface PagePropsBeforeTransform {}

  interface PageProps {}

  interface Page<CustomPageProps extends PageProps = PageProps> {
    component: string
    props: CustomPageProps
    url: string
    version: string | null
  }

  type SpecificVisitOptions = Pick<
    VisitOptions,
    'preserveScroll' | 'preserveState' | 'replace'
  >

  type SpecificVisit = (
    url: string,
    data?: VisitOptions['data'],
    options?: SpecificVisitOptions
  ) => Promise<void>

  type ReloadOptions = ReplaceOptions

  type RememberData = object

  type ReplaceOptions = Pick<VisitOptions, 'data' | 'method' | 'preserveScroll'>

  interface VisitOptions {
    data?: object
    method?: string
    preserveScroll?: boolean
    preserveState?: boolean
    replace?: boolean
  }

  interface UpdatePageOptions {
    preserveState: VisitOptions['preserveState']
  }

  interface Inertia {
    delete: SpecificVisit
    init: <
      Component,
      CustomPageProps extends PagePropsBeforeTransform = PagePropsBeforeTransform
    >(arguments: {
      initialPage: Page<CustomPageProps>
      resolveComponent: (name: string) => Component | Promise<Component>
      updatePage: (
        component: Component,
        props: CustomPageProps,
        options: UpdatePageOptions
      ) => void
    }) => void
    patch: SpecificVisit
    post: SpecificVisit
    put: SpecificVisit
    reload: (options?: ReloadOptions) => Promise<void>
    remember: (data: RememberData, key?: string) => void
    replace: (url: string, options?: ReplaceOptions) => Promise<void>
    restore: (key?: string) => RememberData
    visit: (url: string, options?: VisitOptions) => Promise<void>
  }

  type shouldIntercept = (event: MouseEvent | KeyboardEvent) => boolean
}

declare module '@inertiajs/inertia' {
  export const shouldIntercept: Inertia.shouldIntercept

  export const Inertia: Inertia.Inertia
}
