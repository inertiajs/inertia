import { ReactNode, useSyncExternalStore } from 'react'

interface WhenMountedProps {
  children: ReactNode | (() => ReactNode)
  fallback?: ReactNode | (() => ReactNode)
}

// Module-level to keep their identity stable, otherwise useSyncExternalStore re-subscribes every render
const subscribe = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

// The snapshot pair renders the fallback during hydration and the children everywhere else.
// React scopes it per-fiber, so unlike Vue and Svelte this needs no app-level state.
const WhenMounted = ({ children, fallback }: WhenMountedProps) => {
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot)

  if (!mounted) {
    return typeof fallback === 'function' ? fallback() : (fallback ?? null)
  }

  return typeof children === 'function' ? children() : children
}

WhenMounted.displayName = 'InertiaWhenMounted'

export default WhenMounted
