import { eventHandler } from './eventHandler'
import { fireFlashEvent, fireNavigateEvent } from './events'
import { history } from './history'
import { missingBase } from './layers'
import { navigationType } from './navigationType'
import { page as currentPage } from './page'
import { walkTo } from './response'
import { Scroll } from './scroll'
import { SessionStorage } from './sessionStorage'
import { LocationVisit, Page } from './types'
import { uid } from './uid'

export class InitialVisit {
  public static handle(): void {
    this.clearRememberedStateOnReload()

    const scenarios = [this.handleBackForward, this.handleLocation, this.handleDefault]

    scenarios.find((handler) => handler.bind(this)())
  }

  protected static clearRememberedStateOnReload(): void {
    if (navigationType.isReload()) {
      history.deleteState(history.rememberedState)
      history.clearInitialState(history.rememberedState)
    }
  }

  protected static handleBackForward(): boolean {
    if (!navigationType.isBackForward() || !history.browserHasHistoryEntry()) {
      return false
    }

    const scrollRegions = history.getScrollRegions()

    history
      .decrypt()
      .then((data) => {
        const visitId = uid()

        // A restore never adds an entry, not even where the stack it brings back opens layers.
        currentPage.set(data, { replace: true, preserveScroll: true, preserveState: true, visitId }).then(() => {
          Scroll.restore(scrollRegions)
          fireNavigateEvent(currentPage.get(), { visitId })
        })
      })
      .catch(() => {
        eventHandler.onMissingHistoryItem()
      })

    return true
  }

  /**
   * @link https://inertiajs.com/redirects#external-redirects
   */
  protected static handleLocation(): boolean {
    if (!SessionStorage.exists(SessionStorage.locationVisitKey)) {
      return false
    }

    const locationVisit: LocationVisit = SessionStorage.get(SessionStorage.locationVisitKey) || {}

    SessionStorage.remove(SessionStorage.locationVisitKey)

    history
      .decrypt(currentPage.get())
      .then(() => {
        const visitId = uid()
        const rememberedState = history.getState<Page['rememberedState']>(history.rememberedState, {})
        const scrollRegions = history.getScrollRegions()
        currentPage.remember(rememberedState)

        this.setInitialPage({ preserveScroll: locationVisit.preserveScroll, visitId }).then(() => {
          if (locationVisit.preserveScroll) {
            Scroll.restore(scrollRegions)
          }

          this.fireInitialEvents(visitId)
        })
      })
      .catch(() => {
        eventHandler.onMissingHistoryItem()
      })

    return true
  }

  protected static handleDefault(): void {
    const visitId = uid()

    this.setInitialPage({ preserveScroll: true, visitId }).then(() => {
      if (navigationType.isReload()) {
        Scroll.restore(history.getScrollRegions())
      } else {
        Scroll.scrollToAnchor()
      }

      this.fireInitialEvents(visitId)
    })
  }

  protected static setInitialPage({
    preserveScroll,
    visitId,
  }: {
    preserveScroll?: boolean
    visitId: string
  }): Promise<void> {
    const page = currentPage.get()
    const base = missingBase(page)

    return currentPage.set(page, { preserveScroll, preserveState: true, initialRender: true, visitId }).then(() => {
      if (base !== undefined && typeof window !== 'undefined') {
        walkTo(base)
      }
    })
  }

  protected static fireInitialEvents(visitId: string): void {
    const page = currentPage.get()

    fireNavigateEvent(page, { visitId })

    if (Object.keys(page.flash).length > 0) {
      queueMicrotask(() => fireFlashEvent(page.flash))
    }
  }
}
