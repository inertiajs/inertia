import { router } from '..'
import {
  composeColdLayer,
  isBlankBase,
  isLayerResponse,
  layerBaseOf,
  layersOf,
  loadingBase,
  nextLayerId,
  promoteDeepestLayer,
  promoteLayer,
  resetLayerSequence,
  withBrowserHash,
  withoutClosingLayers,
} from '../layers'
import { page as currentPage } from '../page'
import { responseQueue } from '../queue'
import { LoadingOption, LoadingResolver, Page, ResolvedLayer, VisitOptions } from '../types'
import { hrefToUrl, isSameUrlWithoutHash } from '../url'
import { normalizeLoading, resolveLayers } from './render'

// A cold open has no base beneath it, so the walk fetches the one it declared until a page stands alone.

export const maxLayerChain = 10

export const walkContinues = (page: Page, base: string): boolean => {
  const layers = layersOf(page)
  const fetchedFrom = (url: string | null) => url !== null && isSameUrlWithoutHash(hrefToUrl(url), hrefToUrl(base))

  if (layers.some((layer) => fetchedFrom(layer.url))) {
    return false
  }

  if (layers.length >= maxLayerChain) {
    console.warn(
      `A layer chain more than ${maxLayerChain} layers deep was declared, so "${base}" was not fetched. The deepest layer that loaded is being used as the page.`,
    )

    return false
  }

  return true
}

export const recoverBlankBase = (url: string): void => {
  router.visit(url, { replace: true, preserveScroll: true, preserveState: true })
}

export const landWalk = (walkedFrom: number): Promise<void> => {
  const page = currentPage.get()

  if (walkedFrom !== currentPage.generation()) {
    return Promise.resolve()
  }

  if (!withoutClosingLayers(page).layers?.length) {
    return Promise.resolve(recoverBlankBase(page.url))
  }

  return currentPage.set(promoteDeepestLayer(page), {
    replace: true,
    preserveScroll: true,
    preserveState: true,
    preservesBase: true,
  })
}

let fetching: { base: string; generation: number } | undefined

const walkTo = (base: string): void => {
  const walkedFrom = currentPage.generation()

  fetching = { base, generation: walkedFrom }

  let failed = false

  const land = () => {
    failed = true
    responseQueue.add(() => landWalk(walkedFrom))

    return false
  }

  router.visit(base, {
    walk: true,
    async: true,
    replace: true,
    preserveScroll: true,
    preserveState: true,
    onHttpException: land,
    onNetworkError: land,
    onFinish: (visit) => {
      if (fetching?.base !== base || fetching.generation !== walkedFrom) {
        return
      }

      fetching = undefined

      if (!failed && !visit.cancelled && !visit.interrupted) {
        continueWalk()
      }
    },
  } as VisitOptions & { walk: true })
}

export const continueWalk = (): void => {
  const base = loadingBase(currentPage.get())

  if (base === undefined || fetching?.generation === currentPage.generation()) {
    return
  }

  walkTo(base)
}

const composeInitialPage = (response: Page): Page => {
  resetLayerSequence()

  const page = withBrowserHash(response)

  if (!isLayerResponse(page)) {
    return page
  }

  const base = layerBaseOf(page)

  if (base === undefined) {
    return promoteLayer(page)
  }

  const cold = composeColdLayer(page, nextLayerId(page))

  return walkContinues(cold, base) ? cold : promoteLayer(page)
}

export const resolveInitialPage = async <ComponentType, PageType extends Page>(
  response: PageType,
  resolve: (name: string, page: Page) => ComponentType | Promise<ComponentType>,
  resolveLoading?: (url: string, page: Page) => ComponentType | Promise<ComponentType | undefined> | undefined,
): Promise<{ page: PageType; component?: ComponentType; layers: ResolvedLayer<ComponentType>[] }> => {
  const page = composeInitialPage(response) as PageType
  const base = loadingBase(page)

  const [component, layers] = await Promise.all([
    !isBlankBase(page) ? resolve(page.component, page) : base === undefined ? undefined : resolveLoading?.(base, page),
    resolveLayers(page, resolve),
  ])

  return { page, component, layers }
}

export const resolveInitialApp = async <ComponentType, PageType extends Page>({
  response,
  resolveComponent,
  loading,
  blank,
  rendered,
  normalize,
}: {
  response: PageType
  resolveComponent: (name: string, page: Page) => ComponentType | Promise<ComponentType>
  loading: LoadingOption | undefined
  blank: ComponentType
  rendered?: (value: unknown) => boolean
  normalize?: (value: unknown) => ComponentType
}): Promise<{
  page: PageType
  component: ComponentType
  layers: ResolvedLayer<ComponentType>[]
  resolveLoading: LoadingResolver
}> => {
  const resolveLoading = normalizeLoading<ComponentType>(loading, { blank, rendered, normalize })
  const { page, component, layers } = await resolveInitialPage(response, resolveComponent, resolveLoading)

  return { page, component: component ?? blank, layers, resolveLoading }
}
