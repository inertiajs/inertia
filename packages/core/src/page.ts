import { eventHandler } from './eventHandler'
import { fireNavigateEvent } from './events'
import { history } from './history'
import { Scroll } from './scroll'
import {
  Component,
  Page,
  PageEvent,
  PageHandler,
  PageResolver,
  PreserveStateOption,
  RouterInitParams,
  VisitOptions,
} from './types'
import { hrefToUrl, isSameUrlWithoutHash } from './url'

class CurrentPage {
  protected page!: Page
  protected swapComponent!: PageHandler
  protected resolveComponent!: PageResolver
  protected componentId = {}
  protected listeners: {
    event: PageEvent
    callback: VoidFunction
  }[] = []
  protected isFirstPageLoad = true
  protected cleared = false

  public init({ initialPage, swapComponent, resolveComponent }: RouterInitParams) {
    this.page = initialPage
    this.swapComponent = swapComponent
    this.resolveComponent = resolveComponent

    return this
  }

  public set(
    page: Page,
    {
      replace = false,
      preserveScroll = false,
      preserveState = false,
    }: Partial<Pick<VisitOptions, 'replace' | 'preserveScroll' | 'preserveState'>> = {},
  ): Promise<void> {
    this.componentId = {}

    const componentId = this.componentId

    if (page.clearHistory) {
      history.clear()
    }

    return this.resolve(page.component).then((component) => {
      if (componentId !== this.componentId) {
        // Component has changed since we started resolving this component, bail
        return
      }

      page.scrollRegions ??= []
      page.rememberedState ??= {}
      const location = typeof window !== 'undefined' ? window.location : new URL(page.url)
      replace = replace || isSameUrlWithoutHash(hrefToUrl(page.url), location)

      replace ? history.replaceState(page) : history.pushState(page)

      const isNewComponent = !this.isTheSame(page)

      this.page = page
      this.cleared = false

      if (isNewComponent) {
        this.fireEventsFor('newComponent')
      }

      if (this.isFirstPageLoad) {
        this.fireEventsFor('firstLoad')
      }

      this.isFirstPageLoad = false

      return this.swap({ component, page, preserveState }).then(() => {
        if (!preserveScroll) {
          Scroll.reset(page)
        }

        eventHandler.fireInternalEvent('loadDeferredProps')

        if (!replace) {
          fireNavigateEvent(page)
        }
      })
    })
  }

  public setQuietly(
    page: Page,
    {
      preserveState = false,
    }: {
      preserveState?: PreserveStateOption
    } = {},
  ) {
    return this.resolve(page.component).then((component) => {
      this.page = page
      this.cleared = false
      return this.swap({ component, page, preserveState })
    })
  }

  public clear(): void {
    this.cleared = true
  }

  public isCleared(): boolean {
    return this.cleared
  }

  public get(): Page {
    return this.page
  }

  public merge(data: Partial<Page>): void {
    this.page = { ...this.page, ...data }
  }

  public setUrlHash(hash: string): void {
    this.page.url += hash
  }

  public remember(data: Page['rememberedState']): void {
    this.page.rememberedState = data
  }

  public scrollRegions(regions: Page['scrollRegions']): void {
    this.page.scrollRegions = regions
  }

  public swap({
    component,
    page,
    preserveState,
  }: {
    component: Component
    page: Page
    preserveState: PreserveStateOption
  }): Promise<unknown> {
    return this.swapComponent({ component, page, preserveState })
  }

  public resolve(component: string): Promise<Component> {
    return Promise.resolve(this.resolveComponent(component))
  }

  public isTheSame(page: Page): boolean {
    return this.page.component === page.component
  }

  public on(event: PageEvent, callback: VoidFunction): VoidFunction {
    this.listeners.push({ event, callback })

    return () => {
      this.listeners = this.listeners.filter((listener) => listener.event !== event && listener.callback !== callback)
    }
  }

  public fireEventsFor(event: PageEvent): void {
    this.listeners.filter((listener) => listener.event === event).forEach((listener) => listener.callback())
  }
}

export const page = new CurrentPage()
