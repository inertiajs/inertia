import { defineComponent, PropType } from 'vue-demi'
import { Inertia, Method, mergeDataIntoQueryString, shouldIntercept, GlobalEventCallback, FormDataConvertible } from '@inertiajs/inertia'

export default defineComponent({
  name: 'InertiaLink',
  /** @ts-ignore */
  functional: true,
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
  render(h, { props, data, children }) {
    const as = props.as.toLowerCase()
    const method = props.method.toLowerCase() as Method
    const [href, propsData] = mergeDataIntoQueryString(method, props.href || '', props.data, props.queryStringArrayFormat)

    if (as === 'a' && method !== Method.GET) {
      console.warn(`Creating POST/PUT/PATCH/DELETE <a> links is discouraged as it causes "Open Link in New Tab/Window" accessibility issues.\n\nPlease specify a more appropriate element using the "as" attribute. For example:\n\n<Link href="${href}" method="${method}" as="button">...</Link>`)
    }

    return h(props.as, {
      ...data,
      attrs: {
        ...data.attrs,
        ...as === 'a' ? { href } : {},
      },
      on: {
        ...data.on,
        click: (event: KeyboardEvent) => {
          if (shouldIntercept(event)) {
            event.preventDefault()

            Inertia.visit(href, {
              data: propsData,
              method: method,
              replace: props.replace,
              preserveScroll: props.preserveScroll,
              preserveState: props.preserveState ?? (method !== Method.GET),
              only: props.only,
              headers: props.headers,
              onCancelToken: data.on?.cancelToken as ({ cancel }: { cancel: VoidFunction }) => void || (() => {}),
              onBefore: data.on?.before as GlobalEventCallback<'before'> || (() => {}),
              onStart: data.on?.start as GlobalEventCallback<'start'> || (() => {}),
              onProgress: data.on?.progress as GlobalEventCallback<'progress'> || (() => {}),
              onFinish: data.on?.finish as GlobalEventCallback<'finish'> || (() => {}),
              onCancel: data.on?.cancel as GlobalEventCallback<'cancel'> || (() => {}),
              onSuccess: data.on?.success as GlobalEventCallback<'success'> || (() => {}),
              onError: data.on?.error as GlobalEventCallback<'error'> || (() => {}),
            })
          }
        },
      },
    }, children)
  },
})
