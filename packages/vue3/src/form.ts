import {
  FormDataConvertible,
  FormDataKeys,
  formDataToObject,
  mergeDataIntoQueryString,
  Method,
  objectToFormData,
  PendingVisit,
  PreserveStateOption,
  Progress,
  VisitOptions,
} from '@inertiajs/core'
import { isEqual } from 'es-toolkit'
import { computed, defineComponent, DefineComponent, h, onBeforeUnmount, onMounted, PropType, ref } from 'vue'
import useForm from './useForm'

export interface InertiaFormProps {
  data?: Record<string, FormDataConvertible>
  action: string | { url: string; method: Method }
  method?: Method
  headers?: Record<string, string>
  preserveScroll?: PreserveStateOption
  preserveState?: PreserveStateOption
  preserveUrl?: boolean
  replace?: boolean
  only?: string[]
  except?: string[]
  reset?: string[]
  onCancelToken?: (cancelToken: import('axios').CancelTokenSource) => void
  onBefore?: () => void
  onStart?: (visit: PendingVisit) => void
  onProgress?: (progress: Progress) => void
  onFinish?: (visit: PendingVisit) => void
  onCancel?: () => void
  onSuccess?: () => void
  onError?: () => void
  queryStringArrayFormat?: 'brackets' | 'indices'
  errorBag?: string | null
  async?: boolean
  showProgress?: boolean
}

type InertiaForm = DefineComponent<InertiaFormProps>
type FormOptions = Omit<VisitOptions, 'data' | 'onPrefetched' | 'onPrefetching'>
type FormDataType = Record<string, FormDataConvertible>

// @ts-ignore
const Form: InertiaForm = defineComponent({
  name: 'Form',
  props: {
    data: {
      type: Object,
      default: () => ({}),
    },
    action: {
      type: [String, Object] as PropType<InertiaFormProps['action']>,
      required: true,
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
    preserveUrl: {
      type: Boolean,
      default: false,
    },
    only: {
      type: Array<string>,
      default: () => [],
    },
    except: {
      type: Array<string>,
      default: () => [],
    },
    reset: {
      type: Array<string>,
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
    onStart: {
      type: Function as PropType<(visit: PendingVisit) => void>,
      default: (_visit: PendingVisit) => {},
    },
    onProgress: {
      type: Function as PropType<(progress: Progress) => void>,
      default: () => {},
    },
    onFinish: {
      type: Function as PropType<(visit: PendingVisit) => void>,
      default: () => {},
    },
    onBefore: {
      type: Function as PropType<() => void>,
      default: () => {},
    },
    onCancel: {
      type: Function as PropType<() => void>,
      default: () => {},
    },
    onSuccess: {
      type: Function as PropType<() => void>,
      default: () => {},
    },
    onError: {
      type: Function as PropType<() => void>,
      default: () => {},
    },
    onCancelToken: {
      type: Function as PropType<(cancelToken: import('axios').CancelTokenSource) => void>,
      default: () => {},
    },
    async: {
      type: Boolean,
      default: false,
    },
    showProgress: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, { slots, attrs }) {
    const form = useForm(props.data)
    const formEl = ref()
    const method = computed(() =>
      typeof props.action === 'object' ? props.action.method : (props.method.toLowerCase() as Method),
    )

    // Can't use computed because FormData is not reactive
    const isDirty = ref(false)

    /// No const because we need to assign it in onMounted
    let defaults = {}

    const onFormUpdate = (event: Event) => {
      // If the form is reset, we set isDirty to false as we already know it's back
      // to defaults. Also, the fields are updated after the reset event, so the
      // comparison will be incorrect unless we use nextTick/setTimeout.
      isDirty.value = event.type === 'reset' ? false : !isEqual(getData(), defaults)
    }

    const formEvents: Array<keyof HTMLElementEventMap> = ['input', 'change', 'reset']

    onMounted(() => {
      defaults = getData()
      formEvents.forEach((e) => formEl.value.addEventListener(e, onFormUpdate))
    })

    onBeforeUnmount(() => {
      formEvents.forEach((e) => formEl.value.removeEventListener(e, onFormUpdate))
    })

    const getData = (): Record<string, FormDataConvertible> => {
      // Leverage the objectToFormData() method to merge the props.data with the form data.
      // Then convert it back to an object because submitting a FormData instance will
      // lead to incorrect data with nested/array values.
      return formDataToObject(objectToFormData(props.data || {}, new FormData(formEl.value)))
    }

    const submit = () => {
      const [action, data] = mergeDataIntoQueryString(
        method.value,
        typeof props.action === 'object' ? props.action.url : props.action || '',
        getData(),
        props.queryStringArrayFormat,
      )

      const params: FormOptions = {
        replace: props.replace,
        preserveScroll: props.preserveScroll,
        preserveState: props.preserveState ?? method.value !== 'get',
        preserveUrl: props.preserveUrl,
        only: props.only,
        except: props.except,
        reset: props.reset,
        headers: props.headers,
        onCancelToken: props.onCancelToken,
        onBefore: props.onBefore,
        onStart: props.onStart,
        onProgress: props.onProgress,
        onFinish: props.onFinish,
        onCancel: props.onCancel,
        onSuccess: props.onSuccess,
        onError: props.onError,
        async: props.async,
        showProgress: props.showProgress,
      }

      console.log(params)

      // We need transform because we can't override the default data with different keys (by design)
      form.transform(() => data).submit(method.value, action, params)
    }

    return () => {
      return h(
        'form',
        {
          ref: formEl,
          action: props.action,
          method: method.value,
          submit,
          ...attrs,
          onSubmit: (event) => {
            event.preventDefault()
            submit()
          },
        },
        slots.default
          ? slots.default({
              errors: form.errors,
              hasErrors: form.hasErrors,
              processing: form.processing,
              progress: form.progress,
              wasSuccessful: form.wasSuccessful,
              recentlySuccessful: form.recentlySuccessful,
              setError: (field: FormDataKeys<FormDataType>, value: string) => form.setError(field, value),
              clearErrors: (...fields: FormDataKeys<FormDataType>[]) => form.clearErrors(...fields),
              isDirty: isDirty.value,
              reset: () => formEl.value.reset(),
              submit,
            })
          : [],
      )
    }
  },
})

export default Form
