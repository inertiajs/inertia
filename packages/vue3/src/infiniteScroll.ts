import {
  getScrollableParent,
  InfiniteScrollActionSlotProps,
  InfiniteScrollComponentBaseProps,
  InfiniteScrollRef,
  InfiniteScrollSlotProps,
  useInfiniteScroll,
} from '@inertiajs/core'
import { computed, defineComponent, Fragment, h, onMounted, onUnmounted, PropType, ref, watch } from 'vue'

// Vue-specific element resolver
const resolveHTMLElement = (value, fallback): HTMLElement | null => {
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
  props: {
    data: {
      type: String as PropType<InfiniteScrollComponentBaseProps['data']>,
    },
    buffer: {
      type: Number as PropType<InfiniteScrollComponentBaseProps['buffer']>,
      default: 0,
    },
    trigger: {
      type: String as PropType<InfiniteScrollComponentBaseProps['trigger']>,
      default: 'both',
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
    slotElement: {
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
    const slotElementRef = ref<HTMLElement | null>(null)
    const startElementRef = ref<HTMLElement | null>(null)
    const endElementRef = ref<HTMLElement | null>(null)

    const slotElement = computed<HTMLElement | null>(() => resolveHTMLElement(props.slotElement, slotElementRef.value))
    const scrollableParent = computed(() => getScrollableParent(slotElement.value))
    const startElement = computed<HTMLElement | null>(() =>
      resolveHTMLElement(props.startElement, startElementRef.value),
    )
    const endElement = computed<HTMLElement | null>(() => resolveHTMLElement(props.endElement, endElementRef.value))

    const loadingPrevious = ref(false)
    const loadingNext = ref(false)
    const requestCount = ref(0)

    const autoLoad = computed<boolean>(() => !manualMode.value)
    const manualMode = computed<boolean>(
      () => props.manual || (props.manualAfter > 0 && requestCount.value >= props.manualAfter),
    )

    const { dataManager, elementManager } = useInfiniteScroll({
      // Data
      getPropName: () => props.data,
      inReverseMode: () => props.reverse,
      shouldPreserveUrl: () => props.preserveUrl,

      // Elements
      getTrigger: () => props.trigger,
      getTriggerMargin: () => props.buffer,
      getStartElement: () => startElement.value!,
      getEndElement: () => endElement.value!,
      getSlotElement: () => slotElement.value!,
      getScrollableParent: () => scrollableParent.value,

      // Request callbacks
      onBeforePreviousRequest: () => (loadingPrevious.value = true),
      onBeforeNextRequest: () => (loadingNext.value = true),
      onCompletePreviousRequest: () => {
        requestCount.value += 1
        loadingPrevious.value = false
      },
      onCompleteNextRequest: () => {
        requestCount.value += 1
        loadingNext.value = false
      },
    })

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

    onUnmounted(elementManager.flushAll)

    watch(
      () => [autoLoad.value, props.trigger],
      ([enabled]) => {
        enabled ? elementManager.enableTriggers() : elementManager.disableTriggers()
      },
    )

    expose<InfiniteScrollRef>({
      loadNext: dataManager.loadNext,
      loadPrevious: dataManager.loadPrevious,
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
        hasPrevious: dataManager.hasPrevious(),
        hasNext: dataManager.hasNext(),
      }

      // Only render previous trigger if not using custom element
      if (!props.startElement) {
        const headerAutoMode = autoLoad.value && props.trigger !== 'end'
        const exposedPrevious: InfiniteScrollActionSlotProps = {
          loading: loadingPrevious.value,
          fetch: dataManager.loadPrevious,
          autoMode: headerAutoMode,
          manualMode: !headerAutoMode,
          hasMore: dataManager.hasPrevious(),
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
                : null,
          ),
        )
      }

      renderElements.push(
        h(
          props.as,
          { ...attrs, ref: slotElementRef },
          slots.default?.({
            loading: loadingPrevious.value || loadingNext.value,
            loadingPrevious: loadingPrevious.value,
            loadingNext: loadingNext.value,
          } as InfiniteScrollSlotProps),
        ),
      )

      // Only render next trigger if not using custom element
      if (!props.endElement) {
        const footerAutoMode = autoLoad.value && props.trigger !== 'start'
        const exposedNext: InfiniteScrollActionSlotProps = {
          loading: loadingNext.value,
          fetch: dataManager.loadNext,
          autoMode: footerAutoMode,
          manualMode: !footerAutoMode,
          hasMore: dataManager.hasNext(),
          ...sharedExposed,
        }

        renderElements.push(
          h(
            'div',
            { ref: endElementRef },
            slots.next ? slots.next(exposedNext) : loadingNext.value ? slots.loading?.(exposedNext) : null,
          ),
        )
      }

      return h(Fragment, {}, props.reverse ? [...renderElements].reverse() : renderElements)
    }
  },
})

export default InfiniteScroll
