import type { ComponentType } from 'svelte'

export type ComponentsResolver = (name: string) => ResolvedComponents | Promise<ResolvedComponents>

export type ResolvedComponents = {
  default?: ComponentType
  layout?: ComponentType
}
