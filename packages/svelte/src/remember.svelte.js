import { router } from '@inertiajs/core'

function useRemember(initialState, key) {
  const restored = router.restore(key)
  const store = $state(restored !== undefined ? restored : initialState)

  $effect(() => router.remember($state.snapshot(store), key))

  return store
}

export default useRemember
