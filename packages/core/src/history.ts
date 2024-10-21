import { decryptHistory, encryptHistory, historySessionStorageKeys } from './encryption'
import { page as currentPage } from './page'
import { SessionStorage } from './sessionStorage'
import { Page, ScrollRegion } from './types'

const isServer = typeof window === 'undefined'

class History {
  public rememberedState = 'rememberedState' as const
  public scrollRegions = 'scrollRegions' as const
  public preserveUrl = false
  protected current: Partial<Page> = {}
  protected queue: (() => Promise<void>)[] = []
  // We need initialState for `restore`
  protected initialState: Partial<Page> | null = null
  protected processingQueue = false

  public remember(data: unknown, key: string): void {
    this.replaceState({
      ...currentPage.get(),
      rememberedState: {
        ...(currentPage.get()?.rememberedState ?? {}),
        [key]: data,
      },
    })
  }

  public restore(key: string): unknown {
    if (!isServer) {
      return this.initialState?.[this.rememberedState]?.[key]
    }
  }

  public pushState(page: Page): void {
    if (isServer || this.preserveUrl) {
      return
    }

    this.current = page

    this.addToQueue(() => {
      return this.getPageData(page).then((data) => {
        window.history.pushState(
          {
            page: data,
          },
          '',
          page.url,
        )
      })
    })
  }

  protected getPageData(page: Page): Promise<Page | ArrayBuffer> {
    return new Promise((resolve) => {
      return page.encryptHistory ? encryptHistory(page).then(resolve) : resolve(page)
    })
  }

  public processQueue(): void {
    if (this.processingQueue) {
      return
    }

    this.processingQueue = true

    this.processNext().then(() => {
      this.processingQueue = false
    })
  }

  protected processNext(): Promise<void> {
    const next = this.queue.shift()

    if (next) {
      return next().then(() => this.processNext())
    }

    return Promise.resolve()
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
    this.addToQueue(() => {
      return Promise.resolve().then(() => {
        this.doReplaceState(
          {
            page: window.history.state.page,
            scrollRegions,
          },
          this.current.url!,
        )
      })
    })
  }

  public saveDocumentScrollPosition(scrollRegion: ScrollRegion): void {
    this.addToQueue(() => {
      return Promise.resolve().then(() => {
        this.doReplaceState(
          {
            page: window.history.state.page,
            documentScrollPosition: scrollRegion,
          },
          this.current.url!,
        )
      })
    })
  }

  public getScrollRegions(): ScrollRegion[] {
    return window.history.state.scrollRegions || []
  }

  public getDocumentScrollPosition(): ScrollRegion {
    return window.history.state.documentScrollPosition || { top: 0, left: 0 }
  }

  public replaceState(page: Page): void {
    currentPage.merge(page)

    if (isServer || this.preserveUrl) {
      return
    }

    this.current = page

    this.addToQueue(() => {
      return this.getPageData(page).then((data) => {
        this.doReplaceState(
          {
            page: data,
          },
          page.url,
        )
      })
    })
  }

  protected doReplaceState(
    data: {
      page: Page | ArrayBuffer
      scrollRegions?: ScrollRegion[]
      documentScrollPosition?: ScrollRegion
    },
    url: string,
  ): void {
    window.history.replaceState(
      {
        ...data,
        scrollRegions: data.scrollRegions ?? window.history.state?.scrollRegions,
        documentScrollPosition: data.documentScrollPosition ?? window.history.state?.documentScrollPosition,
      },
      '',
      url,
    )
  }

  protected addToQueue(fn: () => Promise<void>): void {
    this.queue.push(fn)
    this.processQueue()
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

  public hasAnyState(): boolean {
    return !!this.getAllState()
  }

  public clear() {
    SessionStorage.remove(historySessionStorageKeys.key)
    SessionStorage.remove(historySessionStorageKeys.iv)
  }

  public isValidState(state: any): boolean {
    return !!state.page
  }

  public getAllState(): Page {
    return this.current as Page
  }
}

if (window.history.scrollRestoration) {
  window.history.scrollRestoration = 'manual'
}

export const history = new History()
