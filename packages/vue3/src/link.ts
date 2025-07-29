import {
  ActiveVisit,
  CacheForOption,
  GlobalEventCallback,
  LinkComponentBaseProps,
  LinkPrefetchOption,
  mergeDataIntoQueryString,
  Method,
  PendingVisit,
  router,
  shouldIntercept,
} from '@inertiajs/core'
import { computed, defineComponent, DefineComponent, h, onMounted, onUnmounted, PropType, ref } from 'vue'

const noop = () => {}

export interface InertiaLinkProps extends LinkComponentBaseProps {
  as?: string
  onClick?: (event: MouseEvent) => void
}

type InertiaLink = DefineComponent<InertiaLinkProps>

const Link: InertiaLink = defineComponent({
  name: 'Link',
  props: {
    as: {
      type: String,
      default: 'a',
    },
    data: {
      type: Object,
      default: () => ({}),
    },
    href: {
      type: [String, Object] as PropType<InertiaLinkProps['href']>,
      required: true,
    },
    method: {
      type: String as PropType<Method>,
      default: 'get',
    },
    replace: {
      type: Boolean,
      default: false,
    },
    preserveScroll: {
      type: Boolean,
      default: false,
    },
    preserveState: {
      type: Boolean,
      default: null,
    },
    only: {
      type: Array<string>,
      default: () => [],
    },
    except: {
      type: Array<string>,
      default: () => [],
    },
    headers: {
      type: Object,
      default: () => ({}),
    },
    queryStringArrayFormat: {
      type: String as PropType<'brackets' | 'indices'>,
      default: 'brackets',
    },
    async: {
      type: Boolean,
      default: false,
    },
    prefetch: {
      type: [Boolean, String, Array] as PropType<boolean | LinkPrefetchOption | LinkPrefetchOption[]>,
      default: false,
    },
    cacheFor: {
      type: [Number, String, Array] as PropType<CacheForOption | CacheForOption[]>,
      default: 0,
    },
    onStart: {
      type: Function as PropType<GlobalEventCallback<'start'>>,
      default: noop,
    },
    onProgress: {
      type: Function as PropType<GlobalEventCallback<'progress'>>,
      default: noop,
    },
    onFinish: {
      type: Function as PropType<GlobalEventCallback<'finish'>>,
      default: noop,
    },
    onBefore: {
      type: Function as PropType<GlobalEventCallback<'before'>>,
      default: noop,
    },
    onCancel: {
      type: Function as PropType<GlobalEventCallback<'cancel'>>,
      default: noop,
    },
    onSuccess: {
      type: Function as PropType<GlobalEventCallback<'success'>>,
      default: noop,
    },
    onError: {
      type: Function as PropType<GlobalEventCallback<'error'>>,
      default: noop,
    },
    onCancelToken: {
      type: Function as PropType<(cancelToken: import('axios').CancelTokenSource) => void>,
      default: noop,
    },
    onPrefetching: {
      type: Function as PropType<GlobalEventCallback<'prefetching'>>,
      default: noop,
    },
    onPrefetched: {
      type: Function as PropType<GlobalEventCallback<'prefetched'>>,
      default: noop,
    },
  },
  setup(props, { slots, attrs }) {
    const inFlightCount = ref(0)
    const hoverTimeout = ref(null)

    const prefetchModes = computed<LinkPrefetchOption[]>(() => {
      if (props.prefetch === true) {
        return ['hover']
      }

      if (props.prefetch === false) {
        return []
      }

      if (Array.isArray(props.prefetch)) {
        return props.prefetch
      }

      return [props.prefetch]
    })

    const cacheForValue = computed(() => {
      if (props.cacheFor !== 0) {
        // If they've provided a value, respect it
        return props.cacheFor
      }

      if (prefetchModes.value.length === 1 && prefetchModes.value[0] === 'click') {
        // If they've only provided a prefetch mode of 'click',
        // we should only prefetch for the next request but not keep it around
        return 0
      }

      // Otherwise, default to 30 seconds
      return 30_000
    })

    onMounted(() => {
      if (prefetchModes.value.includes('mount')) {
        prefetch()
      }
    })

    onUnmounted(() => {
      clearTimeout(hoverTimeout.value)
    })

    const method = computed(() =>
      typeof props.href === 'object' ? props.href.method : (props.method.toLowerCase() as Method),
    )
    const as = computed(() => (method.value !== 'get' ? 'button' : props.as.toLowerCase()))
    const mergeDataArray = computed(() =>
      mergeDataIntoQueryString(
        method.value,
        typeof props.href === 'object' ? props.href.url : props.href || '',
        props.data,
        props.queryStringArrayFormat,
      ),
    )
    const href = computed(() => mergeDataArray.value[0])
    const data = computed(() => mergeDataArray.value[1])

    const elProps = computed(() => ({
      a: { href: href.value },
      button: { type: 'button' },
    }))

    const baseParams = computed(() => ({
      data: data.value,
      method: method.value,
      replace: props.replace,
      preserveScroll: props.preserveScroll,
      preserveState: props.preserveState ?? method.value !== 'get',
      only: props.only,
      except: props.except,
      headers: props.headers,
      async: props.async,
    }))

    const visitParams = computed(() => ({
      ...baseParams.value,
      onCancelToken: props.onCancelToken,
      onBefore: props.onBefore,
      onStart: (visit: PendingVisit) => {
        inFlightCount.value++
        props.onStart(visit)
      },
      onProgress: props.onProgress,
      onFinish: (visit: ActiveVisit) => {
        inFlightCount.value--
        props.onFinish(visit)
      },
      onCancel: props.onCancel,
      onSuccess: props.onSuccess,
      onError: props.onError,
    }))

    const prefetch = () => {
      router.prefetch(
        href.value,
        {
          ...baseParams.value,
          onPrefetching: props.onPrefetching,
          onPrefetched: props.onPrefetched,
        },
        {
          cacheFor: cacheForValue.value,
        },
      )
    }

    const regularEvents = {
      onClick: (event) => {
        if (shouldIntercept(event)) {
          event.preventDefault()
          router.visit(href.value, visitParams.value)
        }
      },
    }

    const prefetchHoverEvents = {
      onMouseenter: () => {
        hoverTimeout.value = setTimeout(() => {
          prefetch()
        }, 75)
      },
      onMouseleave: () => {
        clearTimeout(hoverTimeout.value)
      },
      onClick: regularEvents.onClick,
    }

    const prefetchClickEvents = {
      onMousedown: (event) => {
        if (shouldIntercept(event)) {
          event.preventDefault()
          prefetch()
        }
      },
      onMouseup: (event) => {
        event.preventDefault()
        router.visit(href.value, visitParams.value)
      },
      onClick: (event) => {
        if (shouldIntercept(event)) {
          // Let the mouseup event handle the visit
          event.preventDefault()
        }
      },
    }

    return () => {
      return h(
        as.value,
        {
          ...attrs,
          ...(elProps.value[as.value] || {}),
          'data-loading': inFlightCount.value > 0 ? '' : undefined,
          ...(() => {
            if (prefetchModes.value.includes('hover')) {
              return prefetchHoverEvents
            }

            if (prefetchModes.value.includes('click')) {
              return prefetchClickEvents
            }

            return regularEvents
          })(),
        },
        slots,
      )
    }
  },
})

export default Link
