import type { ComponentType } from 'svelte'
import type { RenderFunction, RenderProps } from './components/Render.svelte'
import { PageProps } from '@inertiajs/core'

export type ComponentResolver = (name: string, props: PageProps) => ResolvedComponent | Promise<ResolvedComponent>

export type LayoutResolver = (h: RenderFunction, page: RenderProps) => RenderProps

export type LayoutType = LayoutResolver | ComponentType | ComponentType[]

export type ResolvedComponent = {
  default: ComponentType
  layout?: LayoutType
}
