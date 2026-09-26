import { Dispatch, MutableRefObject, SetStateAction, useEffect, useState } from 'react'
import useLayer from './useLayer'

export default function useRemember<State>(
  initialState: State,
  key?: string,
  excludeKeysRef?: MutableRefObject<string[]>,
): [State, Dispatch<SetStateAction<State>>] {
  const layer = useLayer()
  const [state, setState] = useState(() => {
    const restored = layer.restore(key) as State

    return restored !== undefined ? restored : initialState
  })

  useEffect(() => {
    const keys = excludeKeysRef?.current
    if (keys && keys.length > 0 && typeof state === 'object' && state !== null) {
      const filtered = { ...state } as Record<string, unknown>
      keys.forEach((k) => delete filtered[k])
      layer.remember(filtered, key)
    } else {
      layer.remember(state, key)
    }
  }, [layer, state, key])

  return [state, setState]
}
