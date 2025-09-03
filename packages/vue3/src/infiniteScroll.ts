import { getScrollableParent, useInfiniteScroll } from '@inertiajs/core'
import { computed, defineComponent, Fragment, h, onMounted, onUnmounted, PropType, ref, watch } from 'vue'

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
      type: String as PropType<'top' | 'bottom' | 'both'>,
      default: 'both',
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
    preserveUrl: {
      type: Boolean,
      default: false,
    },
    pageName: {
      type: String,
      default: null,
    },
    bottom: {
      type: Boolean,
      default: false,
    },
    reverse: {
      type: Boolean,
      default: false,
    },
  },
  inheritAttrs: false,
  setup(props, { slots, attrs, expose }) {
    const pageName = computed(() => dataManager.getPageName() || props.pageName || 'page')

    const topElement = ref<HTMLElement | null>(null)
    const slotElement = ref<HTMLElement | null>(null)
    const bottomElement = ref<HTMLElement | null>(null)
    const scrollableParent = computed(() => getScrollableParent(slotElement.value))

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
      getPageName: () => pageName.value,
      shouldPreserveUrl: () => props.preserveUrl,

      // Elements
      getTrigger: () => props.trigger,
      getTriggerMargin: () => props.buffer,
      getTopElement: () => topElement.value!,
      getBottomElement: () => bottomElement.value!,
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

    const scrollToBottom = (behavior: ScrollBehavior = 'instant' as ScrollBehavior) => {
      if (scrollableParent.value) {
        scrollableParent.value.scrollTo({
          top: scrollableParent.value.scrollHeight,
          behavior,
        })
      } else {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior,
        })
      }
    }

    onMounted(() => {
      elementManager.setupObservers()
      elementManager.processServerLoadedElements(dataManager.getLastLoadedPage())

      if (props.bottom) {
        scrollToBottom()
      }

      if (autoLoad.value) {
        elementManager.enableTriggers()
      }
    })

    onUnmounted(elementManager.flushAll())

    watch(autoLoad, (enabled) => {
      enabled ? elementManager.enableTriggers() : elementManager.disableTriggers()
    })

    expose({
      loadAfter: dataManager.loadAfter,
      loadBefore: dataManager.loadBefore,
      hasMoreBefore: dataManager.hasMoreBefore,
      hasMoreAfter: dataManager.hasMoreAfter,
    })

    return () => {
      const headerAutoMode = autoLoad.value && props.trigger !== 'bottom'
      const footerAutoMode = autoLoad.value && props.trigger !== 'top'

      const exposedBefore = {
        loading: loadingBefore.value,
        loadingBefore: loadingBefore.value,
        loadingAfter: loadingAfter.value,
        fetch: dataManager.loadBefore,
        autoMode: headerAutoMode,
        manualMode: !headerAutoMode,
        hasMore: dataManager.hasMoreBefore(),
      }

      const exposedAfter = {
        loading: loadingAfter.value,
        loadingBefore: loadingBefore.value,
        loadingAfter: loadingAfter.value,
        fetch: dataManager.loadAfter,
        autoMode: footerAutoMode,
        manualMode: !footerAutoMode,
        hasMore: dataManager.hasMoreAfter(),
      }

      return h(Fragment, {}, [
        props.trigger !== 'bottom'
          ? h(
              'div',
              { ref: topElement },
              slots.before ? slots.before(exposedBefore) : loadingBefore.value ? slots.loading?.(exposedBefore) : null,
            )
          : null,
        h(
          props.as,
          { ...attrs, ref: slotElement },
          slots.default?.({
            loading: loadingBefore.value || loadingAfter.value,
          }),
        ),
        props.trigger !== 'top'
          ? h(
              'div',
              { ref: bottomElement },
              slots.after ? slots.after(exposedAfter) : loadingAfter.value ? slots.loading?.(exposedAfter) : null,
            )
          : null,
      ])
    }
  },
})

export default InfiniteScroll
