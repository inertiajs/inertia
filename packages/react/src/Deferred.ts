import { ReactNode, useEffect, useMemo, useState } from 'react'
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

interface DeferredSlotProps {
  reloading: boolean
}

interface DeferredProps {
  children: ReactNode | (() => ReactNode)
  fallback: ReactNode | ((props: DeferredSlotProps) => ReactNode)
  data: string | string[]
}

const Deferred = ({ children, data, fallback }: DeferredProps) => {
  if (!data) {
    throw new Error('`<Deferred>` requires a `data` prop to be a string or array of strings')
  }

  const [loaded, setLoaded] = useState(false)
  const [reloading, setReloading] = useState(false)
  const pageProps = usePage().props
  const keys = useMemo(() => (Array.isArray(data) ? data : [data]), [data])

  useEffect(() => {
    const removeStartListener = router.on('start', (e) => {
      const isPartialVisit = e.detail.visit.only.length > 0 || e.detail.visit.except.length > 0
      const isReloadingKey = e.detail.visit.only.find((key) => keys.includes(key))

      if (isSameUrlWithoutHash(e.detail.visit.url, window.location) && (!isPartialVisit || isReloadingKey)) {
        setLoaded(false)
        setReloading(true)
      }
    })

    const removeFinishListener = router.on('finish', () => {
      setReloading(false)
    })

    return () => {
      removeStartListener()
      removeFinishListener()
    }
  }, [])

  useEffect(() => {
    setLoaded(keys.every((key) => pageProps[key] !== undefined))
  }, [pageProps, keys])

  // Always check that props are actually defined before rendering children,
  // even if loaded is true, to prevent race conditions during reloads
  const propsAreDefined = useMemo(() => keys.every((key) => pageProps[key] !== undefined), [keys, pageProps])

  if (loaded && propsAreDefined) {
    return typeof children === 'function' ? children() : children
  }

  // React reverts to the fallback while deferred props are reloading, so the `reloading`
  // flag is exposed here to distinguish an initial load from a reload.
  return typeof fallback === 'function' ? fallback({ reloading }) : fallback
}

Deferred.displayName = 'InertiaDeferred'

export default Deferred
