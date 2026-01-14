import {
  ActiveVisit,
  isUrlMethodPair,
  LinkComponentBaseProps,
  LinkPrefetchOption,
  mergeDataIntoQueryString,
  Method,
  PendingVisit,
  router,
  shouldIntercept,
  shouldNavigate,
} from '@inertiajs/core'
import { Component, computed, defineComponent, DefineComponent, h, onMounted, onUnmounted, PropType, ref } from 'vue'
import { config } from '.'

const noop = () => {}

export interface InertiaLinkProps extends LinkComponentBaseProps {
  as?: string | Component
  onClick?: (event: MouseEvent) => void
}

type InertiaLink = DefineComponent<InertiaLinkProps>

const Link: InertiaLink = defineComponent({
  name: 'Link',
  props: {
    as: {
      type: [String, Object] as PropType<InertiaLinkProps['as']>,
      default: 'a',
    },
    data: {
      type: Object as PropType<InertiaLinkProps['data']>,
      default: () => ({}),
    },
    href: {
      type: [String, Object] as PropType<InertiaLinkProps['href']>,
      default: '',
    },
    method: {
      type: String as PropType<InertiaLinkProps['method']>,
      default: 'get',
    },
    replace: {
      type: Boolean as PropType<InertiaLinkProps['replace']>,
      default: false,
    },
    preserveScroll: {
      type: [Boolean, String, Function] as PropType<InertiaLinkProps['preserveScroll']>,
      default: false,
    },
    preserveState: {
      type: [Boolean, String, Function] as PropType<InertiaLinkProps['preserveState']>,
      default: null,
    },
    preserveUrl: {
      type: Boolean as PropType<InertiaLinkProps['preserveUrl']>,
      default: false,
    },
    only: {
      type: Array as PropType<InertiaLinkProps['only']>,
      default: () => [],
    },
    except: {
      type: Array as PropType<InertiaLinkProps['except']>,
      default: () => [],
    },
    headers: {
      type: Object as PropType<InertiaLinkProps['headers']>,
      default: () => ({}),
    },
    queryStringArrayFormat: {
      type: String as PropType<InertiaLinkProps['queryStringArrayFormat']>,
      default: 'brackets',
    },
    async: {
      type: Boolean as PropType<InertiaLinkProps['async']>,
      default: false,
    },
    prefetch: {
      type: [Boolean, String, Array] as PropType<InertiaLinkProps['prefetch']>,
      default: false,
    },
    cacheFor: {
      type: [Number, String, Array] as PropType<InertiaLinkProps['cacheFor']>,
      default: 0,
    },
    onStart: {
      type: Function as PropType<InertiaLinkProps['onStart']>,
      default: noop,
    },
    onProgress: {
      type: Function as PropType<InertiaLinkProps['onProgress']>,
      default: noop,
    },
    onFinish: {
      type: Function as PropType<InertiaLinkProps['onFinish']>,
      default: noop,
    },
    onBefore: {
      type: Function as PropType<InertiaLinkProps['onBefore']>,
      default: noop,
    },
    onCancel: {
      type: Function as PropType<InertiaLinkProps['onCancel']>,
      default: noop,
    },
    onSuccess: {
      type: Function as PropType<InertiaLinkProps['onSuccess']>,
      default: noop,
    },
    onError: {
      type: Function as PropType<InertiaLinkProps['onError']>,
      default: noop,
    },
    onCancelToken: {
      type: Function as PropType<InertiaLinkProps['onCancelToken']>,
      default: noop,
    },
    onPrefetching: {
      type: Function as PropType<InertiaLinkProps['onPrefetching']>,
      default: noop,
    },
    onPrefetched: {
      type: Function as PropType<InertiaLinkProps['onPrefetched']>,
      default: noop,
    },
    cacheTags: {
      type: [String, Array] as PropType<InertiaLinkProps['cacheTags']>,
      default: () => [],
    },
    viewTransition: {
      type: [Boolean, Object] as PropType<InertiaLinkProps['viewTransition']>,
      default: false,
    },
  },
  setup(props, { slots, attrs }) {
    const inFlightCount = ref(0)
    const hoverTimeout = ref<ReturnType<typeof setTimeout>>()

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

      return [props.prefetch] as LinkPrefetchOption[]
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
      return config.get('prefetch.cacheFor')
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
      isUrlMethodPair(props.href) ? props.href.method : ((props.method ?? 'get').toLowerCase() as Method),
    )
    const as = computed(() => {
      if (typeof props.as !== 'string' || props.as.toLowerCase() !== 'a') {
        // Custom component or element
        return props.as
      }

      return method.value !== 'get' ? 'button' : props.as.toLowerCase()
    })
    const mergeDataArray = computed(() =>
      mergeDataIntoQueryString(
        method.value,
        isUrlMethodPair(props.href) ? props.href.url : (props.href as string),
        props.data || {},
        props.queryStringArrayFormat,
      ),
    )
    const href = computed(() => mergeDataArray.value[0])
    const data = computed(() => mergeDataArray.value[1])

    const elProps = computed(() => {
      if (as.value === 'button') {
        return { type: 'button' }
      }

      if (as.value === 'a' || typeof as.value !== 'string') {
        return { href: href.value }
      }

      return {}
    })

    const baseParams = computed(() => ({
      data: data.value,
      method: method.value,
      replace: props.replace,
      preserveScroll: props.preserveScroll,
      preserveState: props.preserveState ?? method.value !== 'get',
      preserveUrl: props.preserveUrl,
      only: props.only,
      except: props.except,
      headers: props.headers,
      async: props.async,
    }))

    const visitParams = computed(() => ({
      ...baseParams.value,
      viewTransition: props.viewTransition,
      onCancelToken: props.onCancelToken,
      onBefore: props.onBefore,
      onStart: (visit: PendingVisit) => {
        inFlightCount.value++
        props.onStart?.(visit)
      },
      onProgress: props.onProgress,
      onFinish: (visit: ActiveVisit) => {
        inFlightCount.value--
        props.onFinish?.(visit)
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
          cacheTags: props.cacheTags,
        },
      )
    }

    const regularEvents = {
      onClick: (event: MouseEvent) => {
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
        }, config.get('prefetch.hoverDelay'))
      },
      onMouseleave: () => {
        clearTimeout(hoverTimeout.value)
      },
      onClick: regularEvents.onClick,
    }

    const prefetchClickEvents = {
      onMousedown: (event: MouseEvent) => {
        if (shouldIntercept(event)) {
          event.preventDefault()
          prefetch()
        }
      },
      onKeydown: (event: KeyboardEvent) => {
        if (shouldNavigate(event)) {
          event.preventDefault()
          prefetch()
        }
      },
      onMouseup: (event: MouseEvent) => {
        if (shouldIntercept(event)) {
          event.preventDefault()
          router.visit(href.value, visitParams.value)
        }
      },
      onKeyup: (event: KeyboardEvent) => {
        if (shouldNavigate(event)) {
          event.preventDefault()
          router.visit(href.value, visitParams.value)
        }
      },
      onClick: (event: MouseEvent) => {
        if (shouldIntercept(event)) {
          // Let the mouseup/keyup event handle the visit
          event.preventDefault()
        }
      },
    }

    return () => {
      return h(
        as.value as string | Component,
        {
          ...attrs,
          ...elProps.value,
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
