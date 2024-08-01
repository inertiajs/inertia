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
      return this.getState<{ [key: string]: any }>(this.rememberedState, {})?.[key]
    }
  }

  public static pushState(page: Page): void {
    if (!History.preserveUrl) {
      window.history.pushState(
        {
          page,
          timestamp: Date.now(),
        },
        '',
        page.url,
      )
    }
  }

  public static replaceState(page: Page): void {
    currentPage.merge(page)

    if (!History.preserveUrl) {
      window.history.replaceState(
        {
          page,
          timestamp: Date.now(),
        },
        '',
        page.url,
      )
    }
  }

  public static getState<T>(key: string, defaultValue?: T): T {
    return window.history.state?.page?.[key] ?? defaultValue
  }

  public static deleteState(key: string) {
    if (window.history.state?.page?.[key] !== undefined) {
      delete window.history.state.page[key]
    }
  }

  public static hasAnyState(): boolean {
    return !!History.getAllState()
  }

  public static clear() {
    SessionStorage.set('historyClearedAt', Date.now())
  }

  public static isValidState(state: any): boolean {
    return state.page && !this.isExpired(state)
  }

  public static isExpired(state: { timestamp?: number }): boolean {
    const clearedAt = SessionStorage.get('historyClearedAt')

    return clearedAt && state.timestamp && state.timestamp < clearedAt
  }

  public static getAllState(): any {
    if (this.isExpired(window.history.state)) {
      return null
    }

    return window.history.state?.page
  }
}
