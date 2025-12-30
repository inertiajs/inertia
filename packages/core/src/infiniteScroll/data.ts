import { router } from '../index'
import { page as currentPage } from '../page'
import { Page, PendingVisit, ReloadOptions, ScrollProp, UseInfiniteScrollDataManager } from '../types'

const MERGE_INTENT_HEADER = 'X-Inertia-Infinite-Scroll-Merge-Intent'

type Side = 'previous' | 'next'
type ScrollPropPageNames = keyof Pick<ScrollProp, 'previousPage' | 'nextPage'>

type InfiniteScrollState = {
  previousPage: number | string | null
  nextPage: number | string | null
  lastLoadedPage: number | string | null
  requestCount: number
}

export const useInfiniteScrollData = (options: {
  getPropName: () => string
  onBeforeUpdate: () => void
  onBeforePreviousRequest: () => void
  onBeforeNextRequest: () => void
  onCompletePreviousRequest: (loadedPage: string | number | null) => void
  onCompleteNextRequest: (loadedPage: string | number | null) => void
}): UseInfiniteScrollDataManager => {
  const getCurrentPage = (): Page => currentPage.get()

  const getScrollProp = (page: Page): ScrollProp => {
    const scrollProp = page.scrollProps?.[options.getPropName()]

    if (scrollProp) {
      return scrollProp
    }

    throw new Error(`The page object does not contain a scroll prop named "${options.getPropName()}".`)
  }

  const state = {
    component: null,
    loading: false,
    previousPage: null,
    nextPage: null,
    lastLoadedPage: null,
    requestCount: 0,
  } as {
    component: string | null
    loading: boolean
  } & InfiniteScrollState

  const resetState = (page: Page) => {
    const scrollProp = getScrollProp(page)

    state.component = page.component
    state.loading = false
    state.previousPage = scrollProp.previousPage
    state.nextPage = scrollProp.nextPage
    state.lastLoadedPage = scrollProp.currentPage
    state.requestCount = 0
  }

  const getRememberKey = () => `inertia:infinite-scroll-data:${options.getPropName()}`

  if (typeof window !== 'undefined') {
    resetState(getCurrentPage())

    const rememberedState = router.restore(getRememberKey()) as InfiniteScrollState | undefined

    if (
      rememberedState &&
      typeof rememberedState === 'object' &&
      rememberedState.lastLoadedPage === getScrollProp(getCurrentPage()).currentPage
    ) {
      // Restore remembered state only when it's consistent with the current scroll prop,
      // which ensures back/forward navigation works while direct URL visits reset properly.
      state.previousPage = rememberedState.previousPage
      state.nextPage = rememberedState.nextPage
      state.lastLoadedPage = rememberedState.lastLoadedPage
      state.requestCount = rememberedState.requestCount || 0
    }
  }

  const removeEventListener = router.on('beforeUpdate', (event) => {
    const page = event.detail.page
    const scrollProp = getScrollProp(page)

    if (state.component === page.component && scrollProp.reset) {
      resetState(page)
    }
  })

  const getScrollPropKeyForSide = (side: Side): ScrollPropPageNames => {
    return side === 'next' ? 'nextPage' : 'previousPage'
  }

  const findPageToLoad = (side: Side) => {
    const pagePropName = getScrollPropKeyForSide(side)

    return state[pagePropName]
  }

  const syncStateOnSuccess = (side: Side) => {
    const scrollProp = getScrollProp(getCurrentPage())
    const paginationProp = getScrollPropKeyForSide(side)

    state.lastLoadedPage = scrollProp.currentPage
    state[paginationProp] = scrollProp[paginationProp]

    state.requestCount += 1

    // We save the state in the browser history so it can be restored
    // if the user navigates away and then back to the page...
    router.remember(
      {
        previousPage: state.previousPage,
        nextPage: state.nextPage,
        lastLoadedPage: state.lastLoadedPage,
        requestCount: state.requestCount,
      } as InfiniteScrollState,
      getRememberKey(),
    )
  }

  const getPageName = () => getScrollProp(getCurrentPage()).pageName
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
    removeEventListener,
  }
}
