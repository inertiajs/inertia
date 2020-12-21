export function isFile(object) {
  return object instanceof File || object instanceof FileList
}

export function hasFilesDeep(object) {
  if (object === null) {
    return false
  }

  if (typeof object === 'object') {
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        if (hasFilesDeep(object[key])) {
          return true
        }
      }
    }
  }

  if (Array.isArray(object)) {
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        return hasFilesDeep(object[key])
      }
    }
  }

  return isFile(object)
}

export function hasFiles(form) {
  for (const property in form) {
    if (Object.prototype.hasOwnProperty.call(form, property)) {
      if (hasFilesDeep(form[property])) {
        return true
      }
    }
  }

  return false
}
