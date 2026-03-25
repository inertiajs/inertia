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

export function setLayoutProps(props: Partial<LayoutProps>): void
export function setLayoutProps<K extends keyof NamedLayoutProps>(name: K, props: Partial<NamedLayoutProps[K]>): void
export function setLayoutProps<T = never>(props: Partial<NoInfer<T>>): void
export function setLayoutProps<T = never>(name: string, props: Partial<NoInfer<T>>): void
export function setLayoutProps(nameOrProps: string | Record<string, unknown>, props?: Record<string, unknown>): void {
  if (typeof nameOrProps === 'string') {
    store.setFor(nameOrProps, props!)
  } else {
    store.set(nameOrProps)
  }
}

export function resetLayoutProps(): void {
  store.reset()
  const snapshot = store.get()
  storeState.shared = snapshot.shared
  storeState.named = snapshot.named
}
