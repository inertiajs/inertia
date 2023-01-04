import { mergeDataIntoQueryString, router, shouldIntercept } from '@inertiajs/core'
import { defineComponent, h } from 'vue'

export default defineComponent({
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
    },
    method: {
      type: String,
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
      type: String,
      default: 'brackets',
    },
  },
  setup(props, { slots, attrs }) {
    return () => {
      const as = props.as.toLowerCase()
      const method = props.method.toLowerCase()
      // @ts-ignore
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
                // @ts-ignore
                method: method,
                replace: props.replace,
                preserveScroll: props.preserveScroll,
                preserveState: props.preserveState ?? method !== 'get',
                only: props.only,
                headers: props.headers,
                // @ts-ignore
                onCancelToken: attrs.onCancelToken || (() => ({})),
                // @ts-ignore
                onBefore: attrs.onBefore || (() => ({})),
                // @ts-ignore
                onStart: attrs.onStart || (() => ({})),
                // @ts-ignore
                onProgress: attrs.onProgress || (() => ({})),
                // @ts-ignore
                onFinish: attrs.onFinish || (() => ({})),
                // @ts-ignore
                onCancel: attrs.onCancel || (() => ({})),
                // @ts-ignore
                onSuccess: attrs.onSuccess || (() => ({})),
                // @ts-ignore
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
