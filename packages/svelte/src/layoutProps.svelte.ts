import { createLayoutPropsStore, type LayoutProps, type NamedLayoutProps } from '@inertiajs/core'

const store = createLayoutPropsStore()

export const storeState = $state({
  shared: {} as Record<string, unknown>,
  named: {} as Record<string, Record<string, unknown>>,
})

store.subscribe(() => {
  const snapshot = store.get()
  storeState.shared = snapshot.shared
  storeState.named = snapshot.named
})

export function setLayoutProps(props: Partial<LayoutProps>): void {
  store.set(props)
}

export function setLayoutPropsFor<K extends keyof NamedLayoutProps>(
  name: K,
  props: Partial<NamedLayoutProps[K]>,
): void {
  store.setFor(name, props)
}

export function resetLayoutProps(): void {
  store.reset()
  const snapshot = store.get()
  storeState.shared = snapshot.shared
  storeState.named = snapshot.named
}
