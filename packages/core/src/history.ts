import { decryptHistory, encryptHistory, historySessionStorageKeys } from './encryption'
import { page as currentPage } from './page'
import { SessionStorage } from './sessionStorage'
import { Page } from './types'

const isServer = typeof window === 'undefined'

export class History {
  public static rememberedState = 'rememberedState'
  public static scrollRegions = 'scrollRegions'
  public static preserveUrl = false

  public static remember(data: unknown, key: string): void {
    this.replaceState({
      ...currentPage.get(),
      rememberedState: {
        ...(currentPage.get()?.rememberedState ?? {}),
        [key]: data,
      },
    })
  }

  public static restore(key: string): unknown {
    if (!isServer) {
      return this.getState<{ [key: string]: any }>(this.rememberedState, {}).then((data) => data?.[key])
    }
  }

  public static pushState(page: Page): void {
    if (!History.preserveUrl) {
      encryptHistory(page).then((data) => {
        window.history.pushState(
          {
            page: data,
            timestamp: Date.now(),
          },
          '',
          page.url,
        )
      })
    }
  }

  public static replaceState(page: Page): void {
    currentPage.merge(page)

    if (!History.preserveUrl) {
      encryptHistory(page).then((data) => {
        window.history.replaceState(
          {
            page: data,
            timestamp: Date.now(),
          },
          '',
          page.url,
        )
      })
    }
  }

  public static getState<T>(key: string, defaultValue?: T): Promise<T> {
    return this.getAllState().then((data) => {
      return data?.[key] ?? defaultValue
    })
  }

  public static deleteState(key: string) {
    this.getAllState().then((data) => {
      if (data?.[key] !== undefined) {
        delete data[key]
        this.replaceState(data)
      }
    })
  }

  public static hasAnyState(): boolean {
    return !!History.getAllState()
  }

  public static clear() {
    SessionStorage.remove(historySessionStorageKeys.key)
    SessionStorage.remove(historySessionStorageKeys.iv)
  }

  public static isValidState(state: any): boolean {
    return state.page
  }

  public static getAllState(): Promise<any> {
    const pageData = window.history.state?.page

    return pageData ? decryptHistory(pageData) : Promise.resolve(pageData)
  }
}
