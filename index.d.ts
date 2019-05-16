interface Page<PageProps = {}> {
  component: string
  props: PageProps
  url: string
  version: string | null
}

type SpecificVisitOptions = Pick<VisitOptions, 'preserveScroll' | 'replace'>
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
  replace?: boolean
}

interface InitArguments<Component, PageProps = {}> {
  initialPage: Page<PageProps>
  resolveComponent: (name: string) => Promise<Component>
  updatePage: (component: Component, props: PageProps) => void
}

interface Inertia {
  delete: SpecificVisit
  init: <Component, PageProps = {}>(
    arguments: InitArguments<Component, PageProps>
  ) => void
  patch: SpecificVisit
  post: SpecificVisit
  put: SpecificVisit
  reload: (options?: ReloadOptions) => Promise<void>
  remember: (data: RememberData, key?: string) => void
  replace: (url: string, options?: ReplaceOptions) => Promise<void>
  restore: (key?: string) => RememberData
  visit: (url: string, options?: VisitOptions) => Promise<void>
}

declare function shouldIntercept(event: MouseEvent | KeyboardEvent): boolean

export default Inertia
export { Page, shouldIntercept }
