type IntersectionObserverCallback = (entry: IntersectionObserverEntry) => void

interface IntersectionObserverManager {
  new: (callback: IntersectionObserverCallback, options?: IntersectionObserverInit) => IntersectionObserver
  flush: () => void
}

export const useIntersectionObservers = (): IntersectionObserverManager => {
  const intersectionObservers: IntersectionObserver[] = []

  const newIntersectionObserver = (
    callback: IntersectionObserverCallback,
    options: IntersectionObserverInit = {},
  ): IntersectionObserver => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        callback(entries[0])
      }
    }, options)

    intersectionObservers.push(observer)

    return observer
  }

  const flush = () => {
    intersectionObservers.forEach((observer) => observer.disconnect())
    intersectionObservers.length = 0
  }

  return {
    new: newIntersectionObserver,
    flush,
  }
}
