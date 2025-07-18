import {
  FormDataConvertible,
  formDataToObject,
  mergeDataIntoQueryString,
  Method,
  PendingVisit,
  PreserveStateOption,
  Progress,
  VisitOptions,
} from '@inertiajs/core'
import { isEqual } from 'es-toolkit'
import { computed, defineComponent, DefineComponent, h, onBeforeUnmount, onMounted, PropType, ref } from 'vue'
import useForm from './useForm'

interface InertiaFormSlotProps {
  errors: Record<string, string>
  hasErrors: boolean
  processing: boolean
  progress: Progress | null
  wasSuccessful: boolean
  recentlySuccessful: boolean
  clearErrors: (...fields: string[]) => void
  resetAndClearErrors: (...fields: string[]) => void
  setError(field: string, value: string): void
  setError(errors: Record<string, string>): void
  isDirty: boolean
  reset: () => void
  submit: () => void
}

interface InertiaFormVisitOptions {
  preserveScroll?: PreserveStateOption
  preserveState?: PreserveStateOption
  preserveUrl?: boolean
  replace?: boolean
  only?: string[]
  except?: string[]
  reset?: string[]
}

interface InertiaFormProps {
  action: string | { url: string; method: Method }
  method?: Method
  headers?: Record<string, string>
  queryStringArrayFormat?: 'brackets' | 'indices'
  errorBag?: string | null
  showProgress?: boolean
  transform?: (data: Record<string, FormDataConvertible>) => Record<string, FormDataConvertible>
  visitOptions?: InertiaFormVisitOptions
  onCancelToken?: (cancelToken: import('axios').CancelTokenSource) => void
  onBefore?: () => void
  onStart?: (visit: PendingVisit) => void
  onProgress?: (progress: Progress) => void
  onFinish?: (visit: PendingVisit) => void
  onCancel?: () => void
  onSuccess?: () => void
  onError?: () => void
}

type InertiaForm = DefineComponent<InertiaFormProps>
type FormOptions = Omit<VisitOptions, 'data' | 'onPrefetched' | 'onPrefetching'>

const Form: InertiaForm = defineComponent({
  name: 'Form',
  props: {
    action: {
      type: [String, Object] as PropType<InertiaFormProps['action']>,
      required: true,
    },
    method: {
      type: String as PropType<Method>,
      default: 'get',
    },
    headers: {
      type: Object,
      default: () => ({}),
    },
    queryStringArrayFormat: {
      type: String as PropType<'brackets' | 'indices'>,
      default: 'brackets',
    },
    errorBag: {
      type: [String, null] as PropType<InertiaFormProps['errorBag']>,
      default: null,
    },
    showProgress: {
      type: Boolean,
      default: true,
    },
    transform: {
      type: Function as PropType<(data: Record<string, FormDataConvertible>) => Record<string, FormDataConvertible>>,
      default: (data: Record<string, FormDataConvertible>) => data,
    },
    visitOptions: {
      type: Object as PropType<InertiaFormVisitOptions>,
      default: () => ({}),
    },
    onCancelToken: {
      type: Function as PropType<(cancelToken: import('axios').CancelTokenSource) => void>,
      default: () => {},
    },
    onBefore: {
      type: Function as PropType<() => void>,
      default: () => {},
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
  },
  setup(props, { slots, attrs }) {
    const form = useForm({} as Record<string, FormDataConvertible>)
    const formElement = ref()
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
      formEvents.forEach((e) => formElement.value.addEventListener(e, onFormUpdate))
    })

    onBeforeUnmount(() => formEvents.forEach((e) => formElement.value?.removeEventListener(e, onFormUpdate)))

    const getData = (): Record<string, FormDataConvertible> => {
      // Convert the FormData to an object because we can't compare two FormData
      // instances directly (which is needed for isDirty), mergeDataIntoQueryString()
      // expects an object, and submitting a FormData instance directly causes problems with nested objects.
      return formDataToObject(new FormData(formElement.value))
    }

    const submit = () => {
      const [action, data] = mergeDataIntoQueryString(
        method.value,
        typeof props.action === 'object' ? props.action.url : props.action || '',
        getData(),
        props.queryStringArrayFormat,
      )

      const options: FormOptions = {
        headers: props.headers,
        errorBag: props.errorBag,
        showProgress: props.showProgress,
        onCancelToken: props.onCancelToken,
        onBefore: props.onBefore,
        onStart: props.onStart,
        onProgress: props.onProgress,
        onFinish: props.onFinish,
        onCancel: props.onCancel,
        onSuccess: props.onSuccess,
        onError: props.onError,
        ...props.visitOptions,
      }

      // We need transform because we can't override the default data with different keys (by design)
      form.transform(() => props.transform(data)).submit(method.value, action, options)
    }

    return () => {
      return h(
        'form',
        {
          ...attrs,
          ref: formElement,
          action: props.action,
          method: method.value,
          onSubmit: (event) => {
            event.preventDefault()
            submit()
          },
        },
        slots.default
          ? slots.default(<InertiaFormSlotProps>{
              errors: form.errors,
              hasErrors: form.hasErrors,
              processing: form.processing,
              progress: form.progress,
              wasSuccessful: form.wasSuccessful,
              recentlySuccessful: form.recentlySuccessful,
              setError: (fieldOrFields: string | Record<string, string>, maybeValue?: string) =>
                form.setError(typeof fieldOrFields === 'string' ? { [fieldOrFields]: maybeValue } : fieldOrFields),
              clearErrors: (...fields: string[]) => form.clearErrors(...fields),
              resetAndClearErrors: (...fields: string[]) => form.resetAndClearErrors(...fields),
              isDirty: isDirty.value,
              reset: () => formElement.value.reset(),
              submit,
            })
          : [],
      )
    }
  },
})

export default Form
