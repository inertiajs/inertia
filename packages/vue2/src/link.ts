import { mergeDataIntoQueryString, router, shouldIntercept } from '@inertiajs/core'
import Vue from 'vue'

export default Vue.extend({
  functional: true,
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
      type: Array,
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
  render(h, { props, data, children }) {
    data.on = {
      click: () => ({}),
      cancelToken: () => ({}),
      start: () => ({}),
      progress: () => ({}),
      finish: () => ({}),
      cancel: () => ({}),
      success: () => ({}),
      error: () => ({}),
      ...(data.on || {}),
    }

    const as = props.as.toLowerCase()
    const method = props.method.toLowerCase()
    const [href, propsData] = mergeDataIntoQueryString(
      // @ts-ignore
      method,
      props.href || '',
      props.data,
      props.queryStringArrayFormat,
    )

    if (as === 'a' && method !== 'get') {
      console.warn(
        `Creating POST/PUT/PATCH/DELETE <a> links is discouraged as it causes "Open Link in New Tab/Window" accessibility issues.\n\nPlease specify a more appropriate element using the "as" attribute. For example:\n\n<Link href="${href}" method="${method}" as="button">...</Link>`,
      )
    }

    return h(
      props.as,
      {
        ...data,
        attrs: {
          ...data.attrs,
          ...(as === 'a' ? { href } : {}),
        },
        on: {
          ...data.on,
          click: (event) => {
            // @ts-ignore
            data.on.click(event)

            if (shouldIntercept(event)) {
              event.preventDefault()

              router.visit(href, {
                data: propsData,
                // @ts-ignore
                method: method,
                replace: props.replace,
                preserveScroll: props.preserveScroll,
                preserveState: props.preserveState ?? method !== 'get',
                only: props.only,
                headers: props.headers,
                // @ts-ignore
                onCancelToken: data.on.cancelToken,
                // @ts-ignore
                onBefore: data.on.before,
                // @ts-ignore
                onStart: data.on.start,
                // @ts-ignore
                onProgress: data.on.progress,
                // @ts-ignore
                onFinish: data.on.finish,
                // @ts-ignore
                onCancel: data.on.cancel,
                // @ts-ignore
                onSuccess: data.on.success,
                // @ts-ignore
                onError: data.on.error,
              })
            }
          },
        },
      },
      children,
    )
  },
})
