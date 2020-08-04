import { Inertia } from '@inertiajs/inertia'
import { onDestroy } from 'svelte'
import { writable } from 'svelte/store'

function remember(initialState, key) {
  const restored = Inertia.restore(key)
  const store = writable(restored !== undefined ? restored : initialState)
  const unsubscribe = store.subscribe(state => Inertia.remember(state, key))

  onDestroy(unsubscribe)

  return store
}

export default remember
