import { decryptHistory, encryptHistory, historySessionStorageKeys } from './encryption'
import { page as currentPage } from './page'
import { SessionStorage } from './sessionStorage'
import { Page } from './types'

const isServer = typeof window === 'undefined'

export class History {
  public static rememberedState = 'rememberedState' as const
  public static scrollRegions = 'scrollRegions' as const
  public static preserveUrl = false
  protected static current: Partial<Page> = {}

  public static remember(data: unknown, key: string): void {
    History.replaceState({
      ...currentPage.get(),
      rememberedState: {
        ...(currentPage.get()?.rememberedState ?? {}),
        [key]: data,
      },
    })
  }

  public static restore(key: string): unknown {
    if (!isServer) {
      return History.getState<{ [key: string]: any }>(History.rememberedState, {})?.[key]
    }
  }

  public static pushState(page: Page): void {
    if (!History.preserveUrl) {
      History.current = page
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

  public static decrypt(page: Page | null = null): Promise<Page> {
    const pageData = page ?? window.history.state?.page

    const promise = pageData ? decryptHistory(pageData) : Promise.resolve(pageData)

    return promise.then((data) => {
      if (!data) {
        throw new Error('Unable to decrypt history')
      }

      History.current = data ?? {}

      return data
    })
  }

  public static replaceState(page: Page): void {
    currentPage.merge(page)

    if (!History.preserveUrl) {
      History.current = page
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

  public static getState<T>(key: keyof Page, defaultValue?: T): any {
    return History.current?.[key] ?? defaultValue
  }

  public static deleteState(key: keyof Page) {
    if (History.current[key] !== undefined) {
      delete History.current[key]
      History.replaceState(History.current as Page)
    }
  }

  public static hasAnyState(): boolean {
    return !!History.getAllState()
  }

  public static clear() {
    SessionStorage.remove(historySessionStorageKeys.key)
    SessionStorage.remove(historySessionStorageKeys.iv)
  }

  public static isValidState(state: any): boolean {
    return !!state.page
  }

  public static getAllState(): Page {
    return History.current as Page
  }
}
