import { nanoid } from 'nanoid'
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
    const id = nanoid()

    if (!History.preserveUrl) {
      window.history.pushState({ id }, '', page.url)
    }

    SessionStorage.set(id, page)
  }

  public static replaceState(page: Page): void {
    const id = this.id() ?? nanoid()

    currentPage.merge(page)

    if (!History.preserveUrl) {
      window.history.replaceState({ id }, '', page.url)
    }

    SessionStorage.set(id, page)
  }

  public static setState(key: string, value: any) {
    return this.whenHasId((id) => {
      SessionStorage.merge(id, { [key]: value })
    })
  }

  public static getState<T>(key: string, defaultValue?: T): T {
    return this.whenHasId(
      (id) => SessionStorage.get(id)?.[key] ?? defaultValue,
      () => defaultValue,
    )
  }

  public static deleteState(key: string) {
    this.whenHasId((id) => {
      SessionStorage.removeNested(id, key)
    })
  }

  public static hasAnyState(): boolean {
    return this.whenHasId(
      (id) => SessionStorage.exists(id),
      () => false,
    )
  }

  public static clear() {
    SessionStorage.clear()
  }

  protected static id(): string | undefined {
    return window.history.state?.id
  }

  protected static whenHasId(callback: (id: string) => any, noIdCallback: VoidFunction = () => {}) {
    const id = this.id()

    return id ? callback(id) : noIdCallback()
  }

  public static getAllState(id?: string): any {
    id ??= this.id()

    if (id) {
      return SessionStorage.get(id)
    }

    return {}
  }
}
