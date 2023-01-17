import {
  HttpMethod,
  mergeDataIntoQueryString,
  Method,
  PageProps,
  Progress,
  router,
  shouldIntercept,
} from '@inertiajs/core'
import { defineComponent, DefineComponent, h, PropType } from 'vue'

interface InertiaLinkProps {
  as?: string
  data?: object
  href: string
  method?: HttpMethod | Method
  headers?: object
  onClick?: (event: MouseEvent | KeyboardEvent) => void
  preserveScroll?: boolean | ((props: PageProps) => boolean)
  preserveState?: boolean | ((props: PageProps) => boolean) | null
  replace?: boolean
  only?: string[]
  onCancelToken?: (cancelToken: import('axios').CancelTokenSource) => void
  onBefore?: () => void
  onStart?: () => void
  onProgress?: (progress: Progress) => void
  onFinish?: () => void
  onCancel?: () => void
  onSuccess?: () => void
  queryStringArrayFormat?: 'brackets' | 'indices'
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
      type: String as PropType<HttpMethod | Method>,
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
    headers: {
      type: Object,
      default: () => ({}),
    },
    queryStringArrayFormat: {
      type: String as PropType<'brackets' | 'indices'>,
      default: 'brackets',
    },
  },
  setup(props, { slots, attrs }) {
    return () => {
      const as = props.as.toLowerCase()
      const method = props.method.toLowerCase() as HttpMethod
      const [href, data] = mergeDataIntoQueryString(method, props.href || '', props.data, props.queryStringArrayFormat)

      if (as === 'a' && method !== 'get') {
        console.warn(
          `Creating POST/PUT/PATCH/DELETE <a> links is discouraged as it causes "Open Link in New Tab/Window" accessibility issues.\n\nPlease specify a more appropriate element using the "as" attribute. For example:\n\n<Link href="${href}" method="${method}" as="button">...</Link>`,
        )
      }

      return h(
        props.as,
        {
          ...attrs,
          ...(as === 'a' ? { href } : {}),
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
                headers: props.headers,
                // @ts-expect-error
                onCancelToken: attrs.onCancelToken || (() => ({})),
                // @ts-expect-error
                onBefore: attrs.onBefore || (() => ({})),
                // @ts-expect-error
                onStart: attrs.onStart || (() => ({})),
                // @ts-expect-error
                onProgress: attrs.onProgress || (() => ({})),
                // @ts-expect-error
                onFinish: attrs.onFinish || (() => ({})),
                // @ts-expect-error
                onCancel: attrs.onCancel || (() => ({})),
                // @ts-expect-error
                onSuccess: attrs.onSuccess || (() => ({})),
                // @ts-expect-error
                onError: attrs.onError || (() => ({})),
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
