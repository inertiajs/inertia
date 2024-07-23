import {
  mergeDataIntoQueryString,
  Method,
  PageProps,
  PendingVisit,
  Progress,
  router,
  shouldIntercept,
} from '@inertiajs/core'
import { defineComponent, DefineComponent, h, onMounted, onUnmounted, PropType, ref, watch } from 'vue'

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
  prefetch?: boolean | 'mount'
  staleAfter?: number
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
      type: Boolean as PropType<boolean | 'mount'>,
      default: false,
    },
    staleAfter: {
      type: Number,
      default: 3000,
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
    const prefetching = ref(false)
    const hoverTimeout = ref(null)
    const progressBarStylesId = 'nprogress-injected-styles'

    const hideProgressBar = () => {
      if (!document.getElementById(progressBarStylesId)) {
        const style = document.createElement('style')
        style.id = progressBarStylesId
        style.innerHTML = '#nprogress { display: none; }'

        document.head.appendChild(style)
      }
    }

    const showProgressBar = () => {
      if (document.getElementById(progressBarStylesId)) {
        document.getElementById(progressBarStylesId).remove()
      }
    }

    onMounted(() => {
      if (props.prefetch === 'mount') {
        prefetch()
      }
    })

    onUnmounted(() => {
      clearTimeout(hoverTimeout.value)
      showProgressBar()
    })

    watch(prefetching, () => {
      if (prefetching.value) {
        hideProgressBar()
      } else {
        setTimeout(() => {
          // TODO: This is not great, but the progress bar shows for a sec after the request finishes
          showProgressBar()
        }, 200)
      }
    })

    const method = props.method.toLowerCase() as Method
    const as = method !== 'get' ? 'button' : props.as.toLowerCase()
    const [href, data] = mergeDataIntoQueryString(method, props.href || '', props.data, props.queryStringArrayFormat)

    const elProps = {
      a: { href },
      button: { type: 'button' },
    }

    const visitParams = {
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
      onStart: (event) => {
        if (!prefetching.value) {
          inFlightCount.value++
        }

        props.onStart(event)
      },
      onProgress: props.onProgress,
      onFinish: (event) => {
        if (!prefetching.value) {
          inFlightCount.value--
        }

        props.onFinish(event)
      },
      onCancel: props.onCancel,
      onSuccess: props.onSuccess,
      onError: props.onError,
    }

    const prefetch = () => {
      prefetching.value = true

      router.prefetch(href, visitParams, { staleAfter: props.staleAfter }).then(() => {
        prefetching.value = false
      })
    }

    return () => {
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

            hoverTimeout.value = setTimeout(() => {
              prefetch()
            }, 75)
          },
          onMouseout: () => {
            clearTimeout(hoverTimeout.value)
          },
          onClick: (event) => {
            prefetching.value = false

            if (shouldIntercept(event)) {
              event.preventDefault()

              router.visit(href, visitParams)
            }
          },
        },
        slots,
      )
    }
  },
})

export default Link
