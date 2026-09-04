import { isEqual } from 'es-toolkit'
import type { LayoutProps, NamedLayoutProps } from './types'

export interface LayoutDefinition<Component> {
  component: Component
  props: Record<string, unknown>
  name?: string
}

export type LayoutCallbackReturn<C> =
  | C
  | [C, Record<string, unknown>?]
  | C[]
  | (C | [C, Record<string, unknown>?])[]
  | { component: C; props?: Record<string, unknown> }
  | Record<string, C | [C, Record<string, unknown>?] | { component: C; props?: Record<string, unknown> }>
  | Partial<LayoutProps>

export interface SetLayoutProps {
  (props: Partial<LayoutProps>, layerId?: string): void
  <K extends keyof NamedLayoutProps>(name: K, props: Partial<NamedLayoutProps[K]>, layerId?: string): void
  <T = never>(props: Partial<NoInfer<T>>, layerId?: string): void
  <T = never>(name: string, props: Partial<NoInfer<T>>, layerId?: string): void
}

export interface LayoutSlot {
  shared: Record<string, unknown>
  named: Record<string, Record<string, unknown>>
}

export interface LayoutPropsStore {
  set: SetLayoutProps
  get(): LayoutSlot
  getForLayer(layerId: string): LayoutSlot
  layerIds(): string[]
  reset(): void
  retainLayers(ids: string[]): void
  subscribe(callback: () => void): () => void
}

export const emptyLayoutSlot: LayoutSlot = { shared: {}, named: {} }

export function createLayoutPropsStore(): LayoutPropsStore {
  // Every tier's props under one key. '' is the base.
  const slots = new Map<string, LayoutSlot>()
  const listeners = new Set<() => void>()
  let pendingNotify = false

  const slotOf = (tier: string): LayoutSlot => slots.get(tier) ?? emptyLayoutSlot

  const notify = () => {
    if (pendingNotify) {
      return
    }

    pendingNotify = true
    queueMicrotask(() => {
      pendingNotify = false
      listeners.forEach((fn) => fn())
    })
  }

  const drop = (tiers: string[]) => {
    // Not some(), which would stop at the first tier it took away.
    if (tiers.filter((tier) => slots.delete(tier)).length > 0) {
      notify()
    }
  }

  // Without a name the layer takes second place, so the props are whichever argument is not it.
  const set = (
    nameOrProps: string | Record<string, unknown>,
    propsOrLayerId?: Record<string, unknown> | string,
    layerId?: string,
  ): void => {
    const name = typeof nameOrProps === 'string' ? nameOrProps : null
    const props = (name ? propsOrLayerId : nameOrProps) as Record<string, unknown>
    const tier = (typeof propsOrLayerId === 'string' ? propsOrLayerId : layerId) ?? ''

    const current = slotOf(tier)
    const into = name ? (current.named[name] ?? {}) : current.shared
    const merged = { ...into, ...props }

    if (isEqual(into, merged)) {
      return
    }

    slots.set(tier, name ? { ...current, named: { ...current.named, [name]: merged } } : { ...current, shared: merged })
    notify()
  }

  return {
    set: set as SetLayoutProps,

    get: () => slotOf(''),

    getForLayer: (layerId) => slotOf(layerId),

    layerIds: () => Array.from(slots.keys()).filter((tier) => tier !== ''),

    reset: () => drop(['']),

    retainLayers(ids) {
      drop(Array.from(slots.keys()).filter((tier) => tier !== '' && !ids.includes(tier)))
    },

    subscribe(callback) {
      listeners.add(callback)
      return () => listeners.delete(callback)
    },
  }
}

type ComponentCheck<T> = (value: unknown) => value is T

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function hasComponentKey(value: unknown): value is { component: unknown; props?: Record<string, unknown> } {
  return isPlainObject(value) && 'component' in value
}

function hasComponentEntry<T>(value: Record<string, unknown>, isComponent: ComponentCheck<T>): boolean {
  return 'component' in value && isComponent(value.component)
}

function isNamedLayouts<T>(value: unknown, isComponent: ComponentCheck<T>): value is Record<string, unknown> {
  if (!isPlainObject(value) || isComponent(value) || hasComponentEntry(value, isComponent)) {
    return false
  }
  return Object.values(value).every(
    (v) =>
      isComponent(v) || (Array.isArray(v) && isComponent(v[0])) || (hasComponentKey(v) && isComponent(v.component)),
  )
}

export function isPropsObject<T>(value: unknown, isComponent: ComponentCheck<T>): boolean {
  return (
    isPlainObject(value) &&
    !isComponent(value) &&
    !hasComponentEntry(value, isComponent) &&
    !isNamedLayouts(value, isComponent)
  )
}

export function isPropsObjectOrCallback<T>(value: unknown, isComponent: ComponentCheck<T>): boolean {
  if (isPropsObject(value, isComponent)) {
    return true
  }

  if (!isPlainObject(value) || isComponent(value) || hasComponentEntry(value, isComponent)) {
    return false
  }

  const values = Object.values(value)

  return values.length > 0 && values.every((v) => typeof v === 'function')
}

function isTuple<T>(value: unknown, isComponent: ComponentCheck<T>): value is [T, Record<string, unknown>?] {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    isComponent(value[0]) &&
    isPlainObject(value[1]) &&
    !isComponent(value[1])
  )
}

function extract<T>(item: unknown, isComponent: ComponentCheck<T>): { component: T; props: Record<string, unknown> } {
  if (Array.isArray(item) && isComponent(item[0])) {
    return { component: item[0], props: item[1] ?? {} }
  }
  if (hasComponentKey(item) && isComponent(item.component)) {
    return { component: item.component as T, props: item.props ?? {} }
  }
  if (isComponent(item)) {
    return { component: item, props: {} }
  }
  throw new Error(`Invalid layout definition: received ${typeof item}`)
}

/**
 * Normalizes layout definitions into a consistent structure.
 */
export function normalizeLayouts<T>(
  layout: unknown,
  isComponent: ComponentCheck<T>,
  isRenderFunction?: (value: unknown) => boolean,
): LayoutDefinition<T>[] {
  if (!layout || (isRenderFunction && isRenderFunction(layout))) {
    return []
  }

  if (isNamedLayouts(layout, isComponent)) {
    return Object.entries(layout).map(([name, value]) => ({ ...extract(value, isComponent), name }))
  }

  if (isTuple(layout, isComponent)) {
    return [{ component: layout[0], props: layout[1] ?? {} }]
  }

  if (Array.isArray(layout)) {
    return layout.map((item) => extract(item, isComponent))
  }

  if (hasComponentKey(layout) && isComponent(layout.component)) {
    return [{ component: layout.component as T, props: layout.props ?? {} }]
  }

  if (isComponent(layout)) {
    return [{ component: layout, props: {} }]
  }

  return []
}
