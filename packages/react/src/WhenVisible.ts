import { ReloadOptions, router } from '@inertiajs/core'
import { createElement, ReactElement, useCallback, useEffect, useRef, useState } from 'react'

interface WhenVisibleProps {
  children: ReactElement | number | string
  fallback: ReactElement | number | string
  data: string | string[]
  params?: ReloadOptions
  buffer?: number
  as?: string
  always?: boolean
}

const WhenVisible = ({ children, data, params, buffer, as, always, fallback }: WhenVisibleProps) => {
  always = always ?? false
  as = as ?? 'div'
  fallback = fallback ?? null

  const [loaded, setLoaded] = useState(false)
  const fetchedOnceRef = useRef<boolean>(false)
  const fetchingRef = useRef<boolean>(false)
  const ref = useRef<HTMLDivElement>(null)

  const getReloadParams = useCallback<() => Partial<ReloadOptions>>(() => {
    if (data) {
      return {
        only: (Array.isArray(data) ? data : [data]) as string[],
      }
    }

    if (!params) {
      throw new Error('You must provide either a `data` or `params` prop.')
    }

    return params
  }, [params, data])

  useEffect(() => {
    if (!ref.current) {
      return
    }
    let observer: IntersectionObserver
    observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) {
          return
        }

        if (!always && fetchedOnceRef.current) {
          observer.disconnect()
        }

        if (fetchingRef.current) {
          return
        }

        fetchedOnceRef.current = true
        fetchingRef.current = true

        const reloadParams = getReloadParams()

        router.reload({
          ...reloadParams,
          onStart: (e) => {
            fetchingRef.current = true
            reloadParams.onStart?.(e)
          },
          onFinish: (e) => {
            setLoaded(true)
            fetchingRef.current = false
            reloadParams.onFinish?.(e)
          },
        })
      },
      {
        rootMargin: `${buffer || 0}px`,
      },
    )

    observer.observe(ref.current)

    return () => {
      observer.disconnect()
    }
  }, [ref, getReloadParams, buffer])

  if (always || !loaded) {
    return createElement(
      as,
      {
        props: null,
        ref,
      },
      loaded ? children : fallback,
    )
  }

  return loaded ? children : null
}

WhenVisible.displayName = 'InertiaWhenVisible'

export default WhenVisible
