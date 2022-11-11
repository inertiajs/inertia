import { h } from 'vue'
import { Inertia, mergeDataIntoQueryString, shouldIntercept } from '@inertiajs/inertia'

export default {
  name: 'InertiaLink',
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
  emits: ['cancel-token', 'before', 'start', 'progress', 'finish', 'cancel', 'success', 'error'],
  setup(props, { slots, attrs, emit }) {
    return props => {
      const as = props.as.toLowerCase()
      const method = props.method.toLowerCase()
      const [href, data] = mergeDataIntoQueryString(method, props.href || '', props.data, props.queryStringArrayFormat)

      if (as === 'a' && method !== 'get') {
        console.warn(`Creating POST/PUT/PATCH/DELETE <a> links is discouraged as it causes "Open Link in New Tab/Window" accessibility issues.\n\nPlease specify a more appropriate element using the "as" attribute. For example:\n\n<Link href="${href}" method="${method}" as="button">...</Link>`)
      }

      return h(props.as, {
        ...attrs,
        ...as === 'a' ? { href } : {},
        onClick: (event) => {
          if (shouldIntercept(event)) {
            event.preventDefault()

            Inertia.visit(href, {
              data: data,
              method: method,
              replace: props.replace,
              preserveScroll: props.preserveScroll,
              preserveState: props.preserveState ?? (method !== 'get'),
              only: props.only,
              headers: props.headers,
              onCancelToken: (...args) => emit('cancel-token', ...args),
              onBefore: (...args) => emit('before', ...args),
              onStart: (...args) => emit('start', ...args),
              onProgress: (...args) => emit('progress', ...args),
              onFinish: (...args) => emit('finish', ...args),
              onCancel: (...args) => emit('cancel', ...args),
              onSuccess: (...args) => emit('success', ...args),
              onError: (...args) => emit('error', ...args),
            })
          }
        },
      }, slots)
    }
  },
}
