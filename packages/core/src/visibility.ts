type VisibilityListener = (hidden: boolean) => void

const listeners = new Set<VisibilityListener>()

let registered = false

const register = (): void => {
  if (registered || typeof document === 'undefined') {
    return
  }

  registered = true

  document.addEventListener(
    'visibilitychange',
    () => {
      listeners.forEach((listener) => listener(document.hidden))
    },
    false,
  )
}

/**
 * A single `visibilitychange` listener shared by everything that pauses while
 * the tab is in the background, so polls and live props never disagree about
 * whether the page is visible.
 */
export const visibility = {
  isHidden(): boolean {
    return typeof document !== 'undefined' && document.hidden
  },

  onChange(listener: VisibilityListener): VoidFunction {
    register()
    listeners.add(listener)

    return () => {
      listeners.delete(listener)
    }
  },
}
