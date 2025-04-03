import { ReactElement, useEffect, useMemo, useState } from 'react'
import { router } from '.'
import usePage from './usePage'

interface DeferredProps {
  children: ReactElement | number | string
  fallback: ReactElement | number | string
  data: string | string[]
}

const Deferred = ({ children, data, fallback }: DeferredProps) => {
  if (!data) {
    throw new Error('`<Deferred>` requires a `data` prop')
  }

  const [loaded, setLoaded] = useState(false)
  const pageProps = usePage().props
  const keys = useMemo(() => (Array.isArray(data) ? data : [data]), [data])

  useEffect(() => {
    const removeListener = router.on('start', (e) => {
      if (
        (e.detail.visit.only.length === 0 && e.detail.visit.except.length === 0) ||
        e.detail.visit.only.find((key) => keys.includes(key))
      ) {
        setLoaded(false)
      }
    })

    return () => {
      removeListener()
    }
  }, [])

  useEffect(() => {
    setLoaded(keys.every((key) => pageProps[key] !== undefined))
  }, [pageProps, keys])

  return loaded ? children : fallback
}

Deferred.displayName = 'InertiaDeferred'

export default Deferred
