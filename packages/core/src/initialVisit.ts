import { eventHandler } from './eventHandler'
import { fireNavigateEvent } from './events'
import { history } from './history'
import { navigationType } from './navigationType'
import { page as currentPage } from './page'
import { Scroll } from './scroll'
import { SessionStorage } from './sessionStorage'
import { LocationVisit, Page, Frame } from './types'

export class InitialVisit {
  public static handle(): void {
    
    this.clearRememberedStateOnReload()
    
    const scenarios = [this.handleBackForward, this.handleLocation, this.handleDefault]

    scenarios.find((handler) => handler.bind(this)())
  }

  protected static clearRememberedStateOnReload(): void {
    if (navigationType.isReload()) {
      history.deleteRememberedState()
    }
  }

  protected static handleBackForward(): boolean {
    if (!navigationType.isBackForward() || !history.hasAnyState()) {
      return false
    }
    
    if (!window.history.state?.page) {
      // We have no power here
      return false
    }

    history
      .decrypt()
      .then((data) => {
        currentPage.set(data, { preserveScroll: true, forgetState: false, replace: true }).then(() => {
          Scroll.restore(currentPage.get())
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
      .decrypt()
      .then(() => {
        const rememberedFrames: Record<string, Frame> = history.getState<Page['frames']>("frames", {})
        const scrollRegions = history.getState<Page['scrollRegions']>(history.scrollRegions, [])
        Object.entries(rememberedFrames).forEach(([name, frame]) => {
          currentPage.remember(name, frame.rememberedState)
        })
        currentPage.scrollRegions(scrollRegions)

        currentPage
          .set(currentPage.get(), {
            preserveScroll: locationVisit.preserveScroll,
            forgetState: false,
          })
          .then(() => {
            if (!locationVisit.preserveScroll) {
              Scroll.restore(currentPage.get())
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

    currentPage.set(currentPage.get(), { forgetState: false, replace: true }).then(() => {
      fireNavigateEvent(currentPage.get())
    })
  }
}
