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

export interface LayoutPropsStore {
  set(props: Partial<LayoutProps>): void
  setFor<K extends keyof NamedLayoutProps>(name: K, props: Partial<NamedLayoutProps[K]>): void
  get(): { shared: Record<string, unknown>; named: Record<string, Record<string, unknown>> }
  reset(): void
  subscribe(callback: () => void): () => void
}

export function createLayoutPropsStore(): LayoutPropsStore {
  let shared: Record<string, unknown> = {}
  let named: Record<string, Record<string, unknown>> = {}
  let snapshot = { shared, named }
  const listeners = new Set<() => void>()
  let pendingNotify = false

  const updateSnapshot = () => {
    snapshot = { shared, named }
  }

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

  return {
    set(props) {
      const merged = { ...shared, ...props }

      if (isEqual(shared, merged)) {
        return
      }

      shared = merged
      updateSnapshot()
      notify()
    },

    setFor(name, props) {
      const current = named[name] || {}
      const merged = { ...current, ...props }

      if (isEqual(current, merged)) {
        return
      }

      named = { ...named, [name]: merged }
      updateSnapshot()
      notify()
    },

    reset() {
      shared = {}
      named = {}
      updateSnapshot()
      notify()
    },

    subscribe(callback) {
      listeners.add(callback)
      return () => listeners.delete(callback)
    },

    get: () => snapshot,
  }
}

type ComponentCheck<T> = (value: unknown) => value is T

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function hasComponentKey(value: unknown): value is { component: unknown; props?: Record<string, unknown> } {
  return isPlainObject(value) && 'component' in value
}

function isNamedLayouts<T>(value: unknown, isComponent: ComponentCheck<T>): value is Record<string, unknown> {
  if (!isPlainObject(value) || isComponent(value) || 'component' in value) {
    return false
  }
  return Object.values(value).some((v) => isComponent(v) || (Array.isArray(v) && isComponent(v[0])))
}

export function isPropsObject<T>(value: unknown, isComponent: ComponentCheck<T>): boolean {
  return isPlainObject(value) && !isComponent(value) && !('component' in value) && !isNamedLayouts(value, isComponent)
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
