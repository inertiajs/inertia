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
    if (!(History.hasAnyState() && navigationType.isBackForward())) {
      return false
    }

    History.setState('version', currentPage.get().meta.assetVersion)

    currentPage.set(History.getAllState(), { preserveScroll: true, preserveState: true }).then(() => {
      Scroll.restore(currentPage.get())
      fireNavigateEvent(currentPage.get())
    })

    return true
  }

  /**
   * @link https://inertiajs.com/redirects#external-redirects
   */
  protected static handleLocation(): boolean {
    if (!SessionStorage.exists()) {
      return false
    }

    const locationVisit: LocationVisit = JSON.parse(SessionStorage.get() || '{}')

    SessionStorage.remove()

    currentPage.setUrlHash(window.location.hash)
    currentPage.remember(History.getState<Page['rememberedState']>(History.rememberedState, {}))
    currentPage.scrollRegions(History.getState<Page['scrollRegions']>(History.scrollRegions, []))

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

    return true
  }

  protected static handleDefault(): void {
    currentPage.setUrlHash(window.location.hash)
    currentPage.set(currentPage.get(), { preserveState: true }).then(() => {
      fireNavigateEvent(currentPage.get())
    })
  }
}
