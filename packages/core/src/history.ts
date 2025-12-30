import { cloneDeep, isEqual } from 'lodash-es'
import { decryptHistory, encryptHistory, historySessionStorageKeys } from './encryption'
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

  public remember(data: unknown, key: string): void {
    this.replaceState({
      ...currentPage.getWithoutFlashData(),
      rememberedState: {
        ...(currentPage.get()?.rememberedState ?? {}),
        [key]: data,
      },
    })
  }

  public restore(key: string): unknown {
    if (!isServer) {
      return this.current[this.rememberedState]?.[key] !== undefined
        ? this.current[this.rememberedState]?.[key]
        : this.initialState?.[this.rememberedState]?.[key]
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
        const doPush = () => this.doPushState({ page: data }, page.url).then(() => cb?.())

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
      structuredClone(page.props)
      return page
    } catch {
      // Props contain non-serializable data (e.g., Proxies, functions).
      // Clone them to ensure they can be safely stored in browser history.
      return {
        ...page,
        props: cloneDeep(page.props),
      }
    }
  }

  protected getPageData(page: Page): Promise<Page | ArrayBuffer> {
    const pageWithClonedProps = this.clonePageProps(page)

    return new Promise((resolve) => {
      return page.encryptHistory ? encryptHistory(pageWithClonedProps).then(resolve) : resolve(pageWithClonedProps)
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

  public saveScrollPositions(scrollRegions: ScrollRegion[]): void {
    queue.add(() => {
      return Promise.resolve().then(() => {
        if (!window.history.state?.page) {
          return
        }

        if (isEqual(this.getScrollRegions(), scrollRegions)) {
          return
        }

        return this.doReplaceState({
          page: window.history.state.page,
          scrollRegions,
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

  public getDocumentScrollPosition(): ScrollRegion {
    return window.history.state?.documentScrollPosition || { top: 0, left: 0 }
  }

  public replaceState(page: Page, cb: (() => void) | null = null): void {
    currentPage.merge(page)

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
        const doReplace = () => this.doReplaceState({ page: data }, page.url).then(() => cb?.())

        if (isChromeIOS) {
          return new Promise((resolve) => {
            setTimeout(() => doReplace().then(resolve))
          })
        }

        return doReplace()
      })
    })
  }

  protected isHistoryThrottleError(error: unknown): error is Error & { name: 'SecurityError' } {
    return (
      error instanceof Error &&
      error.name === 'SecurityError' &&
      (error.message.includes('history.pushState') || error.message.includes('history.replaceState'))
    )
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
      documentScrollPosition?: ScrollRegion
    },
    url?: string,
  ): Promise<void> {
    return this.withThrottleProtection(() => {
      window.history.replaceState(
        {
          ...data,
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
      documentScrollPosition?: ScrollRegion
    },
    url: string,
  ): Promise<void> {
    return this.withThrottleProtection(() => window.history.pushState(data, '', url))
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

  public hasAnyState(): boolean {
    return !!this.getAllState()
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
