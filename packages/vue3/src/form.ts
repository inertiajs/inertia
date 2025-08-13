import {
  FormComponentProps,
  FormComponentSlotProps,
  FormDataConvertible,
  formDataToObject,
  mergeDataIntoQueryString,
  VisitOptions,
} from '@inertiajs/core'
import { isEqual } from 'es-toolkit'
import { computed, defineComponent, DefineComponent, h, onBeforeUnmount, onMounted, PropType, ref } from 'vue'
import useForm from './useForm'

type InertiaForm = DefineComponent<FormComponentProps>
type FormSubmitOptions = Omit<VisitOptions, 'data' | 'onPrefetched' | 'onPrefetching'>

const noop = () => undefined

const Form: InertiaForm = defineComponent({
  name: 'Form',
  props: {
    action: {
      type: [String, Object] as PropType<FormComponentProps['action']>,
      default: '',
    },
    method: {
      type: String as PropType<FormComponentProps['method']>,
      default: 'get',
    },
    headers: {
      type: Object as PropType<FormComponentProps['headers']>,
      default: () => ({}),
    },
    queryStringArrayFormat: {
      type: String as PropType<FormComponentProps['queryStringArrayFormat']>,
      default: 'brackets',
    },
    errorBag: {
      type: [String, null] as PropType<FormComponentProps['errorBag']>,
      default: null,
    },
    showProgress: {
      type: Boolean,
      default: true,
    },
    transform: {
      type: Function as PropType<FormComponentProps['transform']>,
      default: (data: Record<string, FormDataConvertible>) => data,
    },
    options: {
      type: Object as PropType<FormComponentProps['options']>,
      default: () => ({}),
    },
    onCancelToken: {
      type: Function as PropType<FormComponentProps['onCancelToken']>,
      default: noop,
    },
    onBefore: {
      type: Function as PropType<FormComponentProps['onBefore']>,
      default: noop,
    },
    onStart: {
      type: Function as PropType<FormComponentProps['onStart']>,
      default: noop,
    },
    onProgress: {
      type: Function as PropType<FormComponentProps['onProgress']>,
      default: noop,
    },
    onFinish: {
      type: Function as PropType<FormComponentProps['onFinish']>,
      default: noop,
    },
    onCancel: {
      type: Function as PropType<FormComponentProps['onCancel']>,
      default: noop,
    },
    onSuccess: {
      type: Function as PropType<FormComponentProps['onSuccess']>,
      default: noop,
    },
    onError: {
      type: Function as PropType<FormComponentProps['onError']>,
      default: noop,
    },
  },
  setup(props, { slots, attrs, expose }) {
    const form = useForm({} as Record<string, FormDataConvertible>)
    const formElement = ref()
    const method = computed(() =>
      typeof props.action === 'object'
        ? props.action.method
        : (props.method.toLowerCase() as FormComponentProps['method']),
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
        typeof props.action === 'object' ? props.action.url : props.action,
        getData(),
        props.queryStringArrayFormat,
      )

      const submitOptions: FormSubmitOptions = {
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
        ...props.options,
      }

      // We need transform because we can't override the default data with different keys (by design)
      form.transform(() => props.transform(data)).submit(method.value, action, submitOptions)
    }

    expose({
      get errors() {
        return form.errors
      },
      get hasErrors() {
        return form.hasErrors
      },
      get processing() {
        return form.processing
      },
      get progress() {
        return form.progress
      },
      get wasSuccessful() {
        return form.wasSuccessful
      },
      get recentlySuccessful() {
        return form.recentlySuccessful
      },
      clearErrors: (...fields: string[]) => form.clearErrors(...fields),
      resetAndClearErrors: (...fields: string[]) => form.resetAndClearErrors(...fields),
      setError: (fieldOrFields: string | Record<string, string>, maybeValue?: string) =>
        form.setError(typeof fieldOrFields === 'string' ? { [fieldOrFields]: maybeValue } : fieldOrFields),
      get isDirty() {
        return isDirty.value
      },
      reset: () => formElement.value.reset(),
      submit,
    })

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
          ? slots.default(<FormComponentSlotProps>{
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
