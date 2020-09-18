import { Inertia, shouldIntercept } from '@inertiajs/inertia'

export default {
  functional: true,
  props: {
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
    preload: {
      type: Boolean,
      default: true,
    },
    preserveScroll: {
      type: Boolean,
      default: false,
    },
    preserveState: {
      type: Boolean,
      default: false,
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
    return h('a', {
      ...data,
      attrs: {
        ...data.attrs,
        href: props.href,
      },
      on: {
        ...(data.on || {}),
        click: event => {
          if (data.on && data.on.click) {
            data.on.click(event)
          }

          if (shouldIntercept(event)) {
            event.preventDefault()

            Inertia.visit(props.href, {
              data: props.data,
              method: props.method,
              replace: props.replace,
              preserveScroll: props.preserveScroll,
              preserveState: props.preserveState,
              only: props.only,
              headers: props.headers,
            })
          }
        },
        mouseover: event => {
          if (data.on && data.on.mouseover) {
            data.on.mouseover(event)
          }

          if (!props.preload || data.preloadTimer) {
            return
          }

          data.preloadTimer = setTimeout(() => {
            Inertia.preload(props.href, {
              data: props.data,
              method: props.method,
              only: props.only,
              headers: props.headers,
            })

            data.preloadTimer = undefined
          }, 130)
        },
        mouseleave: event => {
          if (data.on && data.on.mouseleave) {
            data.on.mouseleave(event)
          }

          if (data.preloadTimer) {
            clearTimeout(data.preloadTimer)
            data.preloadTimer = undefined
          }
        },
      },
    }, children)
  },
}
