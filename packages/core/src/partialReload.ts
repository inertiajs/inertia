export const isSameOrSubPath = (path: string, candidate: string): boolean => {
  return path === candidate || path.startsWith(`${candidate}.`)
}

export const pathIsReloaded = (path: string, only: string[], except: string[]): boolean => {
  if (only.length > 0) {
    return only.some((candidate) => isSameOrSubPath(path, candidate))
  }

  if (except.length > 0) {
    return !except.some((candidate) => isSameOrSubPath(path, candidate))
  }

  return false
}

export const anyPathIsReloaded = (paths: string[], only: string[], except: string[]): boolean => {
  if (only.length === 0 && except.length === 0) {
    return true
  }

  return paths.some((path) => pathIsReloaded(path, only, except))
}
