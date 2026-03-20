import { createLayoutPropsStore, type LayoutProps, type NamedLayoutProps } from '@inertiajs/core'

export const store = createLayoutPropsStore()

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
}
