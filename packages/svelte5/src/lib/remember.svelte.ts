import { router } from '@inertiajs/core'

function useRemember<State>(initialState: State, key?: string) {
  const restored = router.restore(key)
  const store = $state(restored !== undefined ? restored : initialState)

  $effect(() => router.remember($state.snapshot(store), key))

  return store
}

export default useRemember
