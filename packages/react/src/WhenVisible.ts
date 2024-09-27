import { ReloadOptions, router } from '@inertiajs/core'
import { createElement, ReactChild, useEffect, useRef, useState } from 'react'

interface WhenVisibleProps {
  children: ReactChild
  fallback: ReactChild
  data: string | string[]
  params?: ReloadOptions
  buffer?: number
  elementTag?: string
  once?: boolean
}

const WhenVisible = ({ children, data, params, buffer, elementTag, once, fallback }: WhenVisibleProps) => {
  once = once ?? true
  elementTag = elementTag ?? 'div'
  fallback = fallback ?? null

  const [loaded, setLoaded] = useState(false)
  const [fetching, setFetching] = useState(false)
  const observer = useRef<IntersectionObserver | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  const getReloadParams = (): Partial<ReloadOptions> => {
    if (data) {
      return {
        only: (Array.isArray(data) ? data : [data]) as string[],
      }
    }

    if (!params) {
      throw new Error('You must provide either a `data` or `params` prop.')
    }

    return params
  }

  useEffect(() => {
    if (!ref.current) {
      return
    }

    observer.current = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) {
          return
        }

        if (once) {
          observer.current?.disconnect()
        }

        if (fetching) {
          return
        }

        setFetching(true)

        const reloadParams = getReloadParams()

        router.reload({
          ...reloadParams,
          onStart: (e) => {
            setFetching(true)
            reloadParams.onStart?.(e)
          },
          onFinish: (e) => {
            setLoaded(true)
            setFetching(false)
            reloadParams.onFinish?.(e)
          },
        })
      },
      {
        rootMargin: `${buffer || 0}px`,
      },
    )

    observer.current.observe(ref.current)

    return () => {
      observer.current?.disconnect()
    }
  }, [ref])

  if (!once || !loaded) {
    return createElement(
      elementTag,
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
