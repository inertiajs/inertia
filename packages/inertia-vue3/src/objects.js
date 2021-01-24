export function cloneDeep(object) {
  const type = getType(object)

  if (type === 'array') {
    return object.map(function (item) {
      return cloneDeep(item)
    })
  } else if (type === 'object') {
    return Object.keys(object).reduce((carry, key) => {
      carry[key] = cloneDeep(object[key])

      return carry
    }, {})
  } else {
    return object
  }
}

export function getType(object) {
  return Object.prototype.toString.call(object).slice(8, -1).toLowerCase()
}
