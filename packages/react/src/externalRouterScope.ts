import { router, type HeadManager, type Page, type PageHandler, type RouterInitParams } from '@inertiajs/core'
import { resetLayoutProps } from './layoutProps'
import type { ReactComponent, ReactPageHandlerArgs } from './types'

export function createExternalRouterScope() {
  let initialized = false
  let disposed = false
  let disposeRouter: VoidFunction | undefined
  let swap: PageHandler<ReactComponent> | undefined
  let onFlash: ((flash: Page['flash']) => void) | undefined
  let pendingSwap: ReactPageHandlerArgs | undefined
  let pendingFlash: Page['flash'] | undefined
  let headManager: HeadManager | undefined

  return {
    page: undefined as Page | undefined,

    getHeadManager(create: () => HeadManager): HeadManager {
      return (headManager ??= create())
    },

    initialize(parameters: Omit<RouterInitParams<ReactComponent>, 'swapComponent' | 'onFlash'>) {
      if (initialized || disposed) {
        return
      }

      initialized = true
      resetLayoutProps()

      disposeRouter = router.init<ReactComponent>({
        ...parameters,
        swapComponent: async (args) => {
          if (disposed) {
            return
          }

          if (swap) {
            return swap(args)
          }

          pendingFlash = undefined
          pendingSwap = args
        },
        onFlash: (flash) => {
          if (disposed) {
            return
          }

          if (onFlash) {
            onFlash(flash)
          } else {
            pendingFlash = flash
          }
        },
      })

      if (disposed) {
        disposeRouter()
      }
    },

    attach(handler: PageHandler<ReactComponent>, flashHandler: (flash: Page['flash']) => void): VoidFunction {
      if (disposed) {
        return () => {}
      }

      swap = handler
      onFlash = flashHandler

      if (pendingSwap) {
        const pending = pendingSwap
        pendingSwap = undefined
        handler(pending)
      }

      if (pendingFlash) {
        const pending = pendingFlash
        pendingFlash = undefined
        flashHandler(pending)
      }

      return () => {
        if (swap !== handler) {
          return
        }

        swap = undefined
        onFlash = undefined
      }
    },

    dispose() {
      if (disposed) {
        return
      }

      disposed = true
      swap = undefined
      onFlash = undefined
      pendingSwap = undefined
      pendingFlash = undefined
      headManager?.dispose()
      disposeRouter?.()
    },
  }
}

export type ExternalRouterScope = ReturnType<typeof createExternalRouterScope>
