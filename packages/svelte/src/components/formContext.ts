import type { FormComponentRef } from '@inertiajs/core'
import { createContext } from 'svelte'

const [getFormContext, setFormContext] = createContext<FormComponentRef>()

export function useFormContext(): FormComponentRef | undefined {
  try {
    return getFormContext()
  } catch {
    return undefined
  }
}

export { setFormContext }
