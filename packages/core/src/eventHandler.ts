import { get } from 'es-toolkit/compat'
import debounce from './debounce'
import { fireNavigateEvent } from './events'
import { history } from './history'
import { router } from './index'
import { isBlankBase, layersOf, recordHistoryEntry, withAddressHash } from './layers'
import { layerClosing } from './layers/closing'
import { recoverBlankBase } from './layers/walk'
import { page as currentPage } from './page'
import { Scroll } from './scroll'
import { GlobalEvent, GlobalEventNames, GlobalEventResult, InternalEvent, LayerState, Page } from './types'

class EventHandler {
  protected internalListeners: {
    event: InternalEvent
    listener: (...args: any[]) => void
  }[] = []

  public init() {
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', this.handlePopstateEvent.bind(this))
      window.addEventListener('pageshow', this.handlePageshowEvent.bind(this))
      window.addEventListener('scroll', debounce(Scroll.onWindowScroll.bind(Scroll), 100), true)
    }

    if (typeof document !== 'undefined') {
      document.addEventListener('scroll', debounce(Scroll.onScroll.bind(Scroll), 100), true)
    }
  }

  public onGlobalEvent<TEventName extends GlobalEventNames>(
    type: TEventName,
    callback: (event: GlobalEvent<TEventName>) => GlobalEventResult<TEventName>,
  ): VoidFunction {
    const listener = ((event: GlobalEvent<TEventName>) => {
      const response = callback(event)

      if (event.cancelable && !event.defaultPrevented && response === false) {
        event.preventDefault()
      }
    }) as EventListener

    return this.registerListener(`inertia:${type}`, listener)
  }

  public on(event: InternalEvent, callback: (...args: any[]) => void): VoidFunction {
    this.internalListeners.push({ event, listener: callback })

    return () => {
      this.internalListeners = this.internalListeners.filter((listener) => listener.listener !== callback)
    }
  }

  public onMissingHistoryItem() {
    // At this point, the user has probably cleared the state
    // Mark the current page as cleared so that we don't try to write anything to it.
    currentPage.clear()
    // Fire an event so that that any listeners can handle this situation
    this.fireInternalEvent('missingHistoryItem')
  }

  public fireInternalEvent(event: InternalEvent, ...args: any[]): void {
    this.internalListeners
      .filter((listener) => listener.event === event)
      .forEach((listener) => listener.listener(...args))
  }

  protected registerListener(type: string, listener: EventListener): VoidFunction {
    document.addEventListener(type, listener)

    return () => document.removeEventListener(type, listener)
  }

  // bfcache restores pages without firing `popstate`, so we use `pageshow` to
  // re-validate encrypted history entries after `clearHistory` removed the keys.
  // https://web.dev/articles/bfcache
  protected handlePageshowEvent(event: PageTransitionEvent): void {
    if (event.persisted) {
      history.decrypt().catch(() => this.onMissingHistoryItem())
    }
  }

  protected handlePopstateEvent(event: PopStateEvent): void {
    this.restoreFromPopstate(event.state || null)
      .catch(() => this.onMissingHistoryItem())
      .finally(() => layerClosing.unwound())
  }

  protected async restoreFromPopstate(state: { page: Page } | null): Promise<void> {
    if (state === null) {
      // An entry the browser wrote itself (an in-page anchor), so a closing layer has one more step to take back.
      history.replaceState(withAddressHash(recordHistoryEntry(currentPage.getWithoutFlashData()), window.location.hash))
      Scroll.reset()

      return
    }

    if (!history.isValidState(state)) {
      return this.onMissingHistoryItem()
    }

    return this.restoreEntry(await history.decrypt(state.page))
  }

  protected restoreEntry(data: Page): Promise<void> | void {
    if (currentPage.get().version !== data.version) {
      return this.onMissingHistoryItem()
    }

    const restore = layerClosing.restoring(data)

    if (!restore.sameStack) {
      // Cancel ongoing requests except prefetch requests
      router.cancelAll({ prefetch: false })
    }

    if (restore.landsItself) {
      return
    }

    if (isBlankBase(data)) {
      return recoverBlankBase(data.url)
    }

    return restore.install().then(() => {
      Scroll.restore(history.getScrollRegions())
      fireNavigateEvent(currentPage.get())

      this.loadDeferredPropsFor(data)
    })
  }

  protected loadDeferredPropsFor(data: Page): void {
    for (const tier of [data, ...layersOf(data)]) {
      const pendingDeferred: Record<string, string[]> = {}

      for (const [group, props] of Object.entries(tier.initialDeferredProps ?? tier.deferredProps ?? {})) {
        const missing = props.filter((prop) => get(tier.props, prop) === undefined)

        if (missing.length > 0) {
          pendingDeferred[group] = missing
        }
      }

      if (Object.keys(pendingDeferred).length > 0) {
        this.fireInternalEvent('loadDeferredProps', {
          deferredProps: pendingDeferred,
          layerId: (tier as LayerState).id,
        })
      }
    }
  }
}

export const eventHandler = new EventHandler()
