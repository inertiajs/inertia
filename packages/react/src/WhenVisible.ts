import { ReloadOptions, router } from '@inertiajs/core'
import { createElement, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import usePage from './usePage'

interface WhenVisibleSlotProps {
  fetching: boolean
}

interface WhenVisibleProps {
  children: ReactNode | ((props: WhenVisibleSlotProps) => ReactNode)
  fallback: ReactNode | (() => ReactNode)
  data?: string | string[]
  params?: ReloadOptions
  buffer?: number
  as?: string
  always?: boolean
}

const WhenVisible = ({ children, data, params, buffer, as, always, fallback }: WhenVisibleProps) => {
  always = always ?? false
  as = as ?? 'div'
  fallback = fallback ?? null

  const pageProps = usePage().props
  const keys = useMemo(() => (data ? (Array.isArray(data) ? data : [data]) : []), [data])

  const [loaded, setLoaded] = useState(() => keys.length > 0 && keys.every((key) => pageProps[key] !== undefined))
  const [isFetching, setIsFetching] = useState(false)
  const fetching = useRef<boolean>(false)
  const ref = useRef<HTMLDivElement>(null)
  const observer = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (keys.length > 0) {
      setLoaded(keys.every((key) => pageProps[key] !== undefined))
    }
  }, [pageProps, keys])

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

  const registerObserver = () => {
    observer.current?.disconnect()

    observer.current = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) {
          return
        }

        if (fetching.current) {
          return
        }

        if (!always && loaded) {
          return
        }

        fetching.current = true
        setIsFetching(true)

        const reloadParams = getReloadParams()

        router.reload({
          ...reloadParams,
          onStart: (e) => {
            fetching.current = true
            setIsFetching(true)
            reloadParams.onStart?.(e)
          },
          onFinish: (e) => {
            setLoaded(true)
            fetching.current = false
            setIsFetching(false)
            reloadParams.onFinish?.(e)

            if (!always) {
              observer.current?.disconnect()
            }
          },
        })
      },
      {
        rootMargin: `${buffer || 0}px`,
      },
    )

    observer.current.observe(ref.current!)
  }

  useEffect(() => {
    if (!ref.current) {
      return
    }

    if (loaded && !always) {
      return
    }

    registerObserver()

    return () => {
      observer.current?.disconnect()
    }
  }, [always, loaded, ref, getReloadParams, buffer])

  const resolveChildren = () => (typeof children === 'function' ? children({ fetching: isFetching }) : children)
  const resolveFallback = () => (typeof fallback === 'function' ? fallback() : fallback)

  if (always || !loaded) {
    return createElement(
      as,
      {
        props: null,
        ref,
      },
      loaded ? resolveChildren() : resolveFallback(),
    )
  }

  return loaded ? resolveChildren() : null
}

WhenVisible.displayName = 'InertiaWhenVisible'

export default WhenVisible
