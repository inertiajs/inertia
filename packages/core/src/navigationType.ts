class NavigationType {
  protected type: NavigationTimingType

  public constructor() {
    this.type = this.resolveType()
  }

  protected resolveType(): NavigationTimingType {
    if (typeof window === 'undefined') {
      return 'navigate'
    }

    if (
      window.performance &&
      window.performance.getEntriesByType &&
      window.performance.getEntriesByType('navigation').length > 0
    ) {
      return (window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming).type
    }

    return 'navigate'
  }

  public get(): NavigationTimingType {
    return this.type
  }

  public isBackForward(): boolean {
    return this.type === 'back_forward'
  }

  public isReload(): boolean {
    return this.type === 'reload'
  }
}

export const navigationType = new NavigationType()
