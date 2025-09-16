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
    beforeElement: {
      type: [String, Function, Object] as PropType<string | (() => HTMLElement | null | undefined)>,
      default: null,
    },
    afterElement: {
      type: [String, Function, Object] as PropType<string | (() => HTMLElement | null | undefined)>,
      default: null,
    },
  },
  inheritAttrs: false,
  setup(props, { slots, attrs, expose }) {
    const slotElementRef = ref<HTMLElement | null>(null)
    const beforeElementRef = ref<HTMLElement | null>(null)
    const afterElementRef = ref<HTMLElement | null>(null)

    const slotElement = computed<HTMLElement | null>(() => resolveHTMLElement(props.slotElement, slotElementRef.value))
    const scrollableParent = computed(() => getScrollableParent(slotElement.value))
    const beforeElement = computed<HTMLElement | null>(() =>
      resolveHTMLElement(props.beforeElement, beforeElementRef.value),
    )
    const afterElement = computed<HTMLElement | null>(() =>
      resolveHTMLElement(props.afterElement, afterElementRef.value),
    )

    const loadingBefore = ref(false)
    const loadingAfter = ref(false)
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
      getBeforeElement: () => beforeElement.value!,
      getAfterElement: () => afterElement.value!,
      getSlotElement: () => slotElement.value!,
      getScrollableParent: () => scrollableParent.value,

      // Request callbacks
      onRequestStart: (side) => {
        if (side === 'before') {
          loadingBefore.value = true
        } else {
          loadingAfter.value = true
        }
      },
      onRequestComplete: (side) => {
        requestCount.value += 1

        if (side === 'before') {
          loadingBefore.value = false
        } else {
          loadingAfter.value = false
        }
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

    onUnmounted(elementManager.flushAll())

    watch(
      () => [autoLoad.value, props.trigger, props.reverse],
      ([enabled]) => {
        enabled ? elementManager.enableTriggers() : elementManager.disableTriggers()
      },
    )

    expose<InfiniteScrollRef>({
      loadAfter: dataManager.loadAfter,
      loadBefore: dataManager.loadBefore,
      hasMoreBefore: dataManager.hasMoreBefore,
      hasMoreAfter: dataManager.hasMoreAfter,
    })

    return () => {
      const renderElements = []

      // Only render before trigger if not using custom element
      if (!props.beforeElement) {
        const headerAutoMode = autoLoad.value && props.trigger !== 'end'
        const exposedBefore: InfiniteScrollActionSlotProps = {
          loading: loadingBefore.value,
          loadingBefore: loadingBefore.value,
          loadingAfter: loadingAfter.value,
          fetch: dataManager.loadBefore,
          autoMode: headerAutoMode,
          manualMode: !headerAutoMode,
          hasMore: dataManager.hasMoreBefore(),
        }

        renderElements.push(
          h(
            'div',
            { ref: beforeElementRef },
            slots.before ? slots.before(exposedBefore) : loadingBefore.value ? slots.loading?.(exposedBefore) : null,
          ),
        )
      }

      renderElements.push(
        h(
          props.as,
          { ...attrs, ref: slotElementRef },
          slots.default?.({
            loading: loadingBefore.value || loadingAfter.value,
            loadingBefore: loadingBefore.value,
            loadingAfter: loadingAfter.value,
          } as InfiniteScrollSlotProps),
        ),
      )

      // Only render after trigger if not using custom element
      if (!props.afterElement) {
        const footerAutoMode = autoLoad.value && props.trigger !== 'start'
        const exposedAfter: InfiniteScrollActionSlotProps = {
          loading: loadingAfter.value,
          loadingBefore: loadingBefore.value,
          loadingAfter: loadingAfter.value,
          fetch: dataManager.loadAfter,
          autoMode: footerAutoMode,
          manualMode: !footerAutoMode,
          hasMore: dataManager.hasMoreAfter(),
        }

        renderElements.push(
          h(
            'div',
            { ref: afterElementRef },
            slots.after ? slots.after(exposedAfter) : loadingAfter.value ? slots.loading?.(exposedAfter) : null,
          ),
        )
      }

      return h(Fragment, {}, renderElements)
    }
  },
})

export default InfiniteScroll
