import { ReactNode, useSyncExternalStore } from 'react'

interface ClientOnlyProps {
  children: ReactNode | (() => ReactNode)
  fallback?: ReactNode | (() => ReactNode)
}

// Referentially stable module-level constants: useSyncExternalStore re-subscribes
// whenever subscribe/getSnapshot/getServerSnapshot change identity, so these must not be
// recreated per render or per instance.
const subscribe = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

// `ClientOnly` renders `fallback` on its first render if and only if that render is part
// of an SSR hydration pass for the current document. In every other case -- a pure
// client-rendered boot, and every instance created after the initial hydration commit
// (including after ordinary page remounts) -- it renders `children` on its very first
// render. Local per-instance state can't express this: a remount creates a new instance
// that restarts at "not mounted", so the "have we passed hydration" signal has to live
// outside any single component instance. Unlike the Vue/Svelte adapters, React needs no
// such module here: `useSyncExternalStore`'s server/client snapshot pair is exactly this
// signal, scoped correctly per-fiber (including late-hydrating Suspense boundaries) by
// React itself.
const ClientOnly = ({ children, fallback }: ClientOnlyProps) => {
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot)

  if (!mounted) {
    return typeof fallback === 'function' ? fallback() : (fallback ?? null)
  }

  return typeof children === 'function' ? children() : children
}

ClientOnly.displayName = 'InertiaClientOnly'

export default ClientOnly
