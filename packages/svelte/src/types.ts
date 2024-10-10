import type { ComponentType } from 'svelte'

export type ComponentResolver = (name: string) => ResolvedComponent | Promise<ResolvedComponent>

export type LayoutType = ComponentType | ComponentType[]

export type ResolvedComponent = {
  default: ComponentType
  layout?: LayoutType
}
