import { history } from './history'
import { ScrollRegion } from './types'

export class Scroll {
  public static save(): void {
    history.saveScrollPositions(this.getScrollPositions())
  }

  public static getScrollPositions(): ScrollRegion[] {
    return Array.from(this.regions()).map((region) => ({
      top: region.scrollTop,
      left: region.scrollLeft,
    }))
  }

  protected static regions(): NodeListOf<Element> {
    return document.querySelectorAll('[scroll-region]')
  }

  public static reset(): void {
    const anchorHash = typeof window !== 'undefined' ? window.location.hash : null

    if (!anchorHash) {
      // Reset the document scroll position if there is no hash.
      window.scrollTo(0, 0)
    }

    this.regions().forEach((region) => {
      if (typeof region.scrollTo === 'function') {
        region.scrollTo(0, 0)
      } else {
        region.scrollTop = 0
        region.scrollLeft = 0
      }
    })

    this.save()
    this.scrollToAnchor()
  }

  public static scrollToAnchor(): void {
    const anchorHash = typeof window !== 'undefined' ? window.location.hash : null

    if (anchorHash) {
      // We're using a setTimeout() here as a workaround for a bug in the React adapter where the
      // rendering isn't completing fast enough, causing the anchor link to not be scrolled to.
      setTimeout(() => {
        const anchorElement = document.getElementById(anchorHash.slice(1))
        anchorElement ? anchorElement.scrollIntoView() : window.scrollTo(0, 0)
      })
    }
  }

  public static restore(scrollRegions: ScrollRegion[]): void {
    if (typeof window === 'undefined') {
      return
    }

    window.requestAnimationFrame(() => {
      this.restoreDocument()
      this.restoreScrollRegions(scrollRegions)
    })
  }

  public static restoreScrollRegions(scrollRegions: ScrollRegion[]): void {
    if (typeof window === 'undefined') {
      return
    }

    this.regions().forEach((region: Element, index: number) => {
      const scrollPosition = scrollRegions[index]

      if (!scrollPosition) {
        return
      }

      if (typeof region.scrollTo === 'function') {
        region.scrollTo(scrollPosition.left, scrollPosition.top)
      } else {
        region.scrollTop = scrollPosition.top
        region.scrollLeft = scrollPosition.left
      }
    })
  }

  public static restoreDocument(): void {
    const scrollPosition = history.getDocumentScrollPosition()
    window.scrollTo(scrollPosition.left, scrollPosition.top)
  }

  public static onScroll(event: Event): void {
    const target = event.target as Element

    if (typeof target.hasAttribute === 'function' && target.hasAttribute('scroll-region')) {
      this.save()
    }
  }

  public static onWindowScroll(): void {
    history.saveDocumentScrollPosition({
      top: window.scrollY,
      left: window.scrollX,
    })
  }
}
