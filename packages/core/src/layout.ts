import { isEqual } from 'lodash-es'

export interface LayoutDefinition<Component> {
  component: Component
  props: Record<string, unknown>
  name?: string
}

export interface LayoutPropsStore {
  set(props: Record<string, unknown>): void
  setFor(name: string, props: Record<string, unknown>): void
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

/**
 * Merges layout props from three sources with priority: dynamic > static > defaults.
 * Only keys present in `defaults` are included in the result.
 *
 * @example
 * ```ts
 * mergeLayoutProps(
 *   { title: 'Default', showSidebar: true },  // defaults declared in useLayoutProps()
 *   { title: 'My Page', color: 'blue' },       // static props from layout definition
 *   { showSidebar: false, fontSize: 16 },       // dynamic props from setLayoutProps()
 * )
 * // => { title: 'My Page', showSidebar: false }
 * // 'color' and 'fontSize' are excluded because they're not declared in defaults
 * ```
 */
export function mergeLayoutProps<T extends Record<string, unknown>>(
  defaults: T,
  staticProps: Record<string, unknown>,
  dynamicProps: Record<string, unknown>,
): T {
  const result: Record<string, unknown> = { ...defaults }

  for (const key of Object.keys(defaults)) {
    if (key in staticProps && staticProps[key] !== undefined) {
      result[key] = staticProps[key]
    }
    if (key in dynamicProps && dynamicProps[key] !== undefined) {
      result[key] = dynamicProps[key]
    }
  }

  return result as T
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
