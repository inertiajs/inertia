import { Inertia } from '@inertiajs/inertia'
import { useEffect, useState } from 'react'

export default function useRememberedState(initialState, key) {
  const [state, setState] = useState(() => {
    const restored = Inertia.restore(key)

    return restored !== undefined ? restored : initialState
  })

  useEffect(() => {
    Inertia.remember(state, key)
  }, [state, key])

  return [state, setState]
}
