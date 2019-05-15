interface Page<PageProps = {}> {
  component: string
  props: PageProps
  url: string
  version: string | null
}

interface SpecificVisitOptions {
  preserveScroll?: boolean
  replace?: boolean
}
type SpecificVisit = (
  url: string,
  data?: object,
  options?: SpecificVisitOptions
) => Promise<void>

interface ReloadOptions extends ReplaceOptions {}

type RememberData = object

interface ReplaceOptions {
  data?: object
  method?: string
  preserveScroll?: boolean
}

interface VisitOptions extends ReplaceOptions, SpecificVisitOptions {}

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

declare function shouldIntercept(
  event: HTMLInputElement | KeyboardEvent
): boolean

export default Inertia
export { Page, shouldIntercept }
