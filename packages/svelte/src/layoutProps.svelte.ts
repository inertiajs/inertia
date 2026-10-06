import { createLayoutPropsStore, type LayoutSlot } from '@inertiajs/core'

const store = createLayoutPropsStore()

export const storeState = $state({
  shared: {} as Record<string, unknown>,
  named: {} as Record<string, Record<string, unknown>>,
})

export const layerState = $state<Record<string, LayoutSlot>>({})

const sync = () => {
  const snapshot = store.snapshot()

  storeState.shared = snapshot.base.shared
  storeState.named = snapshot.base.named

  for (const id of Object.keys(layerState)) {
    if (!(id in snapshot.layers)) {
      delete layerState[id]
    }
  }

  Object.assign(layerState, snapshot.layers)
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
