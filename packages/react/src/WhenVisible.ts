import { ReloadOptions, router } from '@inertiajs/core'
import { createElement, ReactElement, useCallback, useEffect, useMemo, useRef } from 'react'
import usePage from './usePage'

interface WhenVisibleProps {
  children: ReactElement | number | string
  fallback: ReactElement | number | string
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

  const loaded = useRef<boolean>(false)
  const hasFetched = useRef<boolean>(false)
  const fetching = useRef<boolean>(false)
  const ref = useRef<HTMLDivElement>(null)
  const pageProps = usePage().props
  const keys = useMemo(() => (params ? (params.only ?? []) : Array.isArray(data) ? data : [data]), [data, params])

  loaded.current = useMemo(() => {
    if (fetching.current || !loaded.current) return loaded.current

    const propsLoaded = !keys.length ? true : keys.every((key) => pageProps[key] !== undefined)

    if (!propsLoaded) {
      hasFetched.current = false
    }

    return propsLoaded
  }, [pageProps, keys])

  const getReloadParams = useCallback<() => Partial<ReloadOptions>>(() => {
    if (data) {
      return {
        only: keys,
      }
    }

    if (!params) {
      throw new Error('You must provide either a `data` or `params` prop.')
    }

    return params
  }, [params, data, keys])

  useEffect(() => {
    if (!ref.current || loaded.current) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) {
          return
        }

        if (!always && hasFetched.current) {
          observer.disconnect()
        }

        if (fetching.current) {
          return
        }

        hasFetched.current = true
        fetching.current = true

        const reloadParams = getReloadParams()

        router.reload({
          ...reloadParams,
          onStart: (e) => {
            fetching.current = true
            reloadParams.onStart?.(e)
          },
          onFinish: (e) => {
            loaded.current = true
            fetching.current = false
            reloadParams.onFinish?.(e)

            if (!always) {
              observer.disconnect()
            }
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
  }, [ref, getReloadParams, buffer, loaded.current])

  if (always || !loaded.current) {
    return createElement(
      as,
      {
        props: null,
        ref,
      },
      loaded.current ? children : fallback,
    )
  }

  return loaded.current ? children : null
}

WhenVisible.displayName = 'InertiaWhenVisible'

export default WhenVisible
