import { page as currentPage } from './page'
import { Page } from './types'

const isServer = typeof window === 'undefined'

export class History {
  public static rememberedState = 'rememberedState'
  public static scrollRegions = 'scrollRegions'

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
    window.history.pushState(History.pageData(page), '', page.url)
  }

  public static replaceState(page: Page): void {
    currentPage.merge(page)
    window.history.replaceState(History.pageData(page), '', page.url)
  }

  protected static pageData(page: Page): Omit<Page, 'meta'> {
    const { meta, ...remaining } = page

    return remaining
  }

  public static setState(key: string, value: any) {
    window.history.state[key] = value
  }

  public static getState<T>(key: string, defaultValue?: T): T {
    return window.history.state?.[key] ?? defaultValue
  }

  public static deleteState(key: string) {
    if (window.history.state?.[key] !== undefined) {
      delete window.history.state[key]
    }
  }

  public static hasAnyState(): boolean {
    return !!History.getAllState()
  }

  public static getAllState(): any {
    return window.history.state
  }
}
