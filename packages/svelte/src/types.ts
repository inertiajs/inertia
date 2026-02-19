import { type Page } from '@inertiajs/core'
import type { Component } from 'svelte'
import type { RenderFunction, RenderProps } from './components/Render.svelte'

export type ComponentResolver = (name: string, page?: Page) => ResolvedComponent | Promise<ResolvedComponent>

export type LayoutResolver = (h: RenderFunction, page: RenderProps) => RenderProps

/**
 * Layout tuple: [Component, { props }]
 */
export type LayoutTuple = [Component, Record<string, unknown>?]

/**
 * Layout object with explicit component: { component: Layout, props: { ... } }
 */
export type LayoutObject = {
  component: Component
  props?: Record<string, unknown>
}

/**
 * Named layouts: { outer: Layout, inner: [Layout, { props }] }
 */
export type NamedLayouts = Record<string, Component | LayoutTuple | LayoutObject>

/**
 * Extended layout type supporting all formats.
 */
export type LayoutType =
  | LayoutResolver
  | Component
  | Component[]
  | LayoutTuple
  | LayoutObject
  | NamedLayouts
  | (Component | LayoutTuple | LayoutObject)[]

export type ResolvedComponent = {
  default: Component
  layout?: LayoutType
}

export type SvelteInertiaAppConfig = {}
