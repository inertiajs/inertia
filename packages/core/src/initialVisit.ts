import { fireNavigateEvent } from './events'
import { History } from './history'
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
      History.deleteState(History.rememberedState)
    }
  }

  protected static handleBackForward(): boolean {
    if (!navigationType.isBackForward() || !History.hasAnyState()) {
      return false
    }

    History.getAllState().then((data) => {
      currentPage.set(data, { preserveScroll: true, preserveState: true }).then(() => {
        Scroll.restore(currentPage.get())
        fireNavigateEvent(currentPage.get())
      })
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

    currentPage.setUrlHash(window.location.hash)

    Promise.all([
      History.getState<Page['rememberedState']>(History.rememberedState, {}),
      History.getState<Page['scrollRegions']>(History.scrollRegions, []),
    ]).then(([rememberedState, scrollRegions]) => {
      currentPage.remember(rememberedState)
      currentPage.scrollRegions(scrollRegions)

      currentPage
        .set(currentPage.get(), {
          preserveScroll: locationVisit.preserveScroll,
          preserveState: true,
        })
        .then(() => {
          if (locationVisit.preserveScroll) {
            Scroll.restore(currentPage.get())
          }

          fireNavigateEvent(currentPage.get())
        })
    })

    return true
  }

  protected static handleDefault(): void {
    currentPage.setUrlHash(window.location.hash)
    currentPage.set(currentPage.get(), { preserveState: true }).then(() => {
      fireNavigateEvent(currentPage.get())
    })
  }
}
