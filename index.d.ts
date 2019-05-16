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

interface Inertia<PageProps = {}> {
  delete: SpecificVisit
  init: (
    page: Page<PageProps>,
    setPage: (page: Page<PageProps>) => void
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
