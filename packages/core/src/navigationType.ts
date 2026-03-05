class NavigationType {
  protected type: NavigationTimingType

  public constructor() {
    this.type = this.resolveType()
  }

  protected resolveType(): NavigationTimingType {
    if (typeof window === 'undefined') {
      return 'navigate'
    }

    const entry = window.performance?.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined

    return entry?.type ?? 'navigate'
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
