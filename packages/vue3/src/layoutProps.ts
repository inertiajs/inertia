import { createLayoutPropsStore, type LayoutSlot } from '@inertiajs/core'
import { ref } from 'vue'

const store = createLayoutPropsStore()

export const state = ref(store.get())

export const layerState = ref(new Map<string, LayoutSlot>())

const sync = () => {
  const snapshot = store.snapshot()

  state.value = snapshot.base
  layerState.value = new Map(Object.entries(snapshot.layers))
}

store.subscribe(sync)

export const setLayoutProps = store.set

export function resetLayoutProps(): void {
  store.reset()
  sync()
}

export function swapLayoutProps(options: Parameters<typeof store.swap>[0]): void {
  if (store.swap(options)) {
    sync()
  }
}
