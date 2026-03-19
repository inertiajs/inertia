import { createLayoutPropsStore } from '@inertiajs/core'

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
