let isHydrationBoot = true
let clientRendered = false

// The `typeof window` check in `canRenderClientOnly` is what actually keeps this module
// inert on the server -- a client boot never runs inside the SSR process, so the state
// below is never touched there regardless. The guards on the mutators are defence in
// depth: these are exported functions, so nothing stops a caller from invoking them
// outside the client boot path they're meant for.
export function setHydrationBoot(value: boolean): void {
  if (typeof window === 'undefined') return
  isHydrationBoot = value
  clientRendered = false
}

export function markClientRendered(): void {
  if (typeof window === 'undefined') return
  clientRendered = true
}

export function canRenderClientOnly(): boolean {
  return typeof window !== 'undefined' && (clientRendered || !isHydrationBoot)
}
