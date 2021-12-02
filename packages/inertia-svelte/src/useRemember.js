import { onDestroy } from 'svelte'
import { writable } from 'svelte/store'
import { Inertia } from '@inertiajs/inertia'

function useRemember(initialState, key) {
  const restored = Inertia.restore(key)
  const store = writable(restored !== undefined ? restored : initialState)
  const unsubscribe = store.subscribe(state => Inertia.remember(state, key))

  onDestroy(unsubscribe)

  return store
}

export default useRemember
