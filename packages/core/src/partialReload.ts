import { ActiveVisit } from './types'

type VisitFilter = Pick<ActiveVisit, 'only' | 'except'>

export const isPathOrSubPath = (path: string, candidate: string): boolean => {
  return path === candidate || path.startsWith(`${candidate}.`)
}

export const visitReloadsProp = (visit: VisitFilter, prop: string): boolean => {
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

export const visitReloadsProps = (visit: VisitFilter, props: string[]): boolean => {
  const { only, except } = visit

  if (only.length === 0 && except.length === 0) {
    return true
  }

  return props.some((prop) => visitReloadsProp(visit, prop))
}
