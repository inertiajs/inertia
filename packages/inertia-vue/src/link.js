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
      ...(data.on || {}),
    }

    let [url, propsData] = mergeDataIntoQueryString(
      props.method,
      hrefToUrl(props.href),
      props.data,
    )

    return h(props.as, {
      ...data,
      attrs: {
        ...data.attrs,
        ...props.as === 'a' ? { href: url.href } : {},
      },
      on: {
        ...data.on,
        click: event => {
          data.on.click(event)

          if (shouldIntercept(event)) {
            event.preventDefault()

            Inertia.visit(url.href, {
              data: propsData,
              method: props.method,
              replace: props.replace,
              preserveScroll: props.preserveScroll,
              preserveState: props.preserveState ?? (props.method.toLowerCase() !== 'get'),
              only: props.only,
              headers: props.headers,
              onCancelToken: data.on.cancelToken,
              onStart: data.on.start,
              onProgress: data.on.progress,
              onFinish: data.on.finish,
              onCancel: data.on.cancel,
              onSuccess: data.on.success,
            })
          }
        },
      },
    }, children)
  },
}
