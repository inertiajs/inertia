import { ReactNode, useEffect, useState } from 'react'

interface ClientOnlyProps {
  children: ReactNode | (() => ReactNode)
  fallback?: ReactNode | (() => ReactNode)
}

const ClientOnly = ({ children, fallback }: ClientOnlyProps) => {
  // Not a `typeof window` check: the client's first render must match the server's
  // HTML, so the swap has to wait for mount.
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return typeof fallback === 'function' ? fallback() : (fallback ?? null)
  }

  return typeof children === 'function' ? children() : children
}

ClientOnly.displayName = 'InertiaClientOnly'

export default ClientOnly
