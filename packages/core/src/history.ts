import deepmerge from 'deepmerge'
import { decryptHistory, encryptHistory, historySessionStorageKeys } from './encryption'
import { page as currentPage } from './page'
import { SessionStorage } from './sessionStorage'
import { Page } from './types'

const isServer = typeof window === 'undefined'

export class History {
  public rememberedState = 'rememberedState' as const
  public scrollRegions = 'scrollRegions' as const
  public preserveUrl = false
  public static encryptHistory = false
  
  protected current: Partial<Page> = {}
  protected queue: (() => Promise<void>)[] = []


  public remember(frame: string, data: unknown, key: string): void {
    const old = currentPage.get()
    const newState = deepmerge(old, {
      frames: {[frame]: {rememberedState: {[key]: data}}}
    }, {arrayMerge: (_,s) => s})
    
    this.replaceState(newState)
  }

  public restore(frame: string, key: string): unknown {
    if (!isServer) {
      const frameState = this.current?.frames?.[frame]
      return frameState?.rememberedState?.[key]
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
          page.frames["_top"].url,
        )
      })
    })
  }

  protected getPageData(page: Page): Promise<Page | ArrayBuffer> {
    return new Promise((resolve) => {
      return History.encryptHistory ? encryptHistory(page).then(resolve) : resolve(page)
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
  
      this.current = data ?? {}
      

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
          page.frames["_top"].url,
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

  public deleteRememberedState() {
    if (!this.current.frames) return
    Object.values((this.current as Page).frames).forEach((frame) => {
      delete frame.rememberedState
    })
    this.replaceState(this.current as Page)
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
