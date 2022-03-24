import { defineComponent, h, PropType } from '@vue/composition-api'
import { Inertia, Method, mergeDataIntoQueryString, shouldIntercept, GlobalEventCallback, FormDataConvertible } from '@inertiajs/inertia'

export default defineComponent({
  name: 'InertiaLink',
  props: {
    as: {
      type: String,
      default: 'a',
    },
    data: {
      type: Object as PropType<Record<string, FormDataConvertible>>,
      default: () => ({}),
    },
    href: {
      type: String,
    },
    method: {
      type: String,
      default: Method.GET,
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
      type: Array as PropType<string[]>,
      default: () => [],
    },
    headers: {
      type: Object as PropType<Record<string, string>>,
      default: () => ({}),
    },
    queryStringArrayFormat: {
      type: String as PropType<'indices' | 'brackets'>,
      default: 'brackets',
    },
  },
  setup(props, { slots, listeners }) {
    return () => {
      const as = props.as.toLowerCase()
      const method = props.method.toLowerCase() as Method
      const [href, data] = mergeDataIntoQueryString(method, props.href || '', props.data, props.queryStringArrayFormat)
  
      if (as === 'a' && method !== Method.GET) {
        console.warn(`Creating POST/PUT/PATCH/DELETE <a> links is discouraged as it causes "Open Link in New Tab/Window" accessibility issues.\n\nPlease specify a more appropriate element using the "as" attribute. For example:\n\n<Link href="${href}" method="${method}" as="button">...</Link>`)
      }

      return h(props.as, {
        attrs: {
          ...as === 'a' ? { href } : {},
        },
        on: {
          ...listeners,
          click: (event: KeyboardEvent) => {
            if (shouldIntercept(event)) {
              event.preventDefault()

              Inertia.visit(href, {
                data,
                method,
                replace: props.replace,
                preserveScroll: props.preserveScroll,
                preserveState: props.preserveState ?? (method !== Method.GET),
                only: props.only,
                headers: props.headers,
                onCancelToken: listeners.cancelToken as ({ cancel }: { cancel: VoidFunction }) => void || (() => {}),
                onBefore: listeners.before as GlobalEventCallback<'before'> || (() => {}),
                onStart: listeners.start as GlobalEventCallback<'start'> || (() => {}),
                onProgress: listeners.progress as GlobalEventCallback<'progress'> || (() => {}),
                onFinish: listeners.finish as GlobalEventCallback<'finish'> || (() => {}),
                onCancel: listeners.cancel as GlobalEventCallback<'cancel'> || (() => {}),
                onSuccess: listeners.success as GlobalEventCallback<'success'> || (() => {}),
                onError: listeners.error as GlobalEventCallback<'error'> || (() => {}),
              })
            }
          },
        },
      }, [slots.default?.()])
    }
  },
})
