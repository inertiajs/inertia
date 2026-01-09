import type { FormComponentRef } from '@inertiajs/core'
import { getContext } from 'svelte'
import type { Readable } from 'svelte/store'

export const FormContextKey = Symbol('InertiaFormContext')

export function useFormContext(): Readable<FormComponentRef> | undefined {
  return getContext(FormContextKey)
}
