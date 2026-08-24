import { isEqual } from 'es-toolkit'
import { decryptHistory, encryptHistory, historySessionStorageKeys } from './encryption'
import { eventHandler } from './eventHandler'
import { addressOf, encryptsHistory, layerClosing, mapLayers, promoteDeepestLayer } from './layers'
import { toStructuredCloneable } from './objectUtils'
import { page as currentPage } from './page'
import Queue from './queue'
import { SessionStorage } from './sessionStorage'
import { Page, ScrollRegion } from './types'

const isServer = typeof window === 'undefined'
const queue = new Queue<Promise<void>>()
const isChromeIOS = !isServer && /CriOS/.test(window.navigator.userAgent)

class History {
  public rememberedState = 'rememberedState' as const
  public scrollRegions = 'scrollRegions' as const
  public preserveUrl = false
  protected current: Partial<Page> = {}
  // We need initialState for `restore`
  protected initialState: Partial<Page> | null = null

  public remember(data: unknown, key: string, layerId?: string): void {
    if (isServer) {
      return
    }

    const current = currentPage.get().rememberedState ?? {}

    this.replaceState({
      ...currentPage.getWithoutFlashData(),
      rememberedState: layerId
        ? { ...current, [layerId]: { ...(current[layerId] ?? {}), [key]: data } }
        : { ...current, [key]: data },
    })
  }

  public restore(key: string, layerId?: string): unknown {
    if (!isServer) {
      const current = this.current[this.rememberedState] as Record<string, unknown> | undefined
      const initial = this.initialState?.[this.rememberedState] as Record<string, unknown> | undefined

      if (layerId) {
        const stored = (current?.[layerId] ?? {}) as Record<string, unknown>
        const storedInitial = (initial?.[layerId] ?? {}) as Record<string, unknown>

        return stored[key] !== undefined ? stored[key] : storedInitial[key]
      }

      return current?.[key] !== undefined ? current?.[key] : initial?.[key]
    }
  }

  public pushState(page: Page, cb: (() => void) | null = null): void {
    if (isServer) {
      return
    }

    if (this.preserveUrl) {
      cb && cb()
      return
    }

    this.current = page

    queue.add(() => {
      return this.getPageData(page).then((data) => {
        // Defer history.pushState to the next event loop tick to prevent timing conflicts.
        // Ensure any previous history.replaceState completes before pushState is executed.
        const doPush = () => this.doPushState({ page: data }, addressOf(page)).then(() => cb?.())

        if (isChromeIOS) {
          return new Promise((resolve) => {
            setTimeout(() => doPush().then(resolve))
          })
        }

        return doPush()
      })
    })
  }

  protected clonePageProps(page: Page): Page {
    try {
      structuredClone(page)
      return page
    } catch {
      // Props contain non-serializable data (e.g., Proxies, functions), which
      // the browser cannot store in history. Drop what it cannot carry.
      return toStructuredCloneable(page)
    }
  }

  protected getPageData(page: Page): Promise<Page | ArrayBuffer> {
    const open = layerClosing.withoutClosingLayers(page)
    const entry = open.component === '' ? promoteDeepestLayer(open) : open
    const pageWithClonedProps = this.clonePageProps(entry)

    return new Promise((resolve) => {
      return encryptsHistory(entry) ? encryptHistory(pageWithClonedProps).then(resolve) : resolve(pageWithClonedProps)
    })
  }

  public processQueue(): Promise<void> {
    return queue.process()
  }

  public decrypt(page: Page | null = null): Promise<Page> {
    if (isServer) {
      return Promise.resolve(page ?? currentPage.get())
    }

    const pageData = page ?? window.history.state?.page

    return this.decryptPageData(pageData).then((data) => {
      if (!data) {
        throw new Error('Unable to decrypt history')
      }

      if (this.initialState === null) {
        this.initialState = data ?? undefined
      } else {
        this.current = data ?? {}
      }

      return data
    })
  }

  protected decryptPageData(pageData: ArrayBuffer | Page | null): Promise<Page | null> {
    return pageData instanceof ArrayBuffer ? decryptHistory(pageData) : Promise.resolve(pageData)
  }

  public saveScrollPositions(scrollRegions: ScrollRegion[], scrollRegionLayers?: (string | null)[]): void {
    queue.add(() => {
      return Promise.resolve().then(() => {
        if (!window.history.state?.page) {
          return
        }

        if (
          isEqual(this.getScrollRegions(), scrollRegions) &&
          isEqual(this.getScrollRegionLayers() ?? [], scrollRegionLayers ?? [])
        ) {
          return
        }

        return this.doReplaceState({
          page: window.history.state.page,
          scrollRegions,
          scrollRegionLayers,
        })
      })
    })
  }

  public saveDocumentScrollPosition(scrollRegion: ScrollRegion): void {
    queue.add(() => {
      return Promise.resolve().then(() => {
        if (!window.history.state?.page) {
          return
        }

        if (isEqual(this.getDocumentScrollPosition(), scrollRegion)) {
          return
        }

        return this.doReplaceState({
          page: window.history.state.page,
          documentScrollPosition: scrollRegion,
        })
      })
    })
  }

  public getScrollRegions(): ScrollRegion[] {
    return window.history.state?.scrollRegions || []
  }

  public getScrollRegionLayers(): (string | null)[] | undefined {
    return window.history.state?.scrollRegionLayers
  }

  public getDocumentScrollPosition(): ScrollRegion {
    return window.history.state?.documentScrollPosition || { top: 0, left: 0 }
  }

  public replaceState(page: Page, cb: (() => void) | null = null): void {
    if (isEqual(this.current, page)) {
      cb && cb()
      return
    }

    // Exclude flash from the merge to prevent callers (like router.remember())
    // from accidentally clearing flash data on the current page.
    const live = currentPage.get().layers ?? []
    const { flash, ...pageWithoutFlash } = mapLayers(page, (layer) => ({
      ...layer,
      flash: live.find((open) => open.id === layer.id)?.flash ?? {},
    }))

    currentPage.merge(pageWithoutFlash)

    if (isServer) {
      return
    }

    if (this.preserveUrl) {
      cb && cb()
      return
    }

    this.current = page

    queue.add(() => {
      return this.getPageData(page).then((data) => {
        // Defer history.replaceState to the next event loop tick to prevent timing conflicts.
        // Ensure any previous history.pushState completes before replaceState is executed.
        const doReplace = () => this.doReplaceState({ page: data }, addressOf(page)).then(() => cb?.())

        if (isChromeIOS) {
          return new Promise((resolve) => {
            setTimeout(() => doReplace().then(resolve))
          })
        }

        return doReplace()
      })
    })
  }

  // Steps back over the entries a closing stack stands on, behind the writes queued ahead of it:
  // under encryption those are genuinely async, and stepping early would cross the wrong entry.
  public back(entries: number): void {
    queue.add(() => Promise.resolve().then(() => window.history.go(-entries)))
  }

  protected isHistoryThrottleError(error: unknown): error is Error & { name: 'SecurityError' } {
    return (
      error instanceof Error &&
      error.name === 'SecurityError' &&
      (error.message.includes('history.pushState') || error.message.includes('history.replaceState'))
    )
  }

  protected isQuotaExceededError(error: unknown): error is Error & { name: 'QuotaExceededError' } {
    return error instanceof Error && error.name === 'QuotaExceededError'
  }

  protected withThrottleProtection<T = void>(cb: () => T): Promise<T | undefined> {
    return Promise.resolve().then(() => {
      try {
        return cb()
      } catch (error) {
        if (!this.isHistoryThrottleError(error)) {
          throw error
        }

        console.error(error.message)
      }
    })
  }

  protected doReplaceState(
    data: {
      page: Page | ArrayBuffer
      scrollRegions?: ScrollRegion[]
      scrollRegionLayers?: (string | null)[]
      documentScrollPosition?: ScrollRegion
    },
    url?: string,
  ): Promise<void> {
    return this.withThrottleProtection(() => {
      const { scrollRegionLayers, ...state } = data
      const carriedLayers = 'scrollRegionLayers' in data ? scrollRegionLayers : window.history.state?.scrollRegionLayers

      window.history.replaceState(
        {
          ...state,
          ...(carriedLayers !== undefined && { scrollRegionLayers: carriedLayers }),
          scrollRegions: data.scrollRegions ?? window.history.state?.scrollRegions,
          documentScrollPosition: data.documentScrollPosition ?? window.history.state?.documentScrollPosition,
        },
        '',
        url,
      )
    })
  }

  protected doPushState(
    data: {
      page: Page | ArrayBuffer
      scrollRegions?: ScrollRegion[]
      scrollRegionLayers?: (string | null)[]
      documentScrollPosition?: ScrollRegion
    },
    url: string,
  ): Promise<void> {
    return this.withThrottleProtection(() => {
      try {
        window.history.pushState(data, '', url)
      } catch (error) {
        if (this.isHistoryThrottleError(error)) {
          console.error(error.message)
          eventHandler.fireInternalEvent('historyEntryDropped', url)

          return
        }

        if (!this.isQuotaExceededError(error)) {
          throw error
        }

        eventHandler.fireInternalEvent('historyQuotaExceeded', url)
      }
    })
  }

  public getState<T>(key: keyof Page, defaultValue?: T): any {
    return this.current?.[key] ?? defaultValue
  }

  public deleteState(key: keyof Page) {
    if (this.current[key] !== undefined) {
      delete this.current[key]
      this.replaceState(this.current as Page)
    }
  }

  public clearInitialState(key: keyof Page) {
    if (this.initialState && this.initialState[key] !== undefined) {
      delete this.initialState[key]
    }
  }

  public browserHasHistoryEntry(): boolean {
    return !isServer && !!window.history.state?.page
  }

  public clear() {
    SessionStorage.remove(historySessionStorageKeys.key)
    SessionStorage.remove(historySessionStorageKeys.iv)
  }

  public setCurrent(page: Page): void {
    this.current = page
  }

  public isValidState(state: any): boolean {
    return !!state.page
  }

  public getAllState(): Page {
    return this.current as Page
  }
}

if (typeof window !== 'undefined' && window.history.scrollRestoration) {
  window.history.scrollRestoration = 'manual'
}

export const history = new History()
