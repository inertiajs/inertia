import { config } from './config'
import { eventHandler } from './eventHandler'
import { GlobalEvent } from './types'

export type DirtyFormEntry = {
  isDirty: () => boolean
  isSubmitting: () => boolean
  message?: string
}

class DirtyFormGuard {
  protected forms = new Set<DirtyFormEntry>()
  protected removeBeforeListener: VoidFunction | null = null
  protected beforeUnloadListener: ((event: BeforeUnloadEvent) => void) | null = null

  public register(entry: DirtyFormEntry): VoidFunction {
    this.forms.add(entry)
    this.setupListeners()

    return () => {
      this.forms.delete(entry)
      this.teardownListeners()
    }
  }

  public hasDirtyForms(): boolean {
    return [...this.forms].some((entry) => entry.isDirty() && !entry.isSubmitting())
  }

  public confirmNavigation(): boolean {
    if (!this.hasDirtyForms()) {
      return true
    }

    const dirtyEntry = [...this.forms].find((entry) => entry.isDirty() && !entry.isSubmitting())
    const message = dirtyEntry?.message ?? config.get('form.unsavedChangesMessage')

    return window.confirm(message)
  }

  protected setupListeners(): void {
    if (typeof window === 'undefined') {
      return
    }

    if (!this.removeBeforeListener) {
      this.removeBeforeListener = eventHandler.onGlobalEvent('before', (event: GlobalEvent<'before'>) => {
        if (event.detail.visit.prefetch) {
          return
        }

        if (!this.confirmNavigation()) {
          return false
        }
      })
    }

    if (!this.beforeUnloadListener) {
      this.beforeUnloadListener = (event: BeforeUnloadEvent) => {
        if (this.hasDirtyForms()) {
          event.preventDefault()
        }
      }

      window.addEventListener('beforeunload', this.beforeUnloadListener)
    }
  }

  protected teardownListeners(): void {
    if (this.forms.size > 0) {
      return
    }

    this.removeBeforeListener?.()
    this.removeBeforeListener = null

    if (this.beforeUnloadListener && typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this.beforeUnloadListener)
      this.beforeUnloadListener = null
    }
  }
}

export const dirtyFormGuard = new DirtyFormGuard()
