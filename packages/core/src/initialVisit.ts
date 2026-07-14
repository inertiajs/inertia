import { eventHandler } from './eventHandler'
import { fireFlashEvent, fireNavigateEvent } from './events'
import { history } from './history'
import { navigationType } from './navigationType'
import { page as currentPage } from './page'
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

        currentPage.set(data, { preserveScroll: true, preserveState: true, visitId }).then(() => {
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

    if (typeof window !== 'undefined') {
      currentPage.setUrlHash(window.location.hash)
    }

    history
      .decrypt(currentPage.get())
      .then(() => {
        const visitId = uid()
        const rememberedState = history.getState<Page['rememberedState']>(history.rememberedState, {})
        const scrollRegions = history.getScrollRegions()
        currentPage.remember(rememberedState)

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
      })
      .catch(() => {
        eventHandler.onMissingHistoryItem()
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

    fireNavigateEvent(page, { visitId })

    if (Object.keys(page.flash).length > 0) {
      queueMicrotask(() => fireFlashEvent(page.flash))
    }
  }
}
