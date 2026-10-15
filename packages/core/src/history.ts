import { cloneDeep, isEqual } from 'es-toolkit'
import { decryptHistory, encryptHistory, historySessionStorageKeys } from './encryption'
import { eventHandler } from './eventHandler'
import { page as currentPage } from './page'
import Queue from './queue'
import { SessionStorage } from './sessionStorage'
import { Page, ScrollRegion } from './types'

const isServer = typeof window === 'undefined'
const queue = new Queue<Promise<void>>()
const isChromeIOS = !isServer && /CriOS/.test(window.navigator.userAgent)

class History {
  public preserveUrl = false
  protected current: Partial<Page> = {}
  // The history entry decrypted before the first render, so a back/forward load can restore its remembered state
  protected initialPage: Page | null = null

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
      return currentPage.get()?.rememberedState?.[key]
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

      return data
    })
  }

  public decryptInitialPage(): Promise<Page> {
    return this.decrypt().then((page) => {
      this.initialPage = page

      return page
    })
  }

  public pullInitialPage(): Page | null {
    const page = this.initialPage

    this.initialPage = null

    return page
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
    if (isEqual(this.current, page)) {
      cb && cb()
      return
    }

    // Exclude flash from the merge to prevent callers (like router.remember())
    // from accidentally clearing flash data on the current page.
    const { flash, ...pageWithoutFlash } = page
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
      documentScrollPosition?: ScrollRegion
    },
    url?: string,
  ): Promise<void> {
    return this.withThrottleProtection(() => {
      try {
        window.history.replaceState(
          {
            ...data,
            scrollRegions: data.scrollRegions ?? window.history.state?.scrollRegions,
            documentScrollPosition: data.documentScrollPosition ?? window.history.state?.documentScrollPosition,
          },
          '',
          url,
        )
      } catch (error) {
        if (!this.isQuotaExceededError(error)) {
          throw error
        }

        // Unlike pushState, we don't reload here. replaceState runs on scroll, remember()
        // and partial reloads, so a reload would discard client state mid-interaction.
        console.error(error.message)
      }
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
    return this.withThrottleProtection(() => {
      try {
        window.history.pushState(data, '', url)
      } catch (error) {
        if (!this.isQuotaExceededError(error)) {
          throw error
        }

        eventHandler.fireInternalEvent('historyQuotaExceeded', url)
      }
    })
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
}

if (typeof window !== 'undefined' && window.history.scrollRestoration) {
  window.history.scrollRestoration = 'manual'
}

export const history = new History()
