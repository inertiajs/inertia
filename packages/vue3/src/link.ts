import {
  mergeDataIntoQueryString,
  Method,
  PageProps,
  PendingVisit,
  Progress,
  router,
  shouldIntercept,
} from '@inertiajs/core'
import { defineComponent, DefineComponent, h, PropType, ref } from 'vue'

export interface InertiaLinkProps {
  as?: string
  data?: object
  href: string
  method?: Method
  headers?: object
  onClick?: (event: MouseEvent) => void
  preserveScroll?: boolean | ((props: PageProps) => boolean)
  preserveState?: boolean | ((props: PageProps) => boolean) | null
  replace?: boolean
  only?: string[]
  except?: string[]
  onCancelToken?: (cancelToken: import('axios').CancelTokenSource) => void
  onBefore?: () => void
  onStart?: () => void
  onProgress?: (progress: Progress) => void
  onFinish?: () => void
  onCancel?: () => void
  onSuccess?: () => void
  queryStringArrayFormat?: 'brackets' | 'indices'
  async?: boolean
  prefetch?: boolean
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
      type: String,
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
      type: Boolean,
      default: false,
    },
    onStart: {
      type: Function as PropType<(visit: PendingVisit) => void>,
      default: () => {},
    },
    onProgress: {
      type: Function as PropType<(progress: Progress) => void>,
      default: () => {},
    },
    onFinish: {
      type: Function as PropType<(visit: PendingVisit) => void>,
      default: () => {},
    },
    onBefore: {
      type: Function as PropType<() => void>,
      default: () => {},
    },
    onCancel: {
      type: Function as PropType<() => void>,
      default: () => {},
    },
    onSuccess: {
      type: Function as PropType<() => void>,
      default: () => {},
    },
    onError: {
      type: Function as PropType<() => void>,
      default: () => {},
    },
    onCancelToken: {
      type: Function as PropType<(cancelToken: import('axios').CancelTokenSource) => void>,
      default: () => {},
    },
  },
  setup(props, { slots, attrs }) {
    const inFlightCount = ref(0)
    const prefetched = ref(null)
    const prefetching = ref(false)
    const loadAfterPrefetch = ref(false)
    const timeUntilPrefetchStale = 2000
    const hoverTimeout = ref(null)

    return () => {
      const method = props.method.toLowerCase() as Method
      const as = method !== 'get' ? 'button' : props.as.toLowerCase()
      const [href, data] = mergeDataIntoQueryString(method, props.href || '', props.data, props.queryStringArrayFormat)

      const elProps = {
        a: { href },
        button: { type: 'button' },
      }

      return h(
        as,
        {
          ...attrs,
          ...(elProps[as] || {}),
          'data-loading': inFlightCount.value > 0 ? '' : undefined,
          onMouseover: () => {
            if (!props.prefetch) {
              return
            }

            if (prefetching.value) {
              console.log('In the process of prefetching')
              return
            }

            if (prefetched.value) {
              console.log('Already prefetched')
              return
            }

            // TODO: Cancel these timeouts on unmount
            hoverTimeout.value = setTimeout(() => {
              console.log('loading!')

              prefetching.value = true

              router
                .prefetch(href, {
                  data: data,
                  method: method,
                  replace: props.replace,
                  preserveScroll: props.preserveScroll,
                  preserveState: props.preserveState ?? method !== 'get',
                  only: props.only,
                  except: props.except,
                  headers: props.headers,
                  async: props.async,
                  onCancelToken: props.onCancelToken,
                  onBefore: props.onBefore,
                  onStart: props.onStart,
                  onProgress: props.onProgress,
                  onFinish: props.onFinish,
                  onCancel: props.onCancel,
                  onSuccess: props.onSuccess,
                  onError: props.onError,
                })
                .then((response) => {
                  console.log('got the prefetch!', response)
                  prefetched.value = response

                  if (loadAfterPrefetch.value) {
                    console.log('loading after prefetch!')
                    router.loadFromPrefetch(response)
                  }

                  loadAfterPrefetch.value = false
                  prefetching.value = false

                  setTimeout(() => {
                    prefetched.value = null
                  }, timeUntilPrefetchStale)
                })
            }, 75)
          },
          onMouseout: () => {
            clearTimeout(hoverTimeout.value)
          },
          onClick: (event) => {
            if (shouldIntercept(event)) {
              event.preventDefault()

              if (prefetching.value) {
                console.log('prefetching in progress')
                loadAfterPrefetch.value = true
                return
              }

              if (prefetched.value) {
                console.log('loading from prefetch!')
                router.loadFromPrefetch(prefetched.value)
                prefetched.value = null
                return
              }

              router.visit(href, {
                data: data,
                method: method,
                replace: props.replace,
                preserveScroll: props.preserveScroll,
                preserveState: props.preserveState ?? method !== 'get',
                only: props.only,
                except: props.except,
                headers: props.headers,
                async: props.async,
                onCancelToken: props.onCancelToken,
                onBefore: props.onBefore,
                onStart: (event) => {
                  inFlightCount.value++
                  props.onStart(event)
                },
                onProgress: props.onProgress,
                onFinish: (event) => {
                  inFlightCount.value--
                  props.onFinish(event)
                },
                onCancel: props.onCancel,
                onSuccess: props.onSuccess,
                onError: props.onError,
              })
            }
          },
        },
        slots,
      )
    }
  },
})

export default Link
