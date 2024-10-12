import { Router } from 'inertiax-core'
import { getContext, onDestroy } from 'svelte'
import { writable } from 'svelte/store'

const { router } = getContext<{router: Router}>('frame')

export default function useRemember<State>(initialState: State, key?: string) {
  const restored = router.restore(key) as State | undefined
  const store = writable(restored !== undefined ? restored : initialState)
  const unsubscribe = store.subscribe((state) => router.remember(state, key))

  onDestroy(unsubscribe)

  return store
}
