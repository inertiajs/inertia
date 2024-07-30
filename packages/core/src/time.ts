const conversionMap = {
  ms: 1,
  s: 1000,
  m: 1000 * 60,
  h: 1000 * 60 * 60,
  d: 1000 * 60 * 60 * 24,
}

export const timeToMs = (time: string | number): number => {
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
