import { effect, signal, type WritableSignal } from '@angular/core'
import { router } from '@inertiajs/core'
import { cloneDeep, isEqual } from 'es-toolkit'
import { merge, unset } from 'es-toolkit/compat'

export function useRemember<T>(initialState: T, key?: string, exclude: readonly string[] = []): WritableSignal<T> {
  const restored = typeof window === 'undefined' ? undefined : (router.restore(key) as T | undefined)
  const initial = cloneDeep(initialState)
  const state = signal(
    restored !== undefined && typeof initial === 'object' && initial !== null && !Array.isArray(initial)
      ? (merge(initial, cloneDeep(restored)) as T)
      : cloneDeep(restored === undefined ? initial : restored),
  )

  // Inertia's history cache is not signal-aware, so push changed state into it explicitly.
  effect(() => {
    if (typeof window === 'undefined') {
      return
    }

    let value: unknown = cloneDeep(state())
    if (exclude.length > 0 && typeof value === 'object' && value !== null) {
      const filtered = { ...value } as Record<string, unknown>
      exclude.forEach((field) => unset(filtered, field))
      value = filtered
    }

    if (isEqual(router.restore(key), value)) {
      return
    }

    router.remember(value, key)
  })

  return state
}
