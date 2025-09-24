import {
  getScrollableParent,
  InfiniteScrollActionSlotProps,
  InfiniteScrollComponentBaseProps,
  InfiniteScrollRef,
  InfiniteScrollSlotProps,
  useInfiniteScroll,
  UseInfiniteScrollProps,
} from '@inertiajs/core'
import React, {
  createElement,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'

const resolveHTMLElement = (
  value: string | React.RefObject<HTMLElement | null> | null,
  fallback: HTMLElement | null,
): HTMLElement | null => {
  if (!value) {
    return fallback
  }

  // React ref object { current: HTMLElement | null }
  if (value && typeof value === 'object' && 'current' in value) {
    return value.current
  }

  // CSS Selector string
  if (typeof value === 'string') {
    return document.querySelector(value) as HTMLElement | null
  }

  return fallback
}

// Helper function to render slot content
const renderSlot = (
  slotContent: React.ReactNode | ((props: InfiniteScrollActionSlotProps) => React.ReactNode) | undefined,
  slotProps: InfiniteScrollActionSlotProps,
  fallback: React.ReactNode = null,
): React.ReactNode => {
  if (!slotContent) {
    return fallback
  }

  return typeof slotContent === 'function' ? slotContent(slotProps) : slotContent
}

export interface InfiniteScrollProps
  extends InfiniteScrollComponentBaseProps,
    Omit<React.HTMLAttributes<HTMLElement>, keyof InfiniteScrollComponentBaseProps | 'children'> {
  children?: React.ReactNode | ((props: InfiniteScrollSlotProps) => React.ReactNode)

  // Element references for custom trigger detection (when you want different trigger elements)
  beforeElement?: string | React.RefObject<HTMLElement | null>
  afterElement?: string | React.RefObject<HTMLElement | null>
  slotElement?: string | React.RefObject<HTMLElement | null>

  // Render slots for UI components (when you want custom loading/action components)
  before?: React.ReactNode | ((props: InfiniteScrollActionSlotProps) => React.ReactNode)
  after?: React.ReactNode | ((props: InfiniteScrollActionSlotProps) => React.ReactNode)
  loading?: React.ReactNode | ((props: InfiniteScrollActionSlotProps) => React.ReactNode)
}

const InfiniteScroll = forwardRef<InfiniteScrollRef, InfiniteScrollProps>(
  (
    {
      data,
      buffer = 0,
      trigger = 'both',
      as = 'div',
      manual = false,
      manualAfter = 0,
      preserveUrl = false,
      reverse = false,
      autoScroll,
      children,
      beforeElement,
      afterElement,
      slotElement,
      before,
      after,
      loading,
      ...props
    },
    ref,
  ) => {
    const [beforeElementFromRef, setBeforeElementFromRef] = useState<HTMLElement | null>(null)
    const beforeElementRef = useCallback((node: HTMLElement | null) => setBeforeElementFromRef(node), [])

    const [afterElementFromRef, setAfterElementFromRef] = useState<HTMLElement | null>(null)
    const afterElementRef = useCallback((node: HTMLElement | null) => setAfterElementFromRef(node), [])

    const [slotElementFromRef, setSlotElementFromRef] = useState<HTMLElement | null>(null)
    const slotElementRef = useCallback((node: HTMLElement | null) => setSlotElementFromRef(node), [])

    const [loadingBefore, setLoadingBefore] = useState(false)
    const [loadingAfter, setLoadingAfter] = useState(false)
    const [requestCount, setRequestCount] = useState(0)

    const [resolvedBeforeElement, setResolvedBeforeElement] = useState<HTMLElement | null>(null)
    const [resolvedAfterElement, setResolvedAfterElement] = useState<HTMLElement | null>(null)
    const [resolvedSlotElement, setResolvedSlotElement] = useState<HTMLElement | null>(null)

    // Update elements when refs or props change
    useEffect(() => {
      const element = beforeElement ? resolveHTMLElement(beforeElement, beforeElementFromRef) : beforeElementFromRef
      setResolvedBeforeElement(element)
    }, [beforeElement, beforeElementFromRef])

    useEffect(() => {
      const element = afterElement ? resolveHTMLElement(afterElement, afterElementFromRef) : afterElementFromRef
      setResolvedAfterElement(element)
    }, [afterElement, afterElementFromRef])

    useEffect(() => {
      const element = slotElement ? resolveHTMLElement(slotElement, slotElementFromRef) : slotElementFromRef
      setResolvedSlotElement(element)
    }, [slotElement, slotElementFromRef])

    const scrollableParent = useMemo(() => getScrollableParent(resolvedSlotElement), [resolvedSlotElement])

    const manualMode = useMemo(
      () => manual || (manualAfter > 0 && requestCount >= manualAfter),
      [manual, manualAfter, requestCount],
    )
    const autoLoad = useMemo(() => !manualMode, [manualMode])

    const callbackPropsRef = useRef({
      buffer,
      trigger,
      reverse,
      preserveUrl,
    })

    callbackPropsRef.current = {
      buffer,
      trigger,
      reverse,
      preserveUrl,
    }

    const [infiniteScroll, setInfiniteScroll] = useState<UseInfiniteScrollProps | null>(null)

    const dataManager = useMemo(() => infiniteScroll?.dataManager, [infiniteScroll])
    const elementManager = useMemo(() => infiniteScroll?.elementManager, [infiniteScroll])

    const scrollToBottom = useCallback(() => {
      if (scrollableParent) {
        scrollableParent.scrollTo({
          top: scrollableParent.scrollHeight,
          behavior: 'instant',
        })
      } else {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'instant',
        })
      }
    }, [scrollableParent])

    // Main setup effect - only recreate when structural dependencies change
    useEffect(() => {
      if (!resolvedSlotElement) {
        return
      }

      const infiniteScrollInstance = useInfiniteScroll({
        // Data
        getPropName: () => data,
        inReverseMode: () => callbackPropsRef.current.reverse,
        shouldPreserveUrl: () => callbackPropsRef.current.preserveUrl,

        // Elements
        getTrigger: () => callbackPropsRef.current.trigger,
        getTriggerMargin: () => callbackPropsRef.current.buffer,
        getBeforeElement: () => resolvedBeforeElement,
        getAfterElement: () => resolvedAfterElement,
        getSlotElement: () => resolvedSlotElement,
        getScrollableParent: () => scrollableParent,

        // Request callbacks
        onRequestStart: (side) => {
          if (side === 'before') {
            setLoadingBefore(true)
          } else {
            setLoadingAfter(true)
          }
        },
        onRequestComplete: (side) => {
          setRequestCount((previous) => previous + 1)

          if (side === 'before') {
            setLoadingBefore(false)
          } else {
            setLoadingAfter(false)
          }
        },
      })

      setInfiniteScroll(infiniteScrollInstance)
      const { dataManager, elementManager } = infiniteScrollInstance

      elementManager.setupObservers()
      elementManager.processServerLoadedElements(dataManager.getLastLoadedPage())

      // autoScroll defaults to reverse value if not explicitly set
      const shouldAutoScroll = autoScroll !== undefined ? autoScroll : reverse

      if (shouldAutoScroll) {
        scrollToBottom()
      }

      if (autoLoad) {
        elementManager.enableTriggers()
      }

      return () => {
        elementManager.flushAll()
        setInfiniteScroll(null)
      }
    }, [data, resolvedSlotElement, resolvedBeforeElement, resolvedAfterElement, scrollableParent])

    useEffect(() => {
      autoLoad ? elementManager?.enableTriggers() : elementManager?.disableTriggers()
    }, [autoLoad, trigger, reverse, resolvedBeforeElement, resolvedAfterElement])

    useImperativeHandle(
      ref,
      () => ({
        loadAfter: dataManager?.loadAfter || (() => {}),
        loadBefore: dataManager?.loadBefore || (() => {}),
        hasMoreBefore: dataManager?.hasMoreBefore || (() => false),
        hasMoreAfter: dataManager?.hasMoreAfter || (() => false),
      }),
      [dataManager],
    )

    const headerAutoMode = autoLoad && trigger !== 'end'
    const footerAutoMode = autoLoad && trigger !== 'start'

    const exposedBefore: InfiniteScrollActionSlotProps = {
      loading: loadingBefore,
      loadingBefore,
      loadingAfter,
      fetch: dataManager?.loadBefore || (() => {}),
      autoMode: headerAutoMode,
      manualMode: !headerAutoMode,
      hasMore: dataManager?.hasMoreBefore() || false,
    }

    const exposedAfter: InfiniteScrollActionSlotProps = {
      loading: loadingAfter,
      loadingBefore,
      loadingAfter,
      fetch: dataManager?.loadAfter || (() => {}),
      autoMode: footerAutoMode,
      manualMode: !footerAutoMode,
      hasMore: dataManager?.hasMoreAfter() || false,
    }

    const exposedSlot: InfiniteScrollSlotProps = {
      loading: loadingBefore || loadingAfter,
      loadingBefore,
      loadingAfter,
    }

    const renderElements = []

    // Only render before trigger if not using custom element selector/ref
    if (!beforeElement) {
      renderElements.push(
        createElement(
          'div',
          { ref: beforeElementRef },
          // Render before slot or fallback to loading indicator
          renderSlot(before, exposedBefore, loadingBefore ? renderSlot(loading, exposedBefore) : null),
        ),
      )
    }

    renderElements.push(
      createElement(
        as,
        { ...props, ref: slotElementRef },
        typeof children === 'function' ? children(exposedSlot) : children,
      ),
    )

    // Only render after trigger if not using custom element selector/ref
    if (!afterElement) {
      renderElements.push(
        createElement(
          'div',
          { ref: afterElementRef },
          // Render after slot or fallback to loading indicator
          renderSlot(after, exposedAfter, loadingAfter ? renderSlot(loading, exposedAfter) : null),
        ),
      )
    }

    return createElement(React.Fragment, {}, ...renderElements)
  },
)

InfiniteScroll.displayName = 'InertiaInfiniteScroll'

export default InfiniteScroll
