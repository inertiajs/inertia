export const objectsAreEqual = <T>(
  obj1: T,
  obj2: T,
  excludeKeys: {
    [K in keyof T]: K
  }[keyof T][],
): boolean => {
  if (obj1 === obj2) {
    return true
  }

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
