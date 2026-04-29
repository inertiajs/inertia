import { isSameUrlWithoutQueryOrHash, visitReloadsProps } from '@inertiajs/core'
import { get } from 'es-toolkit/compat'
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { router } from '.'
import usePage from './usePage'

interface DeferredSlotProps {
  reloading: boolean
}

interface DeferredProps {
  children: ReactNode | ((props: DeferredSlotProps) => ReactNode)
  error?: ReactNode | (() => ReactNode)
  fallback: ReactNode | (() => ReactNode)
  data: string | string[]
}

const Deferred = ({ children, data, error, fallback }: DeferredProps) => {
  if (!data) {
    throw new Error('`<Deferred>` requires a `data` prop to be a string or array of strings')
  }

  if (!fallback) {
    throw new Error('`<Deferred>` requires a `fallback` prop')
  }

  const [reloading, setReloading] = useState(false)
  const activeReloads = useRef(new Set<object>())
  const page = usePage()
  const pageProps = page.props
  const keys = useMemo(() => (Array.isArray(data) ? data : [data]), [data])
  const rescuedKeys = useMemo(() => new Set(page.rescuedProps || []), [page.rescuedProps])

  useEffect(() => {
    const removeStartListener = router.on('start', (e) => {
      const visit = e.detail.visit

      if (
        visit.preserveState === true &&
        isSameUrlWithoutQueryOrHash(visit.url, window.location) &&
        visitReloadsProps(visit, keys)
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

  const propsAreDefined = useMemo(() => keys.every((key) => get(pageProps, key) !== undefined), [keys, pageProps])
  const propsAreSettled = useMemo(
    () => keys.every((key) => get(pageProps, key) !== undefined || rescuedKeys.has(key)),
    [keys, pageProps, rescuedKeys],
  )
  const hasRescuedProps = useMemo(() => keys.some((key) => rescuedKeys.has(key)), [keys, rescuedKeys])

  if (propsAreDefined && !hasRescuedProps) {
    if (typeof children === 'function') {
      return children({ reloading })
    }

    return children
  }

  if (propsAreSettled && hasRescuedProps && error) {
    return typeof error === 'function' ? error() : error
  }

  return typeof fallback === 'function' ? fallback() : fallback
}

Deferred.displayName = 'InertiaDeferred'

export default Deferred
