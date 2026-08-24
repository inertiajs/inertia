import { get } from 'es-toolkit/compat'
import debounce from './debounce'
import { fireNavigateEvent } from './events'
import { history } from './history'
import { router } from './index'
import {
  layerClosing,
  layerDismissedByRestore,
  layersOf,
  recordHistoryEntry,
  restoreKeepsBase,
  withAddressHash,
} from './layers'
import { page as currentPage } from './page'
import { Scroll } from './scroll'
import { GlobalEvent, GlobalEventNames, GlobalEventResult, InternalEvent, LayerState } from './types'

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
    layerClosing.settleUnwind()
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
    const state = event.state || null

    if (state === null) {
      // An entry the browser wrote itself, usually for an in-page anchor. It stands between the
      // stack and the entry beneath it, so closing a layer has one more step to take back.
      layerClosing.settleUnwind()
      history.replaceState(withAddressHash(recordHistoryEntry(currentPage.getWithoutFlashData()), window.location.hash))
      Scroll.reset()

      return
    }

    if (!history.isValidState(state)) {
      return this.onMissingHistoryItem()
    }

    history
      .decrypt(state.page)
      .then((data) => {
        if (currentPage.get().version !== data.version) {
          this.onMissingHistoryItem()
          return
        }

        // A close's unwind steps back onto the page that is staying, so anything in flight for it
        // belongs to the page coming back. A genuine back navigates away, and takes its requests.
        const unwindingOntoTheSamePage = layerClosing.isUnwinding() && currentPage.isTheSame(data)

        if (!unwindingOntoTheSamePage) {
          // Cancel ongoing requests except prefetch requests
          router.cancelAll({ prefetch: false })
        }

        if (layerClosing.unwindLandsItself()) {
          layerClosing.settleUnwind()
          return
        }

        if (data.component === '') {
          layerClosing.settleUnwind()
          router.visit(data.url, { replace: true, preserveScroll: true, preserveState: true })
          return
        }

        // Back over a single layer dismisses it, so it leaves like every other dismissal: marked,
        // given its exit, taken off once the shell reports.
        const dismissed = layerClosing.isUnwinding() ? undefined : layerDismissedByRestore(currentPage.get(), data)
        const dismissal =
          dismissed && !layerClosing.isClosing(dismissed.id)
            ? layerClosing.close(dismissed.id, { absorbed: true })
            : Promise.resolve()

        // The restore lands on the page already on screen, so remounting it would throw its state away.
        const landsOnThePageOnScreen =
          unwindingOntoTheSamePage || !!dismissed || restoreKeepsBase(currentPage.get(), data)

        dismissal
          .then(() => currentPage.setQuietly(data, { preserveState: landsOnThePageOnScreen }))
          .then(() => {
            layerClosing.settleUnwind()
            Scroll.restore(history.getScrollRegions())
            fireNavigateEvent(currentPage.get())

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
          })
      })
      .catch(() => {
        this.onMissingHistoryItem()
      })
  }
}

export const eventHandler = new EventHandler()
