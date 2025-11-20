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
