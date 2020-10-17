import { h } from 'vue'
import { Inertia, shouldIntercept } from '@inertiajs/inertia'

export default {
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
  setup(props, { slots, attrs }) {
    return () => h('a', {
      ...attrs,
      href: props.href,
      onClick: (event) => {
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
            onCancelToken: attrs.onCancelToken || (() => ({})),
            onStart: attrs.onStart || (() => ({})),
            onProgress: attrs.onProgress || (() => ({})),
            onFinish: attrs.onFinish || (() => ({})),
            onCancel: attrs.onCancel || (() => ({})),
            onSuccess: attrs.onSuccess || (() => ({})),
          })
        }
      },
    }, slots.default())
  },
}
