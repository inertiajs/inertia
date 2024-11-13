import { InfiniteScrollProp, ReloadOptions, router } from '@inertiajs/core'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { usePage, WhenVisible } from '.'

export interface InfiniteScrollProps {
  prop: string
  buffer?: number
  trigger?: 'end' | 'start' | 'both'
  autoScroll?: number | boolean
  preserveUrl?: boolean
  manualAfter?: number
  children: React.ReactNode
  fetching: React.ReactElement
  manual?: ({
    fetch,
    fetching,
    position,
  }: {
    fetch: () => void
    fetching: boolean
    position: 'start' | 'end'
  }) => React.ReactElement
}

const InfiniteScroll = ({
  prop,
  buffer = 0,
  trigger = 'end',
  autoScroll = false,
  preserveUrl = false,
  manualAfter = 0,
  children,
  fetching,
  manual,
}: InfiniteScrollProps) => {
  const [showTrigger, setShowTrigger] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [showStartTrigger, setShowStartTrigger] = useState(false)
  const [showEndTrigger, setShowEndTrigger] = useState(false)

  const [lastStartData, setLastStartData] = useState(null)
  const [lastEndData, setLastEndData] = useState(null)

  const loadedData: InfiniteScrollProp<any> = usePage().props[prop]
  const latestData = useRef<InfiniteScrollProp<any> | null>(null)

  const [requestCount, setRequestCount] = useState(0)

  const firstEl = useRef<HTMLElement>(null)
  const scrollableParent = useRef<Element | null>(null)

  const pageNumberObserver = useRef<IntersectionObserver | null>(null)

  latestData.current = loadedData

  useEffect(() => {
    setShowStartTrigger(trigger !== 'end' && showTrigger)
  }, [trigger, showTrigger])

  useEffect(() => {
    setShowEndTrigger(trigger !== 'start' && showTrigger && loadedData.has_next)
  }, [trigger, showTrigger, loadedData])

  useEffect(() => {
    scrollableParent.current = getClosestScrollableParent()
  }, [firstEl.current])

  useEffect(() => {
    if (preserveUrl) {
      return
    }

    pageNumberObserver.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const params = new URLSearchParams(window.location.search)
          const pageNumber = entry.target.getAttribute('data-page-number')
          const pageName = loadedData.page_name

          router.replace({
            ...Object.fromEntries(params.entries()),
            [pageName]: pageNumber,
          })
        }
      })
    })

    return () => {
      pageNumberObserver.current?.disconnect()
    }
  }, [preserveUrl])

  const getClosestScrollableParent = useCallback(() => {
    let parent = firstEl.current?.parentElement

    while (parent) {
      const overflowY = window.getComputedStyle(parent).overflowY

      if (overflowY === 'auto' || overflowY === 'scroll') {
        return parent
      }

      parent = parent.parentElement
    }

    // No scrollable parent found
    return null
  }, [])

  const getWhenVisibleComponent = useCallback(
    (params: ReloadOptions, position: 'start' | 'end') => {
      const manualMode = manualAfter > 0 && requestCount >= manualAfter

      console.log({ ...params })

      if (!manualMode) {
        return (
          <WhenVisible
            always
            buffer={buffer}
            params={{ only: [prop, loadedData.page_name], preserveUrl: true, ...params }}
          >
            {fetching}
          </WhenVisible>
        )
      }

      if (manual === undefined) {
        throw new Error('You must provide a `manual` param when using `manualAfter` prop.')
      }

      return manual({
        fetch: () =>
          router.reload({
            only: [prop, loadedData.page_name],
            preserveUrl: true,
            ...params,
            onStart: (e) => {
              setIsFetching(true)
              params.onStart?.(e)
            },
            onFinish: (e) => {
              setIsFetching(false)

              if (position === 'start') {
                setLastStartData(loadedData)
                tagFirstElementWithPageNumber(loadedData.previous_page)
              } else {
                setLastEndData(loadedData)
                tagLastElementWithPageNumber(loadedData.next_page)
              }

              params.onFinish?.(e)
            },
          }),
        fetching: isFetching,
        position,
      })
    },
    [loadedData],
  )

  const doAutoScroll = useCallback(
    (scrollableParent: Element, scrollPercentage: number) => {
      switch (trigger) {
        case 'start':
          if (scrollableParent) {
            scrollableParent.scrollTop = scrollableParent.scrollHeight * scrollPercentage
          } else {
            window.scrollTo(0, document.body.scrollHeight * scrollPercentage)
          }
          break
      }
    },
    [autoScroll, trigger],
  )

  const tagLastElementWithPageNumber = useCallback(
    (pageNumber) => {
      if (preserveUrl || !firstEl.current) {
        return
      }

      const fetchingElsCount = 0
      //   const fetchingElsCount = this.lastEndData?.has_next ? this.$slots.fetching().length : 0

      let lastEl = firstEl.current.nextElementSibling
      let foundSibling = !!lastEl

      while (foundSibling) {
        if (lastEl?.nextElementSibling) {
          lastEl = lastEl.nextElementSibling
        } else {
          foundSibling = false
        }
      }

      const halfPerPage = Math.floor(loadedData.per_page / 2)

      for (let i = 0; i < fetchingElsCount; i++) {
        lastEl = lastEl?.previousElementSibling
      }

      for (let i = 0; i < halfPerPage; i++) {
        lastEl = lastEl?.previousElementSibling
      }

      if (lastEl) {
        lastEl.setAttribute('data-page-number', pageNumber)
        pageNumberObserver.current?.observe(lastEl)
      }
    },
    [preserveUrl],
  )

  const tagFirstElementWithPageNumber = useCallback(
    (pageNumber) => {
      if (preserveUrl) {
        return
      }

      // TODO: Correct this, would love to use refs instead
      const fetchingElsCount = 1 // this.lastEndData?.has_previous ? this.$slots.fetching().length : 0

      let first = firstEl.current?.nextElementSibling
      let foundSibling = !!first

      if (!foundSibling) {
        return
      }

      const halfPerPage = Math.floor(loadedData.per_page / 2)

      for (let i = 0; i < fetchingElsCount; i++) {
        first = first?.nextElementSibling
      }

      for (let i = 0; i < halfPerPage; i++) {
        first = first?.nextElementSibling
      }

      if (first) {
        first.setAttribute('data-page-number', pageNumber)
        pageNumberObserver.current?.observe(first)
      }
    },
    [preserveUrl],
  )

  const getStartWhenVisibleComponent = useCallback(() => {
    const lastData: InfiniteScrollProp<any> = lastStartData ?? latestData.current

    let currentTopOffset: number | null = null

    const events = {
      onStart: () => {
        currentTopOffset = scrollableParent.current ? scrollableParent.current.scrollHeight : document.body.scrollHeight
      },
      onFinish: () => {
        setLastStartData(latestData.current)
        tagFirstElementWithPageNumber(lastData.previous_page)

        if (currentTopOffset === null) {
          return
        }

        const newScrollHeight = scrollableParent.current
          ? scrollableParent.current.scrollHeight
          : document.body.scrollHeight
        const diff = newScrollHeight - currentTopOffset

        if (scrollableParent.current) {
          scrollableParent.current.scrollTop += diff
        } else {
          window.scrollTo(0, window.scrollY + diff)
        }

        setRequestCount((prev) => prev + 1)
      },
    }

    if (trigger === 'both') {
      if (!lastData.has_previous) {
        return null
      }

      return getWhenVisibleComponent(
        {
          data: {
            [lastData.page_name]: lastData.previous_page,
          },
          ...events,
        },
        'start',
      )
    }

    if (!lastData.has_next) {
      return null
    }

    return getWhenVisibleComponent(
      {
        data: {
          [lastData.page_name]: lastData.next_page,
        },
        ...events,
      },
      'start',
    )
  }, [trigger, showTrigger, lastStartData, latestData])

  const getEndWhenVisibleComponent = useCallback(() => {
    const lastData: InfiniteScrollProp<any> = lastEndData ?? loadedData

    return getWhenVisibleComponent(
      {
        data: {
          [lastData.page_name]: lastData.next_page,
        },
        onFinish: () => {
          setLastEndData(loadedData)
          tagLastElementWithPageNumber(lastData.next_page)
          setRequestCount((prev) => prev + 1)
        },
      },
      'end',
    )
  }, [trigger, showTrigger, loadedData])

  useEffect(() => {
    tagLastElementWithPageNumber(loadedData.current_page)
  }, [])

  useEffect(() => {
    setTimeout(() => {
      setShowTrigger(true)
    }, 100)
  }, [])

  useEffect(() => {
    if (autoScroll === false) {
      return
    }

    setTimeout(() => {
      const scrollableParent = getClosestScrollableParent()

      if (!scrollableParent) {
        return
      }

      const scrollPercentage = (autoScroll === true ? 100 : autoScroll) / 100
      doAutoScroll(scrollableParent, scrollPercentage)
    }, 10)
  }, [autoScroll])

  const newChildren = React.Children.map(children, (child, index) => {
    if (index === 0) {
      return React.cloneElement(child, { ref: firstEl })
    }

    return child
  })

  const startEl = showStartTrigger ? getStartWhenVisibleComponent() : null
  const endEl = showEndTrigger ? getEndWhenVisibleComponent() : null

  return (
    <>
      {startEl}
      {newChildren}
      {endEl}
    </>
  )
}

InfiniteScroll.displayName = 'InertiaInfiniteScroll'

export default InfiniteScroll
