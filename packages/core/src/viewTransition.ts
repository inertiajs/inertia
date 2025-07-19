import { ActiveVisit, ViewTransitionOptions } from './types'

export class ViewTransitionManager {
  private static isViewTransitionSupported(): boolean {
    return typeof document !== 'undefined' && 'startViewTransition' in document
  }

  private static shouldUseViewTransition(options?: ViewTransitionOptions): boolean {
    if (!options?.enabled) {
      return false
    }

    return this.isViewTransitionSupported()
  }

  public static async withViewTransition<T>(
    visit: ActiveVisit,
    updateCallback: () => Promise<T> | T,
  ): Promise<T> {
    const vtOptions = visit.viewTransition

    if (!this.shouldUseViewTransition(vtOptions)) {
      return updateCallback()
    }

    return new Promise<T>((resolve, reject) => {
      const transition = (document as any).startViewTransition(async () => {
        try {
          const result = await updateCallback()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })

      // Call custom callback if provided
      vtOptions?.onViewTransitionStart?.(transition)

      // Handle transition completion
      transition.finished
        .then(() => {
          vtOptions?.onViewTransitionEnd?.(transition)
        })
        .catch((error: Error) => {
          if (error.name === 'AbortError') {
            // View transition was skipped or aborted
            return
          }
          vtOptions?.onViewTransitionError?.(error)
          console.warn('View transition error:', error)
        })
    })
  }

  public static createFallbackWrapper<T>(
    visit: ActiveVisit,
    updateCallback: () => Promise<T> | T,
  ): Promise<T> {
    const vtOptions = visit.viewTransition

    if (this.shouldUseViewTransition(vtOptions)) {
      return this.withViewTransition(visit, updateCallback)
    }

    // Fallback for browsers without view transition support
    return Promise.resolve(updateCallback())
  }
}
