import type { Component } from 'svelte'
import type { RenderFunction, RenderProps } from './components/Render.svelte'

export type ComponentResolver = (name: string) => ResolvedComponent | Promise<ResolvedComponent>

export type LayoutResolver = (h: RenderFunction, page: RenderProps) => RenderProps

export type LayoutType = LayoutResolver | Component | Component[]

export type ResolvedComponent = {
  default: Component
  layout?: LayoutType
}

export type SvelteInertiaAppConfig = {}
