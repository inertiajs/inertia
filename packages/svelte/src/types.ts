import type { Page, PageProps } from '@inertiajs/core'
import type { ComponentType } from 'svelte'
import type { RenderFunction, RenderProps } from './components/Render.svelte'

export type LayoutResolver = (h: RenderFunction, page: RenderProps) => RenderProps

export type LayoutType = LayoutResolver | ComponentType | ComponentType[]

export type ResolvedComponent = {
  default: ComponentType
  layout?: LayoutType
}

export type ComponentResolver = (name: string) => ResolvedComponent | Promise<ResolvedComponent>

export interface InertiaAppProps<SharedProps extends PageProps = PageProps> {
  initialComponent: ResolvedComponent
  initialPage: Page<SharedProps>
  resolveComponent: ComponentResolver
}
