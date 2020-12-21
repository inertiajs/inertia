import { hrefToUrl, Inertia, mergeDataIntoQueryString, shouldIntercept } from '@inertiajs/inertia'

export default {
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
      required: true,
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
    const [url, propsData] = mergeDataIntoQueryString(method, hrefToUrl(props.href), props.data)

    if (as === 'a' && method !== 'get') {
      console.warn(`Creating POST/PUT/PATCH/DELETE <a> links is discouraged as it causes "Open Link in New Tab/Window" accessibility issues.\n\nPlease specify a more appropriate element using the "as" attribute. For example:\n\n<inertia-link href="${url.href}" method="${method}" as="button">...</inertia-link>`)
    }

    return h(props.as, {
      ...data,
      attrs: {
        ...data.attrs,
        ...as === 'a' ? { href: url.href } : {},
      },
      on: {
        ...data.on,
        click: event => {
          data.on.click(event)

          if (shouldIntercept(event)) {
            event.preventDefault()

            Inertia.visit(url.href, {
              data: propsData,
              method: method,
              replace: props.replace,
              preserveScroll: props.preserveScroll,
              preserveState: props.preserveState ?? (method !== 'get'),
              only: props.only,
              headers: props.headers,
              onCancelToken: data.on.cancelToken,
              onBefore: data.on.before,
              onStart: data.on.start,
              onProgress: data.on.progress,
              onFinish: data.on.finish,
              onCancel: data.on.cancel,
              onSuccess: data.on.success,
              onError: data.on.error,
            })
          }
        },
      },
    }, children)
  },
}
