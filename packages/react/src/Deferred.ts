import { ReactChild, useEffect, useState } from 'react'
import usePage from './usePage'

interface DeferredProps {
  children: ReactChild
  fallback: ReactChild
  data: string | string[]
}

const Deferred = ({ children, data, fallback }: DeferredProps) => {
  if (!data) {
    throw new Error('`<Deferred>` requires a `data` prop')
  }

  const [loaded, setLoaded] = useState(false)
  const pageProps = usePage().props
  const keys = Array.isArray(data) ? data : [data]

  useEffect(() => {
    setLoaded(keys.every((key) => pageProps[key] !== undefined))
  }, [pageProps, keys])

  return loaded ? children : fallback
}

Deferred.displayName = 'InertiaDeferred'

export default Deferred
