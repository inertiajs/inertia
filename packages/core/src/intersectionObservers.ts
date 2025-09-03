type IntersectionObserverCallback = (entry: IntersectionObserverEntry) => void

interface IntersectionObserverManager {
  new: (callback: IntersectionObserverCallback, options?: IntersectionObserverInit) => IntersectionObserver
  flushAll: () => void
}

export const useIntersectionObservers = (): IntersectionObserverManager => {
  const intersectionObservers: IntersectionObserver[] = []

  const newIntersectionObserver = (
    callback: IntersectionObserverCallback,
    options: IntersectionObserverInit = {},
  ): IntersectionObserver => {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          callback(entry)
        }
      }
    }, options)

    intersectionObservers.push(observer)

    return observer
  }

  const flushAll = () => {
    intersectionObservers.forEach((observer) => observer.disconnect())
    intersectionObservers.length = 0
  }

  return {
    new: newIntersectionObserver,
    flushAll,
  }
}
