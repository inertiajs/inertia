import debounce from './debounce'
import { fireNavigateEvent } from './events'
import { History } from './history'
import { page as currentPage } from './page'
import { Scroll } from './scroll'
import { GlobalEvent, GlobalEventNames, GlobalEventResult } from './types'
import { hrefToUrl } from './url'

class EventHandler {
  public init() {
    window.addEventListener('popstate', this.handlePopstateEvent.bind(this))
    document.addEventListener('scroll', debounce(Scroll.onScroll, 100), true)
  }

  public onInertiaEvent<TEventName extends GlobalEventNames>(
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

  protected registerListener(type: string, listener: EventListener): VoidFunction {
    document.addEventListener(type, listener)

    return () => document.removeEventListener(type, listener)
  }

  protected handlePopstateEvent(event: PopStateEvent): void {
    const page = event.state

    if (page === null) {
      const url = hrefToUrl(currentPage.get().url)
      url.hash = window.location.hash

      History.replaceState({ ...currentPage.get(), url: url.href })
      Scroll.reset(currentPage.get())

      return
    }

    currentPage.setQuietly(page, { preserveState: false }).then(() => {
      Scroll.restore(currentPage.get())
      fireNavigateEvent(currentPage.get())
    })
  }
}

export const eventHandler = new EventHandler()
