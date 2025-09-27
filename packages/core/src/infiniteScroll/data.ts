import { router } from '../index'
import { page as currentPage } from '../page'
import { Page, PendingVisit, ReloadOptions, ScrollProp, UseInfiniteScrollDataManager } from '../types'

const MERGE_INTENT_HEADER = 'X-Inertia-Infinite-Scroll-Merge-Intent'

type Side = 'previous' | 'next'
type ScrollPropPageNames = keyof Pick<ScrollProp, 'previousPage' | 'nextPage'>

type InfiniteScrollState = {
  previousPage?: number | string
  nextPage?: number | string
  lastLoadedPage?: number | string
  requestCount: number
}

export const useInfiniteScrollData = (options: {
  getPropName: () => string
  onBeforeUpdate: () => void
  onBeforePreviousRequest: () => void
  onBeforeNextRequest: () => void
  onCompletePreviousRequest: (loadedPage?: string | number) => void
  onCompleteNextRequest: (loadedPage?: string | number) => void
}): UseInfiniteScrollDataManager => {
  const getScrollPropFromCurrentPage = (): ScrollProp => {
    const scrollProp = currentPage.get().scrollProps?.[options.getPropName()]

    if (scrollProp) {
      return scrollProp
    }

    throw new Error(`The page object does not contain a scroll prop named "${options.getPropName()}".`)
  }

  const { previousPage, nextPage, currentPage: lastLoadedPage } = getScrollPropFromCurrentPage()

  const state = {
    loading: false,
    previousPage,
    nextPage,
    lastLoadedPage,
    requestCount: 0,
  }

  const getRememberKey = () => `inertia:infinite-scroll-data:${options.getPropName()}`

  const rememberedState = router.restore(getRememberKey()) as InfiniteScrollState | undefined

  if (rememberedState && typeof rememberedState === 'object') {
    state.previousPage = rememberedState.previousPage
    state.nextPage = rememberedState.nextPage
    state.lastLoadedPage = rememberedState.lastLoadedPage
    state.requestCount = rememberedState.requestCount || 0
  }

  const getScrollPropKeyForSide = (side: Side): ScrollPropPageNames => {
    return side === 'next' ? 'nextPage' : 'previousPage'
  }

  const findPageToLoad = (side: Side) => {
    const pagePropName = getScrollPropKeyForSide(side)

    return state[pagePropName]
  }

  const syncStateOnSuccess = (side: Side) => {
    const scrollProp = getScrollPropFromCurrentPage()
    const paginationProp = getScrollPropKeyForSide(side)

    state.lastLoadedPage = scrollProp.currentPage
    state[paginationProp] = scrollProp[paginationProp]

    state.requestCount += 1

    router.remember(state, getRememberKey())
  }

  const getPageName = () => getScrollPropFromCurrentPage().pageName
  const getRequestCount = () => state.requestCount

  const fetchPage = (side: Side, reloadOptions: ReloadOptions = {}): void => {
    const page = findPageToLoad(side)

    if (state.loading || page === null) {
      return
    }

    state.loading = true

    router.reload({
      ...reloadOptions,
      data: { [getPageName()]: page },
      only: [options.getPropName()],
      preserveUrl: true, // we handle URL updates manually via useInfiniteScrollQueryString()
      headers: {
        [MERGE_INTENT_HEADER]: side === 'previous' ? 'prepend' : 'append',
        ...reloadOptions.headers,
      },
      onBefore: (visit: PendingVisit) => {
        side === 'next' ? options.onBeforeNextRequest() : options.onBeforePreviousRequest()
        reloadOptions.onBefore?.(visit)
      },
      onBeforeUpdate: (page: Page) => {
        options.onBeforeUpdate()
        reloadOptions.onBeforeUpdate?.(page)
      },
      onSuccess: (page: Page) => {
        syncStateOnSuccess(side)
        reloadOptions.onSuccess?.(page)
      },
      onFinish: (visit: any) => {
        state.loading = false
        side === 'next'
          ? options.onCompleteNextRequest(state.lastLoadedPage)
          : options.onCompletePreviousRequest(state.lastLoadedPage)
        reloadOptions.onFinish?.(visit)
      },
    })
  }

  const getLastLoadedPage = () => state.lastLoadedPage
  const hasPrevious = () => !!state.previousPage
  const hasNext = () => !!state.nextPage
  const fetchPrevious = (reloadOptions?: ReloadOptions): void => fetchPage('previous', reloadOptions)
  const fetchNext = (reloadOptions?: ReloadOptions): void => fetchPage('next', reloadOptions)

  return {
    getLastLoadedPage,
    getPageName,
    getRequestCount,
    hasPrevious,
    hasNext,
    fetchNext,
    fetchPrevious,
  }
}
