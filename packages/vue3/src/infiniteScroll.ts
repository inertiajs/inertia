import {
  ActiveVisit,
  debounce,
  getElementsInViewportFromCollection,
  Page,
  ReloadOptions,
  router,
  useIntersectionObservers,
} from '@inertiajs/core'
import { computed, defineComponent, Fragment, h, onMounted, onUnmounted, PropType, ref, watch } from 'vue'
import { usePage } from './app'

const datasetKey = 'infiniteScrollPage'

const InfiniteScroll = defineComponent({
  name: 'InfiniteScroll',
  props: {
    data: {
      type: String,
    },
    buffer: {
      type: Number,
      default: 0,
    },
    trigger: {
      type: String as PropType<'start' | 'end' | 'both'>,
      default: 'end',
    },
    as: {
      type: String,
      default: 'div',
    },
    manual: {
      type: Boolean,
      default: false,
    },
    manualAfter: {
      type: Number,
      default: 0,
    },
    dataWrapper: {
      type: String,
      default: null,
    },
    queryParam: {
      type: String,
      default: null,
    },
  },
  inheritAttrs: false,
  setup(props, { slots, attrs }) {
    const page = usePage()
    const pagination = ref(page.paginateProps[props.data])
    const requestCount = ref(0)

    const autoLoad = computed<boolean>(() => {
      if (props.manual) {
        return false
      }

      if (props.manualAfter > 0 && requestCount.value >= props.manualAfter) {
        return false
      }

      return true
    })

    const startElement = ref<HTMLElement | null>(null)
    const slotElement = ref<HTMLElement | null>(null)
    const endElement = ref<HTMLElement | null>(null)

    let startElementObserver: IntersectionObserver
    let itemsObserver: IntersectionObserver
    let endElementObserver: IntersectionObserver

    const loading = ref(false)

    const getScrollableContainer = (element: HTMLElement | null): HTMLElement | null => {
      let parent = element?.parentElement

      while (parent) {
        const overflowY = window.getComputedStyle(parent).overflowY

        if (overflowY === 'auto' || overflowY === 'scroll') {
          return parent
        }

        parent = parent.parentElement
      }

      return null
    }

    const fetchPrevious = () => {
      const scrollableContainer = getScrollableContainer(slotElement.value)
      let currentScrollTop: number
      let referenceElement: Element | null = null
      let referenceElementTop: number = 0

      load(pagination.value.previous, {
        headers: {
          'X-Inertia-Scroll-Direction': 'up',
        },
        onBeforeUpdate: () => {
          currentScrollTop = scrollableContainer?.scrollTop || window.scrollY

          // Start from the first element in the slot and find the first visible element
          const visibleElements = getElementsInViewportFromCollection(
            slotElement.value.firstElementChild as HTMLElement,
            slotElement.value.children,
          )

          if (visibleElements.length > 0) {
            referenceElement = visibleElements[0]
            const containerRect = scrollableContainer?.getBoundingClientRect() || { top: 0 }
            const containerTop = scrollableContainer ? containerRect.top : 0
            const rect = referenceElement.getBoundingClientRect()
            referenceElementTop = rect.top - containerTop
          }
        },
        onSuccess: (page: Page) => {
          pagination.value.previous = page.paginateProps[props.data].previous
          pagination.value.hasPreviousPage = page.paginateProps[props.data].hasPreviousPage
        },
        onFinish: () => {
          if (!referenceElement) {
            return
          }

          window.queueMicrotask(() => {
            // Find where our reference element is now and adjust scroll to maintain its position
            const containerRect = scrollableContainer?.getBoundingClientRect() || { top: 0 }
            const containerTop = scrollableContainer ? containerRect.top : 0
            const newRect = referenceElement.getBoundingClientRect()
            const newElementTop = newRect.top - containerTop

            // Calculate how much to adjust scroll to keep the reference element in the same visual position
            const adjustment = newElementTop - referenceElementTop

            if (scrollableContainer) {
              scrollableContainer.scrollTop = currentScrollTop + adjustment
            } else {
              window.scrollTo(0, window.scrollY + adjustment)
            }
          })
        },
      })
    }

    const fetchNext = () => {
      load(pagination.value.next, {
        headers: {
          'X-Inertia-Scroll-Direction': 'down',
        },
        onSuccess: () => {
          pagination.value.next = page.paginateProps[props.data].next
          pagination.value.hasNextPage = page.paginateProps[props.data].hasNextPage
        },
      })
    }

    const replaceUrl = (target) => {
      // Create a map of items per page
      const pageMap = new Map<string, number>()

      getElementsInViewportFromCollection(target, slotElement.value.children).forEach((element) => {
        const nullPlaceholder = '__NULL__'
        const page = element.dataset[datasetKey] ?? nullPlaceholder

        if (pageMap.has(page)) {
          pageMap.set(page, pageMap.get(page)! + 1)
        } else {
          pageMap.set(page, 1)
        }
      })

      const sortedPages = Array.from(pageMap.entries()).sort((a, b) => b[1] - a[1])
      const mostVisiblePage = sortedPages[0]?.[0]

      if (mostVisiblePage === undefined) {
        return
      }

      const url = new URL(window.location.href)
      const queryParam = pagination.value.name || props.queryParam || 'page'

      if (mostVisiblePage === '1' || mostVisiblePage === '__NULL__') {
        url.searchParams.delete(queryParam)
      } else {
        url.searchParams.set(queryParam, mostVisiblePage.toString())
      }

      router.replace({
        url: url.toString(),
        preserveScroll: true,
        preserveState: true,
      })
    }

    const onIntersectingItem = debounce((entry: IntersectionObserverEntry) => {
      replaceUrl(entry.target)
    }, 250)

    const load = (value: string | number | null, options: ReloadOptions = {}) => {
      if (loading.value || value === null) {
        return
      }

      loading.value = true

      router.reload({
        ...options,
        data: {
          [pagination.value.name]: value,
        },
        only: [props.data],
        preserveUrl: true, // we handle URL updates manually via replaceUrl
        onSuccess: (page: Page) => {
          loading.value = false
          pagination.value.current = page.paginateProps[props.data].current
          options.onSuccess?.(page)
        },
        onFinish: (visit: ActiveVisit) => {
          requestCount.value += 1
          processSlotChildren(pagination.value.current)
          options.onFinish?.(visit)
        },
      })
    }

    const processSlotChildren = (identifier: string | number | null) => {
      if (typeof identifier === 'undefined' || identifier === null) {
        return
      }

      const newChildren = Array.from(slotElement.value?.children || []).filter(
        (child: HTMLElement) => !(datasetKey in child.dataset),
      )

      newChildren.forEach((child: HTMLElement) => {
        child.dataset[datasetKey] = identifier.toString()
        itemsObserver.observe(child)
      })
    }

    const toggleStartAndEndTriggers = (enabled: boolean) => {
      if (enabled) {
        props.trigger !== 'end' && startElementObserver.observe(startElement.value!)
        props.trigger !== 'start' && endElementObserver.observe(endElement.value!)
      } else {
        startElementObserver.disconnect()
        endElementObserver.disconnect()
      }
    }

    const intersectionObservers = useIntersectionObservers()

    onMounted(() => {
      itemsObserver = intersectionObservers.new(onIntersectingItem)
      processSlotChildren(pagination.value.current)

      const observerOptions = { root: getScrollableContainer(slotElement.value), rootMargin: `${props.buffer}px` }
      startElementObserver = intersectionObservers.new(fetchPrevious, observerOptions)
      endElementObserver = intersectionObservers.new(fetchNext, observerOptions)

      toggleStartAndEndTriggers(autoLoad.value)
    })

    onUnmounted(intersectionObservers.flush)

    watch(autoLoad, toggleStartAndEndTriggers)

    return () => {
      const exposed = {
        loading: loading.value,
        pagination: pagination.value,
      }

      const exposedHeader = {
        ...exposed,
        fetch: fetchPrevious,
        autoMode: autoLoad.value && props.trigger !== 'end',
      }

      const exposedFooter = {
        ...exposed,
        fetch: fetchNext,
        autoMode: autoLoad.value && props.trigger !== 'start',
      }

      return h(Fragment, {}, [
        h(
          'div',
          { ref: startElement, style: { minHeight: '1px' } },
          slots.header ? slots.header(exposedHeader) : loading.value ? slots.loading?.(exposed) : null,
        ),
        h(props.as, { ...attrs, ref: slotElement }, slots.default?.(exposed)),
        h(
          'div',
          { ref: endElement, style: { minHeight: '1px' } },
          slots.footer ? slots.footer(exposedFooter) : loading.value ? slots.loading?.(exposed) : null,
        ),
      ])
    }
  },
})

export default InfiniteScroll
