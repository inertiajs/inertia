import { getContext, setContext } from 'svelte'

export interface HydrationState {
  hydrated: boolean
}

const HydrationContextKey = Symbol('InertiaHydrationContext')

export function setHydrationContext(state: HydrationState): void {
  setContext(HydrationContextKey, state)
}

export function getHydrationContext(): HydrationState | null {
  return getContext<HydrationState | undefined>(HydrationContextKey) ?? null
}
