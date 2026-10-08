export function uid(): string {
  const cryptoObj = typeof window !== 'undefined' ? window.crypto : undefined

  if (cryptoObj?.randomUUID) {
    return cryptoObj.randomUUID()
  }

  const randomByte = (): number =>
    cryptoObj?.getRandomValues ? cryptoObj.getRandomValues(new Uint8Array(1))[0] : Math.floor(Math.random() * 256)

  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) =>
    (+c ^ (randomByte() & (15 >> (+c / 4)))).toString(16),
  )
}
