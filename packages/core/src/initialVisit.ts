import { eventHandler } from './eventHandler'
import { fireFlashEvent, fireNavigateEvent } from './events'
import { history } from './history'
import { navigationType } from './navigationType'
import { page as currentPage } from './page'
import { Scroll } from './scroll'
import { SessionStorage } from './sessionStorage'
import { LocationVisit } from './types'
import { uid } from './uid'

export class InitialVisit {
  public static handle(): void {
    this.restoreRememberedState()

    const scenarios = [this.handleBackForward, this.handleLocation, this.handleDefault]

    scenarios.find((handler) => handler.bind(this)())
  }

  protected static restoreRememberedState(): void {
    const initialPage = history.pullInitialPage()

    if (navigationType.isBackForward() && initialPage?.version === currentPage.get().version) {
      currentPage.remember(initialPage.rememberedState ?? {})
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
        if (currentPage.get().version !== data.version) {
          this.handleDefault()
          return
        }

        const visitId = uid()

        currentPage.set(data, { preserveScroll: true, preserveState: true, visitId }).then(() => {
          Scroll.restore(scrollRegions)
          fireNavigateEvent(currentPage.get(), { type: 'history', visitId })
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

    if (typeof window !== 'undefined') {
      currentPage.setUrlHash(window.location.hash)
    }

    const visitId = uid()
    const scrollRegions = history.getScrollRegions()

    currentPage
      .set(currentPage.get(), {
        preserveScroll: locationVisit.preserveScroll,
        preserveState: true,
        initialRender: true,
        visitId,
      })
      .then(() => {
        if (locationVisit.preserveScroll) {
          Scroll.restore(scrollRegions)
        }

        this.fireInitialEvents(visitId)
      })

    return true
  }

  protected static handleDefault(): void {
    if (typeof window !== 'undefined') {
      currentPage.setUrlHash(window.location.hash)
    }

    const visitId = uid()

    currentPage
      .set(currentPage.get(), { preserveScroll: true, preserveState: true, initialRender: true, visitId })
      .then(() => {
        if (navigationType.isReload()) {
          Scroll.restore(history.getScrollRegions())
        } else {
          Scroll.scrollToAnchor()
        }

        this.fireInitialEvents(visitId)
      })
  }

  protected static fireInitialEvents(visitId: string): void {
    const page = currentPage.get()

    fireNavigateEvent(page, { type: 'initial', visitId })

    if (Object.keys(page.flash).length > 0) {
      queueMicrotask(() => fireFlashEvent(page.flash))
    }
  }
}
