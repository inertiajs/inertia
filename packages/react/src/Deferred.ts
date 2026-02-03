import { isSameUrlWithoutQueryOrHash } from '@inertiajs/core'
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { router } from '.'
import usePage from './usePage'

const keysAreBeingReloaded = (only: string[], except: string[], keys: string[]): boolean => {
  if (only.length > 0 || except.length > 0) {
    return true
  }

  if (only.length > 0) {
    return keys.some((key) => only.includes(key))
  }

  return keys.some((key) => !except.includes(key))
}

interface DeferredSlotProps {
  reloading: boolean
}

interface DeferredProps {
  children: ReactNode | ((props: DeferredSlotProps) => ReactNode)
  fallback: ReactNode | (() => ReactNode)
  data: string | string[]
}

const Deferred = ({ children, data, fallback }: DeferredProps) => {
  if (!data) {
    throw new Error('`<Deferred>` requires a `data` prop to be a string or array of strings')
  }

  const [loaded, setLoaded] = useState(false)
  const [reloading, setReloading] = useState(false)
  const activeReloads = useRef(new Set<object>())
  const pageProps = usePage().props
  const keys = useMemo(() => (Array.isArray(data) ? data : [data]), [data])

  useEffect(() => {
    const removeStartListener = router.on('start', (e) => {
      const visit = e.detail.visit

      if (
        visit.preserveState === true &&
        isSameUrlWithoutQueryOrHash(visit.url, window.location) &&
        keysAreBeingReloaded(visit.only, visit.except, keys)
      ) {
        activeReloads.current.add(visit)
        setReloading(true)
      }
    })

    const removeFinishListener = router.on('finish', (e) => {
      const visit = e.detail.visit

      if (activeReloads.current.has(visit)) {
        activeReloads.current.delete(visit)
        setReloading(activeReloads.current.size > 0)
      }
    })

    return () => {
      removeStartListener()
      removeFinishListener()
      activeReloads.current.clear()
    }
  }, [keys])

  useEffect(() => {
    setLoaded(keys.every((key) => pageProps[key] !== undefined))
  }, [pageProps, keys])

  const propsAreDefined = useMemo(() => keys.every((key) => pageProps[key] !== undefined), [keys, pageProps])

  if (loaded && propsAreDefined) {
    if (typeof children === 'function') {
      return children({ reloading })
    }

    return children
  }

  return typeof fallback === 'function' ? fallback() : fallback
}

Deferred.displayName = 'InertiaDeferred'

export default Deferred
