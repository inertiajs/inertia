import { eventHandler } from './eventHandler'
import { fireNavigateEvent } from './events'
import { history } from './history'
import { navigationType } from './navigationType'
import { page as currentPage } from './page'
import { Scroll } from './scroll'
import { SessionStorage } from './sessionStorage'
import { LocationVisit, Page } from './types'

export class InitialVisit {
  public static handle(): void {
    this.clearRememberedStateOnReload()

    const scenarios = [this.handleBackForward, this.handleLocation, this.handleDefault]

    scenarios.find((handler) => handler.bind(this)())
  }

  protected static clearRememberedStateOnReload(): void {
    if (navigationType.isReload()) {
      history.deleteState(history.rememberedState)
    }
  }

  protected static handleBackForward(): boolean {
    if (!navigationType.isBackForward() || !history.hasAnyState()) {
      return false
    }

    const scrollRegions = history.getScrollRegions()

    history
      .decrypt()
      .then((data) => {
        currentPage.set(data, { preserveScroll: true, preserveState: true }).then(() => {
          Scroll.restore(scrollRegions)
          fireNavigateEvent(currentPage.get())
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
        const rememberedState = history.getState<Page['rememberedState']>(history.rememberedState, {})
        const scrollRegions = history.getScrollRegions()
        currentPage.remember(rememberedState)

        currentPage
          .set(currentPage.get(), {
            preserveScroll: locationVisit.preserveScroll,
            preserveState: true,
          })
          .then(() => {
            if (locationVisit.preserveScroll) {
              Scroll.restore(scrollRegions)
            }

            fireNavigateEvent(currentPage.get())
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

    currentPage.set(currentPage.get(), { preserveScroll: true, preserveState: true }).then(() => {
      if (navigationType.isReload()) {
        Scroll.restore(history.getScrollRegions())
      }
      fireNavigateEvent(currentPage.get())
    })
  }
}
