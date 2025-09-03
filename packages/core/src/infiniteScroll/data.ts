import { PendingVisit, ReloadOptions, router } from '../index'
import { page as currentPage } from '../page'
import { InfiniteScrollSide, Page, ScrollProp } from '../types'

const MERGE_INTENT_HEADER = 'X-Inertia-Infinite-Scroll-Merge-Intent'

type MergeIntent = 'append' | 'prepend'
type ScrollPropPageNames = keyof Pick<ScrollProp, 'previousPage' | 'nextPage'>

export const useInfiniteScrollData = (options: {
  getPropName: () => string
  inReverseMode: () => boolean
  onBeforeUpdate: () => void
  onRequestStart: (side: InfiniteScrollSide) => void
  onRequestComplete: (side: InfiniteScrollSide, lastLoadedPage?: string | number) => void
}) => {
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
  }

  const getPageName = () => getScrollPropFromCurrentPage().pageName

  const findPageToLoad = (side: InfiniteScrollSide) => {
    const pagePropName = getScrollPropKeyForSide(side)

    return state[pagePropName]
  }

  const getMergeIntent = (side: InfiniteScrollSide): MergeIntent => {
    const reverse = options.inReverseMode()
    // In reverse mode, loading "after" actually means prepending 'older' content
    // In normal mode, loading "before" means prepending 'newer' content
    const shouldPrepend = (side === 'before' && !reverse) || (side === 'after' && reverse)

    return shouldPrepend ? 'prepend' : 'append'
  }

  const getScrollPropKeyForSide = (side: InfiniteScrollSide): ScrollPropPageNames => {
    const reverse = options.inReverseMode()

    // In reverse mode, the logical meaning of before/after is flipped
    // - "after" in reverse mode means loading 'older' pages (previousPage)
    // - "before" in reverse mode means loading 'newer' pages (nextPage)
    if (side === 'after') {
      return reverse ? 'previousPage' : 'nextPage'
    }

    return reverse ? 'nextPage' : 'previousPage'
  }

  const syncStateOnSuccess = (side: InfiniteScrollSide) => {
    const scrollProp = getScrollPropFromCurrentPage()
    const paginationProp = getScrollPropKeyForSide(side)

    state.lastLoadedPage = scrollProp.currentPage
    state[paginationProp] = scrollProp[paginationProp]
  }

  const loadPage = (side: InfiniteScrollSide, reloadOptions: ReloadOptions = {}) => {
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
        [MERGE_INTENT_HEADER]: getMergeIntent(side),
        ...reloadOptions.headers,
      },
      onBefore: (visit: PendingVisit) => {
        options.onRequestStart(side)
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
        options.onRequestComplete(side, state.lastLoadedPage)
        reloadOptions.onFinish?.(visit)
      },
    })
  }

  const getLastLoadedPage = () => state.lastLoadedPage

  // Check if more content is available in each direction, accounting for reverse mode
  const hasMoreBefore = () => !!(options.inReverseMode() ? state.nextPage : state.previousPage)
  const hasMoreAfter = () => !!(options.inReverseMode() ? state.previousPage : state.nextPage)

  const loadBefore = (reloadOptions?: ReloadOptions) => loadPage('before', reloadOptions)
  const loadAfter = (reloadOptions?: ReloadOptions) => loadPage('after', reloadOptions)

  return {
    getLastLoadedPage,
    getPageName,
    hasMoreBefore,
    hasMoreAfter,
    loadAfter,
    loadBefore,
  }
}
