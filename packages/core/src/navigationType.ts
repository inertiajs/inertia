class NavigationType {
  protected type: NavigationTimingType

  public constructor() {
    if (typeof window !== 'undefined' && window?.performance.getEntriesByType('navigation').length > 0) {
      this.type = (window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming).type
    } else {
      this.type = 'navigate'
    }
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
