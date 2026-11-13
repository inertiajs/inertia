import { ActiveVisit } from './types'

type VisitFilter = Pick<ActiveVisit, 'only' | 'except'>

export type RefreshFilter = Pick<ActiveVisit, 'only' | 'except' | 'reset'>

export const isPathOrSubPath = (path: string, candidate: string): boolean => {
  return path === candidate || path.startsWith(`${candidate}.`)
}

export const partialReloadRequestsProp = (visit: VisitFilter, prop: string): boolean => {
  const { only, except } = visit

  if (only.length === 0 && except.length === 0) {
    return false
  }

  if (only.length > 0 && !only.some((candidate) => isPathOrSubPath(prop, candidate))) {
    return false
  }

  if (except.length > 0 && except.some((candidate) => isPathOrSubPath(prop, candidate))) {
    return false
  }

  return true
}

export const partialReloadRequestsSomeProps = (visit: VisitFilter, props: string[]): boolean => {
  return props.some((prop) => partialReloadRequestsProp(visit, prop))
}

/**
 * `reset` on its own refreshes every prop. Combined with `only`, those paths are included.
 */
export const visitRefreshesProp = (visit: RefreshFilter, prop: string): boolean => {
  const only = visit.only.length > 0 ? visit.only.concat(visit.reset) : visit.only
  const { except } = visit

  if (only.length === 0 && except.length === 0) {
    return true
  }

  if (only.length > 0 && !only.some((candidate) => isRelatedPath(prop, candidate))) {
    return false
  }

  if (except.length > 0 && except.some((candidate) => isPathOrSubPath(prop, candidate))) {
    return false
  }

  return true
}

const isRelatedPath = (path: string, candidate: string): boolean => {
  return isPathOrSubPath(path, candidate) || isPathOrSubPath(candidate, path)
}
