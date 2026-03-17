import { createLayoutPropsStore, mergeLayoutProps } from '@inertiajs/core'
import { getContext } from 'svelte'

const store = createLayoutPropsStore()

const storeState = $state({
  shared: {} as Record<string, unknown>,
  named: {} as Record<string, Record<string, unknown>>,
})

store.subscribe(() => {
  const snapshot = store.get()
  storeState.shared = snapshot.shared
  storeState.named = snapshot.named
})

export function setLayoutProps(props: Record<string, unknown>): void {
  store.set(props)
}

export function setLayoutPropsFor(name: string, props: Record<string, unknown>): void {
  store.setFor(name, props)
}

export function resetLayoutProps(): void {
  store.reset()
  const snapshot = store.get()
  storeState.shared = snapshot.shared
  storeState.named = snapshot.named
}

export const LAYOUT_CONTEXT_KEY = Symbol('inertia-layout')

export function useLayoutProps<T extends Record<string, unknown>>(defaults: T): T {
  const context = getContext<{ readonly staticProps: Record<string, unknown>; readonly name?: string } | undefined>(
    LAYOUT_CONTEXT_KEY,
  )

  const resolve = (): T => {
    const staticProps = context?.staticProps ?? {}
    const name = context?.name
    const dynamicProps = name ? { ...storeState.shared, ...(storeState.named[name] ?? {}) } : storeState.shared
    return mergeLayoutProps(defaults, staticProps, dynamicProps)
  }

  const state = $state<T>(resolve())

  $effect.pre(() => {
    Object.assign(state, resolve())
  })

  return state
}
