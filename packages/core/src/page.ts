import { eventHandler } from './eventHandler'
import { fireNavigateEvent } from './events'
import { history } from './history'
import { prefetchedRequests } from './prefetched'
import { Scroll } from './scroll'
import { Component, Page, PageEvent, PageHandler, PageResolver, RouterInitParams, Visit } from './types'
import { hrefToUrl, isSameUrlWithoutHash } from './url'

class CurrentPage {
  protected page!: Page
  protected swapComponent!: PageHandler<any>
  protected resolveComponent!: PageResolver
  protected onFlashCallback?: (flash: Page['flash']) => void
  protected componentId = {}
  protected listeners: {
    event: PageEvent
    callback: VoidFunction
  }[] = []
  protected isFirstPageLoad = true
  protected cleared = false
  protected pendingDeferredProps: Pick<Page, 'deferredProps' | 'url' | 'component'> | null = null

  public init<ComponentType = Component>({
    initialPage,
    swapComponent,
    resolveComponent,
    onFlash,
  }: RouterInitParams<ComponentType>) {
    this.page = initialPage
    this.swapComponent = swapComponent
    this.resolveComponent = resolveComponent
    this.onFlashCallback = onFlash

    return this
  }

  public set(
    page: Page,
    {
      replace = false,
      preserveScroll = false,
      preserveState = false,
      viewTransition = false,
    }: {
      replace?: boolean
      preserveScroll?: boolean
      preserveState?: boolean
      viewTransition?: Visit['viewTransition']
    } = {},
  ): Promise<void> {
    if (Object.keys(page.deferredProps || {}).length) {
      this.pendingDeferredProps = {
        deferredProps: page.deferredProps,
        component: page.component,
        url: page.url,
      }
    }

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

      page.rememberedState ??= {}

      const isServer = typeof window === 'undefined'
      const location = !isServer ? window.location : new URL(page.url)
      const scrollRegions = !isServer && preserveScroll ? history.getScrollRegions() : []
      replace = replace || isSameUrlWithoutHash(hrefToUrl(page.url), location)

      // Strip flash data from the page object, we don't want it when navigating back/forward...
      const { flash, ...pageWithoutFlash } = page

      return new Promise<void>((resolve) =>
        replace ? history.replaceState(pageWithoutFlash, resolve) : history.pushState(pageWithoutFlash, resolve),
      ).then(() => {
        const isNewComponent = !this.isTheSame(page)

        if (!isNewComponent && Object.keys(page.props.errors || {}).length > 0) {
          // Don't use view transition if the page stays the same and there are (new) errors...
          viewTransition = false
        }

        this.page = page
        this.cleared = false

        if (this.hasOnceProps()) {
          prefetchedRequests.updateCachedOncePropsFromCurrentPage()
        }

        if (isNewComponent) {
          this.fireEventsFor('newComponent')
        }

        if (this.isFirstPageLoad) {
          this.fireEventsFor('firstLoad')
        }

        this.isFirstPageLoad = false

        return this.swap({
          component,
          page,
          preserveState,
          viewTransition,
        }).then(() => {
          if (preserveScroll) {
            // Scroll regions must be explicitly restored since the DOM elements are destroyed
            // and recreated during the component 'swap'. Document scroll is naturally
            // preserved as the document element itself persists across navigations.
            window.requestAnimationFrame(() => Scroll.restoreScrollRegions(scrollRegions))
          } else {
            Scroll.reset()
          }

          if (
            this.pendingDeferredProps &&
            this.pendingDeferredProps.component === page.component &&
            this.pendingDeferredProps.url === page.url
          ) {
            eventHandler.fireInternalEvent('loadDeferredProps', this.pendingDeferredProps.deferredProps)
          }

          this.pendingDeferredProps = null

          if (!replace) {
            fireNavigateEvent(page)
          }
        })
      })
    })
  }

  public setQuietly(
    page: Page,
    {
      preserveState = false,
    }: {
      preserveState?: boolean
    } = {},
  ) {
    return this.resolve(page.component).then((component) => {
      this.page = page
      this.cleared = false
      history.setCurrent(page)
      return this.swap({ component, page, preserveState, viewTransition: false })
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

  public getWithoutFlashData(): Page {
    const { flash, ...page } = this.page

    return page
  }

  public hasOnceProps(): boolean {
    return Object.keys(this.page.onceProps ?? {}).length > 0
  }

  public merge(data: Partial<Page>): void {
    this.page = { ...this.page, ...data }
  }

  public setFlash(flash: Page['flash']): void {
    this.page = { ...this.page, flash }
    this.onFlashCallback?.(flash)
  }

  public setUrlHash(hash: string): void {
    if (!this.page.url.includes(hash)) {
      this.page.url += hash
    }
  }

  public remember(data: Page['rememberedState']): void {
    this.page.rememberedState = data
  }

  public swap({
    component,
    page,
    preserveState,
    viewTransition,
  }: {
    component: Component
    page: Page
    preserveState: boolean
    viewTransition: Visit['viewTransition']
  }): Promise<unknown> {
    const doSwap = () => this.swapComponent({ component, page, preserveState })

    if (!viewTransition || !document?.startViewTransition) {
      return doSwap()
    }

    const viewTransitionCallback = typeof viewTransition === 'boolean' ? () => null : viewTransition

    return new Promise((resolve) => {
      const transitionResult = document.startViewTransition(() => doSwap().then(resolve))

      viewTransitionCallback(transitionResult)
    })
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

  public mergeOncePropsIntoResponse(response: Page, { force = false }: { force?: boolean } = {}): void {
    Object.entries(response.onceProps ?? {}).forEach(([key, onceProp]) => {
      const existingOnceProp = this.page.onceProps?.[key]

      if (existingOnceProp === undefined) {
        return
      }

      if (force || response.props[onceProp.prop] === undefined) {
        response.props[onceProp.prop] = this.page.props[existingOnceProp.prop]
        response.onceProps![key].expiresAt = existingOnceProp.expiresAt
      }
    })
  }
}

export const page = new CurrentPage()
