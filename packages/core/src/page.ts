import { cloneDeep, get, set } from 'lodash-es'
import { eventHandler } from './eventHandler'
import { fireNavigateEvent } from './events'
import { history } from './history'
import { prefetchedRequests } from './prefetched'
import { Scroll } from './scroll'
import { Component, FlashData, Page, PageEvent, PageHandler, PageResolver, RouterInitParams, Visit } from './types'
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
  protected historyQuotaExceeded = false
  protected optimisticBaseline: Partial<Page['props']> = {}
  protected pendingOptimistics: { id: number; callback: (props: Page['props']) => Partial<Page['props']> | void }[] = []
  protected optimisticCounter = 0

  public init<ComponentType = Component>({
    initialPage,
    swapComponent,
    resolveComponent,
    onFlash,
  }: RouterInitParams<ComponentType>) {
    this.page = { ...initialPage, flash: initialPage.flash ?? {} }
    this.swapComponent = swapComponent
    this.resolveComponent = resolveComponent
    this.onFlashCallback = onFlash

    eventHandler.on('historyQuotaExceeded', () => {
      this.historyQuotaExceeded = true
    })

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

      // Preserve original deferred props for back button handling
      if (page.initialDeferredProps === undefined) {
        page.initialDeferredProps = page.deferredProps
      }
    }

    this.componentId = {}

    const componentId = this.componentId

    if (page.clearHistory) {
      history.clear()
    }

    return this.resolve(page.component, page).then((component) => {
      if (componentId !== this.componentId) {
        // Component has changed since we started resolving this component, bail
        return
      }

      page.rememberedState ??= {}

      const isServer = typeof window === 'undefined'
      const location = !isServer ? window.location : new URL(page.url)
      const scrollRegions = !isServer && preserveScroll ? Scroll.getScrollRegions() : []
      replace = replace || isSameUrlWithoutHash(hrefToUrl(page.url), location)

      // Clear flash data from the page object, we don't want it when navigating back/forward...
      const pageForHistory = { ...page, flash: {} }

      return new Promise<void>((resolve) =>
        replace ? history.replaceState(pageForHistory, resolve) : history.pushState(pageForHistory, resolve),
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

        if (this.historyQuotaExceeded) {
          // If we exceeded the history quota, don't attempt to swap the
          // component as we're performing a full page reload instead.
          this.historyQuotaExceeded = false
          return
        }

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
    return this.resolve(page.component, page).then((component) => {
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
    return { ...this.page, flash: {} }
  }

  public hasOnceProps(): boolean {
    return Object.keys(this.page.onceProps ?? {}).length > 0
  }

  public merge(data: Partial<Page>): void {
    this.page = { ...this.page, ...data }
  }

  public setPropsQuietly(props: Page['props']): Promise<unknown> {
    this.page = { ...this.page, props }

    return this.resolve(this.page.component, this.page).then((component) => {
      return this.swap({ component, page: this.page, preserveState: true, viewTransition: false })
    })
  }

  public setFlash(flash: FlashData): void {
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

    if (!viewTransition || !document?.startViewTransition || document.visibilityState === 'hidden') {
      return doSwap()
    }

    const viewTransitionCallback = typeof viewTransition === 'boolean' ? () => null : viewTransition

    return new Promise((resolve) => {
      const transitionResult = document.startViewTransition(() => doSwap().then(resolve))

      viewTransitionCallback(transitionResult)
    })
  }

  public resolve(component: string, page?: Page): Promise<Component> {
    return Promise.resolve(this.resolveComponent(component, page))
  }

  public nextOptimisticId(): number {
    return ++this.optimisticCounter
  }

  public setBaseline(key: string, value: unknown): void {
    if (!(key in this.optimisticBaseline)) {
      this.optimisticBaseline[key] = value
    }
  }

  public updateBaseline(key: string, value: unknown): void {
    if (key in this.optimisticBaseline) {
      this.optimisticBaseline[key] = value
    }
  }

  public hasBaseline(key: string): boolean {
    return key in this.optimisticBaseline
  }

  public registerOptimistic(id: number, callback: (props: Page['props']) => Partial<Page['props']> | void): void {
    this.pendingOptimistics.push({ id, callback })
  }

  public unregisterOptimistic(id: number): void {
    this.pendingOptimistics = this.pendingOptimistics.filter((entry) => entry.id !== id)
  }

  public replayOptimistics(): Partial<Page['props']> {
    const baselineKeys = Object.keys(this.optimisticBaseline)

    if (baselineKeys.length === 0) {
      return {}
    }

    const props = cloneDeep(this.page.props)

    for (const key of baselineKeys) {
      props[key] = cloneDeep(this.optimisticBaseline[key])
    }

    for (const { callback } of this.pendingOptimistics) {
      const result = callback(cloneDeep(props))

      if (result) {
        Object.assign(props, result)
      }
    }

    const replayedProps: Partial<Page['props']> = {}

    for (const key of baselineKeys) {
      replayedProps[key] = props[key]
    }

    return replayedProps
  }

  public pendingOptimisticCount(): number {
    return this.pendingOptimistics.length
  }

  public clearOptimisticState(): void {
    this.optimisticBaseline = {}
    this.pendingOptimistics = []
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

      if (force || get(response.props, onceProp.prop) === undefined) {
        set(response.props, onceProp.prop, get(this.page.props, existingOnceProp.prop))
        response.onceProps![key].expiresAt = existingOnceProp.expiresAt
      }
    })
  }
}

export const page = new CurrentPage()
