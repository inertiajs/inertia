import { history } from './history'
import { page as currentPage } from './page'
import { Page } from './types'

export class Scroll {
  public static save(page: Page): void {
    history.replaceState({
      ...page,
      scrollRegions: Array.from(this.regions()).map((region) => ({
        top: region.scrollTop,
        left: region.scrollLeft,
      })),
    })
  }

  protected static regions(): NodeListOf<Element> {
    return document.querySelectorAll('[scroll-region]')
  }

  public static reset(page: Page): void {
    if (typeof window !== 'undefined') {
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

    this.save(page)

    if (window.location.hash) {
      // We're using a setTimeout() here as a workaround for a bug in the React adapter where the
      // rendering isn't completing fast enough, causing the anchor link to not be scrolled to.
      setTimeout(() => document.getElementById(window.location.hash.slice(1))?.scrollIntoView())
    }
  }

  public static restore(page: Page): void {
    if (!page.scrollRegions) {
      return
    }

    this.regions().forEach((region: Element, index: number) => {
      const scrollPosition = page.scrollRegions[index]

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

  public static onScroll(event: Event): void {
    const target = event.target as Element

    if (typeof target.hasAttribute === 'function' && target.hasAttribute('scroll-region')) {
      this.save(currentPage.get())
    }
  }
}
