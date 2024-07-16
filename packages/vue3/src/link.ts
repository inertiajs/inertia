import { mergeDataIntoQueryString, Method, PageProps, Progress, router, shouldIntercept } from '@inertiajs/core'
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
    onStart: {
      type: Function as PropType<() => void>,
      default: () => {},
    },
    onProgress: {
      type: Function as PropType<(progress: Progress) => void>,
      default: () => {},
    },
    onFinish: {
      type: Function as PropType<() => void>,
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
          onClick: (event) => {
            if (shouldIntercept(event)) {
              event.preventDefault()

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
                onStart: () => {
                  inFlightCount.value++
                  props.onStart()
                },
                onProgress: props.onProgress,
                onFinish: () => {
                  inFlightCount.value--
                  props.onFinish()
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
