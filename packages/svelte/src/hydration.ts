import { getContext, setContext } from 'svelte'

// Defaults to true so an unannounced boot (the server, most importantly) renders the fallback
let isHydrationBoot = true

export function setHydrationBoot(value: boolean): void {
  isHydrationBoot = value
}

export function isHydrating(): boolean {
  return isHydrationBoot
}

export interface HydrationState {
  hydrated: boolean
}

const key = Symbol('inertia:hydrated')

export function setHydrationContext(state: HydrationState): void {
  setContext(key, state)
}

export function getHydrationContext(): HydrationState | null {
  return getContext<HydrationState | undefined>(key) ?? null
}
