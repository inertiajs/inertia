import type { ComponentType } from 'svelte'

export type ComponentResolver = (name: string) => ResolvedComponent | Promise<ResolvedComponent>

export type ResolvedComponent = {
  default?: ComponentType
  layout?: ComponentType
}
