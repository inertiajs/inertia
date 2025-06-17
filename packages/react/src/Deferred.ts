import { ReactElement, useEffect, useMemo, useState } from 'react'
import { router } from '.'
import usePage from './usePage'

const urlWithoutHash = (url: URL | Location): URL => {
  url = new URL(url.href)
  url.hash = ''

  return url
}

const isSameUrlWithoutHash = (url1: URL | Location, url2: URL | Location): boolean => {
  return urlWithoutHash(url1).href === urlWithoutHash(url2).href
}

interface DeferredProps {
  children: ReactElement | number | string
  fallback: ReactElement | number | string
  data: string | string[]
}

const Deferred = ({ children, data, fallback }: DeferredProps) => {
  if (!data) {
    throw new Error('`<Deferred>` requires a `data` prop to be a string or array of strings')
  }

  const [loaded, setLoaded] = useState(false)
  const pageProps = usePage().props
  const keys = useMemo(() => (Array.isArray(data) ? data : [data]), [data])

  useEffect(() => {
    const removeListener = router.on('start', (e) => {
      const isPartialVisit = e.detail.visit.only.length > 0 || e.detail.visit.except.length > 0
      const isReloadingKey = e.detail.visit.only.find((key) => keys.includes(key))

      if (isSameUrlWithoutHash(e.detail.visit.url, window.location) && (!isPartialVisit || isReloadingKey)) {
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
