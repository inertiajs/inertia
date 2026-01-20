import { CacheForOption, TimeUnit } from './types'

const conversionMap: Record<TimeUnit, number> = {
  ms: 1,
  s: 1000,
  m: 1000 * 60,
  h: 1000 * 60 * 60,
  d: 1000 * 60 * 60 * 24,
}

export const timeToMs = (time: CacheForOption): number => {
  if (typeof time === 'number') {
    return time
  }

  for (const [unit, conversion] of Object.entries(conversionMap)) {
    if (time.endsWith(unit)) {
      return parseFloat(time) * conversion
    }
  }

  return parseInt(time)
}
