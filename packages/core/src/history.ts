import { decryptHistory, encryptHistory, historySessionStorageKeys } from './encryption'
import { page as currentPage } from './page'
import { SessionStorage } from './sessionStorage'
import { Page } from './types'

const isServer = typeof window === 'undefined'

class History {
  public rememberedState = 'rememberedState' as const
  public scrollRegions = 'scrollRegions' as const
  public preserveUrl = false
  protected current: Partial<Page> = {}
  protected queue: (() => Promise<void>)[] = []
  // We need initialState for `restore`
  protected initialState: Partial<Page> | null = null

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
            timestamp: Date.now(),
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

  public processQueue(): Promise<void> {
    const next = this.queue.shift()

    if (next) {
      return next().then(() => this.processQueue())
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

  public replaceState(page: Page): void {
    currentPage.merge(page)

    if (isServer || this.preserveUrl) {
      return
    }

    this.current = page

    this.addToQueue(() => {
      return this.getPageData(page).then((data) => {
        window.history.replaceState(
          {
            page: data,
            timestamp: Date.now(),
          },
          '',
          page.url,
        )
      })
    })
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

export const history = new History()
