import { toPath } from 'es-toolkit/compat'

export const stripTopLevelUndefined = <T extends Record<string, unknown>>(obj: T): T => {
  const result = {} as T

  for (const key of Object.keys(obj) as (keyof T)[]) {
    if (obj[key] !== undefined) {
      result[key] = obj[key]
    }
  }

  return result
}

export const objectsAreEqual = <T extends Record<string, any>>(
  obj1: T,
  obj2: T,
  excludeKeys: {
    [K in keyof T]: K
  }[keyof T][],
): boolean => {
  if (obj1 === obj2) {
    return true
  }

  // Check keys in obj1
  for (const key in obj1) {
    if (excludeKeys.includes(key)) {
      continue
    }

    if (obj1[key] === obj2[key]) {
      continue
    }

    if (!compareValues(obj1[key], obj2[key])) {
      return false
    }
  }

  // Check keys that exist in obj2 but not in obj1
  for (const key in obj2) {
    if (excludeKeys.includes(key)) {
      continue
    }

    if (!(key in obj1)) {
      return false
    }
  }

  return true
}

const compareValues = (value1: any, value2: any): boolean => {
  switch (typeof value1) {
    case 'object':
      return objectsAreEqual(value1, value2, [])
    case 'function':
      return value1.toString() === value2.toString()
    default:
      return value1 === value2
  }
}

// Path-aware copy-on-write "set": copies only the containers along `path` and
// preserves the identity of everything untouched, matching how partial reloads
// merge props ({ ...oldProps, ...newProps }). A deep clone here would hand
// every prop a new identity and defeat consumer memoization (React memo/
// useMemo, Svelte fine-grained reactivity).
export const setImmutable = <T>(target: T, path: string, value: unknown): T => {
  const keys = toPath(path)

  if (keys.length === 0) {
    return target
  }

  const cloneAlongPath = (node: unknown, depth: number): unknown => {
    const key = keys[depth]
    const isLast = depth === keys.length - 1

    // Copy the container on the path; create one ([] for index keys, matching
    // es-toolkit's mutable set) when the path walks through a non-object.
    const copy: any = Array.isArray(node)
      ? [...node]
      : node !== null && typeof node === 'object'
        ? { ...node }
        : /^(?:0|[1-9]\d*)$/.test(key)
          ? []
          : {}

    copy[key] = isLast ? value : cloneAlongPath((node as any)?.[key], depth + 1)

    return copy
  }

  return cloneAlongPath(target, 0) as T
}
