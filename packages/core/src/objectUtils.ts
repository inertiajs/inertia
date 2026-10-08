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

// Immutable set at `path`: copies only the containers along the way and keeps
// every untouched branch by reference, so consumers that memoize on other props
// don't re-render.
export const setPathPreservingIdentity = <T>(target: T, path: string, value: unknown): T => {
  const keys = toPath(path)

  if (keys.length === 0) {
    return target
  }

  const copyAlongPath = (node: unknown, depth: number): unknown => {
    if (depth === keys.length) {
      return value
    }

    const key = keys[depth]

    // Copy the container on the path; when it is missing, create an array for an
    // integer key and an object otherwise, matching es-toolkit's mutable set().
    const copy: any = Array.isArray(node)
      ? [...node]
      : node && typeof node === 'object'
        ? { ...node }
        : /^(?:0|[1-9]\d*)$/.test(key)
          ? []
          : {}

    copy[key] = copyAlongPath((node as any)?.[key], depth + 1)

    return copy
  }

  return copyAlongPath(target, 0) as T
}
