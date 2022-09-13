import { onDestroy } from 'svelte'
import { writable } from 'svelte/store'
import { router } from '@inertiajs/core'

function useRemember(initialState, key) {
  const restored = router.restore(key)
  const store = writable(restored !== undefined ? restored : initialState)
  const unsubscribe = store.subscribe((state) => router.remember(state, key))

  onDestroy(unsubscribe)

  return store
}

export default useRemember
