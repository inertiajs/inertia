import {
  getScrollableParent,
  InfiniteScrollActionSlotProps,
  InfiniteScrollComponentBaseProps,
  InfiniteScrollRef,
  InfiniteScrollSlotProps,
  useInfiniteScroll,
} from '@inertiajs/core'
import { computed, defineComponent, Fragment, h, onMounted, onUnmounted, PropType, ref, SlotsType, watch } from 'vue'

// Vue-specific element resolver
const resolveHTMLElement = (
  value: string | object | (() => HTMLElement | null),
  fallback: HTMLElement | null,
): HTMLElement | null => {
  if (!value) {
    return fallback
  }

  // CSS Selector string
  if (typeof value === 'string') {
    return document.querySelector(value) as HTMLElement | null
  }

  // Function that returns an element
  if (typeof value === 'function') {
    return value() || null
  }

  return fallback
}

const InfiniteScroll = defineComponent({
  name: 'InfiniteScroll',
  slots: Object as SlotsType<{
    default: InfiniteScrollSlotProps
    previous: InfiniteScrollActionSlotProps
    next: InfiniteScrollActionSlotProps
    loading: InfiniteScrollActionSlotProps
  }>,
  props: {
    data: {
      type: String as PropType<InfiniteScrollComponentBaseProps['data']>,
      required: true,
    },
    buffer: {
      type: Number as PropType<InfiniteScrollComponentBaseProps['buffer']>,
      default: 0,
    },
    onlyNext: {
      type: Boolean,
      default: false,
    },
    onlyPrevious: {
      type: Boolean,
      default: false,
    },
    as: {
      type: String as PropType<InfiniteScrollComponentBaseProps['as']>,
      default: 'div',
    },
    manual: {
      type: Boolean as PropType<InfiniteScrollComponentBaseProps['manual']>,
      default: false,
    },
    manualAfter: {
      type: Number as PropType<InfiniteScrollComponentBaseProps['manualAfter']>,
      default: 0,
    },
    preserveUrl: {
      type: Boolean as PropType<InfiniteScrollComponentBaseProps['preserveUrl']>,
      default: false,
    },
    reverse: {
      type: Boolean as PropType<InfiniteScrollComponentBaseProps['reverse']>,
      default: false,
    },
    autoScroll: {
      type: Boolean as PropType<InfiniteScrollComponentBaseProps['autoScroll']>,
      default: undefined,
    },
    itemsElement: {
      type: [String, Function, Object] as PropType<string | (() => HTMLElement | null | undefined)>,
      default: null,
    },
    startElement: {
      type: [String, Function, Object] as PropType<string | (() => HTMLElement | null | undefined)>,
      default: null,
    },
    endElement: {
      type: [String, Function, Object] as PropType<string | (() => HTMLElement | null | undefined)>,
      default: null,
    },
  },
  inheritAttrs: false,
  setup(props, { slots, attrs, expose }) {
    const itemsElementRef = ref<HTMLElement | null>(null)
    const startElementRef = ref<HTMLElement | null>(null)
    const endElementRef = ref<HTMLElement | null>(null)

    const itemsElement = computed<HTMLElement | null>(() =>
      resolveHTMLElement(props.itemsElement, itemsElementRef.value),
    )
    const scrollableParent = computed(() => getScrollableParent(itemsElement.value))
    const startElement = computed<HTMLElement | null>(() =>
      resolveHTMLElement(props.startElement, startElementRef.value),
    )
    const endElement = computed<HTMLElement | null>(() => resolveHTMLElement(props.endElement, endElementRef.value))

    const loadingPrevious = ref(false)
    const loadingNext = ref(false)
    const requestCount = ref(0)
    const hasPreviousPage = ref(false)
    const hasNextPage = ref(false)

    const syncStateFromDataManager = () => {
      requestCount.value = dataManager.getRequestCount()
      hasPreviousPage.value = dataManager.hasPrevious()
      hasNextPage.value = dataManager.hasNext()
    }

    const {
      dataManager,
      elementManager,
      flush: flushInfiniteScroll,
    } = useInfiniteScroll({
      // Data
      getPropName: () => props.data,
      inReverseMode: () => props.reverse,
      shouldFetchNext: () => !props.onlyPrevious,
      shouldFetchPrevious: () => !props.onlyNext,
      shouldPreserveUrl: () => props.preserveUrl,

      // Elements
      getTriggerMargin: () => props.buffer,
      getStartElement: () => startElement.value!,
      getEndElement: () => endElement.value!,
      getItemsElement: () => itemsElement.value!,
      getScrollableParent: () => scrollableParent.value,

      // Request callbacks
      onBeforePreviousRequest: () => (loadingPrevious.value = true),
      onBeforeNextRequest: () => (loadingNext.value = true),
      onCompletePreviousRequest: () => {
        loadingPrevious.value = false
        syncStateFromDataManager()
      },
      onCompleteNextRequest: () => {
        loadingNext.value = false
        syncStateFromDataManager()
      },
      onDataReset: syncStateFromDataManager,
    })

    syncStateFromDataManager()

    const autoLoad = computed<boolean>(() => !manualMode.value)
    const manualMode = computed<boolean>(
      () => props.manual || (props.manualAfter > 0 && requestCount.value >= props.manualAfter),
    )

    const scrollToBottom = () => {
      if (scrollableParent.value) {
        scrollableParent.value.scrollTo({
          top: scrollableParent.value.scrollHeight,
          behavior: 'instant',
        })
      } else {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'instant',
        })
      }
    }

    onMounted(() => {
      elementManager.setupObservers()
      elementManager.processServerLoadedElements(dataManager.getLastLoadedPage())

      // autoScroll defaults to reverse value if not explicitly set
      const shouldAutoScroll = props.autoScroll !== undefined ? props.autoScroll : props.reverse

      if (shouldAutoScroll) {
        scrollToBottom()
      }

      if (autoLoad.value) {
        elementManager.enableTriggers()
      }
    })

    onUnmounted(flushInfiniteScroll)

    watch(
      () => [autoLoad.value, props.onlyNext, props.onlyPrevious],
      ([enabled]) => {
        enabled ? elementManager.enableTriggers() : elementManager.disableTriggers()
      },
    )

    expose<InfiniteScrollRef>({
      fetchNext: dataManager.fetchNext,
      fetchPrevious: dataManager.fetchPrevious,
      hasPrevious: dataManager.hasPrevious,
      hasNext: dataManager.hasNext,
    })

    return () => {
      const renderElements = []

      const sharedExposed: Pick<
        InfiniteScrollActionSlotProps,
        'loadingPrevious' | 'loadingNext' | 'hasPrevious' | 'hasNext'
      > = {
        loadingPrevious: loadingPrevious.value,
        loadingNext: loadingNext.value,
        hasPrevious: hasPreviousPage.value,
        hasNext: hasNextPage.value,
      }

      // Only render previous trigger if not using custom element
      if (!props.startElement) {
        const headerAutoMode = autoLoad.value && !props.onlyNext
        const exposedPrevious: InfiniteScrollActionSlotProps = {
          loading: loadingPrevious.value,
          fetch: dataManager.fetchPrevious,
          autoMode: headerAutoMode,
          manualMode: !headerAutoMode,
          hasMore: hasPreviousPage.value,
          ...sharedExposed,
        }

        renderElements.push(
          h(
            'div',
            { ref: startElementRef },
            slots.previous
              ? slots.previous(exposedPrevious)
              : loadingPrevious.value
                ? slots.loading?.(exposedPrevious)
                : undefined,
          ),
        )
      }

      renderElements.push(
        h(
          props.as,
          { ...attrs, ref: itemsElementRef },
          slots.default?.({
            loading: loadingPrevious.value || loadingNext.value,
            loadingPrevious: loadingPrevious.value,
            loadingNext: loadingNext.value,
          }),
        ),
      )

      // Only render next trigger if not using custom element
      if (!props.endElement) {
        const footerAutoMode = autoLoad.value && !props.onlyPrevious
        const exposedNext: InfiniteScrollActionSlotProps = {
          loading: loadingNext.value,
          fetch: dataManager.fetchNext,
          autoMode: footerAutoMode,
          manualMode: !footerAutoMode,
          hasMore: hasNextPage.value,
          ...sharedExposed,
        }

        renderElements.push(
          h(
            'div',
            { ref: endElementRef },
            slots.next ? slots.next(exposedNext) : loadingNext.value ? slots.loading?.(exposedNext) : undefined,
          ),
        )
      }

      return h(Fragment, {}, props.reverse ? [...renderElements].reverse() : renderElements)
    }
  },
})

export default InfiniteScroll
