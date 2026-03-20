import { createLayoutPropsStore, type LayoutProps, type NamedLayoutProps } from '@inertiajs/core'
import { ref } from 'vue'

const store = createLayoutPropsStore()

export const state = ref(store.get())

store.subscribe(() => {
  state.value = store.get()
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
  state.value = store.get()
}
