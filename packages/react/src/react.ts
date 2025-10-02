import { DependencyList, EffectCallback, useEffect, useLayoutEffect } from 'react'

// Inspired by react-redux, this hook uses useLayoutEffect in the browser, and useEffect
// when using SSR. Currently, useLayoutEffect doesn't work when rendered on the server.
export function useIsomorphicLayoutEffect(effect: EffectCallback, deps?: DependencyList): void {
  typeof window === 'undefined' ? useEffect(effect, deps) : useLayoutEffect(effect, deps)
}
