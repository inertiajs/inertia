import { createLayoutPropsStore } from '@inertiajs/core'
import { ref } from 'vue'

const store = createLayoutPropsStore()

export const state = ref(store.get())

store.subscribe(() => {
  state.value = store.get()
})

export function setLayoutProps(props: Record<string, unknown>): void {
  store.set(props)
}

export function setLayoutPropsFor(name: string, props: Record<string, unknown>): void {
  store.setFor(name, props)
}

export function resetLayoutProps(): void {
  store.reset()
  state.value = store.get()
}
