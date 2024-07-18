import {
  FormDataConvertible,
  mergeDataIntoQueryString,
  Method,
  PreserveStateOption,
  Progress,
  router,
  shouldIntercept,
} from '@inertiajs/core'
import { PropType } from 'vue'
import { ComponentOptions } from 'vue/types/umd'

export interface InertiaLinkProps {
  as?: string
  data?: Record<string, FormDataConvertible>
  href: string
  method?: Method
  headers?: Record<string, string>
  onClick?: (event: MouseEvent) => void
  preserveScroll?: PreserveStateOption
  preserveState?: PreserveStateOption
  replace?: boolean
  only?: string[]
  except?: string[]
  onCancelToken?: (cancelToken: import('axios').CancelTokenSource) => void
  onBefore?: () => void
  onStart?: () => void
  onProgress?: (progress: Progress) => void
  onFinish?: () => void
  onCancel?: () => void
  onSuccess?: () => void
  queryStringArrayFormat?: 'brackets' | 'indices'
  async: boolean
}

type InertiaLink = ComponentOptions<any, any, any, any, any, InertiaLinkProps>

const Link: InertiaLink = {
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
      type: String as PropType<Method>,
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
    except: {
      type: Array,
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
    async: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      inFlightCount: 0,
    }
  },
  render(h) {
    const on = {
      click: () => ({}),
      cancelToken: () => ({}),
      start: () => ({}),
      progress: () => ({}),
      finish: () => ({}),
      cancel: () => ({}),
      success: () => ({}),
      error: () => ({}),
      ...(this.$listeners || {}),
    }

    const method = this.method.toLowerCase() as Method
    const as = method !== 'get' ? 'button' : this.as.toLowerCase()
    const [href, propsData] = mergeDataIntoQueryString(method, this.href || '', this.data, this.queryStringArrayFormat)

    const elProps = {
      a: { href },
      button: { type: 'button' },
    }

    return h(
      as,
      {
        ...this.data,
        attrs: {
          ...this.data.attrs,
          ...(elProps[as] || {}),
          'data-loading': this.inFlightCount > 0 ? '' : undefined,
        },
        on: {
          ...on,
          click: (event) => {
            on.click(event)

            if (shouldIntercept(event)) {
              event.preventDefault()

              router.visit(href, {
                data: propsData,
                method: method,
                replace: this.replace,
                preserveScroll: this.preserveScroll,
                preserveState: this.preserveState ?? method !== 'get',
                only: this.only,
                except: this.except,
                headers: this.headers,
                async: this.async,
                onCancelToken: on.cancelToken,
                onBefore: on.before,
                onStart: (event) => {
                  this.inFlightCount++
                  on.start(event)
                },
                onProgress: on.progress,
                onFinish: (event) => {
                  this.inFlightCount--
                  on.finish(event)
                },
                onCancel: on.cancel,
                onSuccess: on.success,
                onError: on.error,
              })
            }
          },
        },
      },
      this.$slots.default,
    )
  },
}
export default Link
