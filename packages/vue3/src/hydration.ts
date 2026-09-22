import type { InjectionKey, Ref } from 'vue'

// Defaults to true so an unannounced boot (the server, most importantly) renders the fallback
let isHydrationBoot = true

export function setHydrationBoot(value: boolean): void {
  isHydrationBoot = value
}

export function isHydrating(): boolean {
  return isHydrationBoot
}

export const hydratedKey: InjectionKey<Ref<boolean>> = Symbol('inertia:hydrated')
