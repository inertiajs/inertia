import {
  FormComponentProps,
  FormComponentRef,
  FormComponentSlotProps,
  FormDataConvertible,
  formDataToObject,
  isUrlMethodPair,
  mergeDataIntoQueryString,
  Method,
  resetFormFields,
  usePrecognition,
  VisitOptions,
} from '@inertiajs/core'
import { isEqual } from 'lodash-es'
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
    resetOnError: {
      type: [Boolean, Array] as PropType<FormComponentProps['resetOnError']>,
      default: false,
    },
    resetOnSuccess: {
      type: [Boolean, Array] as PropType<FormComponentProps['resetOnSuccess']>,
      default: false,
    },
    setDefaultsOnSuccess: {
      type: Boolean as PropType<FormComponentProps['setDefaultsOnSuccess']>,
      default: false,
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
    onSubmitComplete: {
      type: Function as PropType<FormComponentProps['onSubmitComplete']>,
      default: noop,
    },
    disableWhileProcessing: {
      type: Boolean,
      default: false,
    },
    invalidateCacheTags: {
      type: [String, Array] as PropType<FormComponentProps['invalidateCacheTags']>,
      default: () => [],
    },
  },
  setup(props, { slots, attrs, expose }) {
    const form = useForm<Record<string, any>>({})
    const formElement = ref()
    const method = computed(() =>
      isUrlMethodPair(props.action) ? props.action.method : (props.method.toLowerCase() as Method),
    )

    // Can't use computed because FormData is not reactive
    const isDirty = ref(false)

    const defaultData = ref(new FormData())

    const onFormUpdate = (event: Event) => {
      // If the form is reset, we set isDirty to false as we already know it's back
      // to defaults. Also, the fields are updated after the reset event, so the
      // comparison will be incorrect unless we use nextTick/setTimeout.
      isDirty.value = event.type === 'reset' ? false : !isEqual(getData(), formDataToObject(defaultData.value))
    }

    const formEvents: Array<keyof HTMLElementEventMap> = ['input', 'change', 'reset']

    onMounted(() => {
      defaultData.value = getFormData()
      formEvents.forEach((e) => formElement.value.addEventListener(e, onFormUpdate))
    })

    onBeforeUnmount(() => formEvents.forEach((e) => formElement.value?.removeEventListener(e, onFormUpdate)))

    const getFormData = (): FormData => new FormData(formElement.value)

    // Convert the FormData to an object because we can't compare two FormData
    // instances directly (which is needed for isDirty), mergeDataIntoQueryString()
    // expects an object, and submitting a FormData instance directly causes problems with nested objects.
    const getData = (): Record<string, FormDataConvertible> => formDataToObject(getFormData())

    const getActionAndData = (): [string, Record<string, FormDataConvertible>] => {
      return mergeDataIntoQueryString(
        method.value,
        isUrlMethodPair(props.action) ? props.action.url : props.action,
        getData(),
        props.queryStringArrayFormat,
      )
    }

    const submit = () => {
      const maybeReset = (resetOption: boolean | string[]) => {
        if (!resetOption) {
          return
        }

        if (resetOption === true) {
          reset()
        } else if (resetOption.length > 0) {
          reset(...resetOption)
        }
      }

      const submitOptions: FormSubmitOptions = {
        headers: props.headers,
        errorBag: props.errorBag,
        showProgress: props.showProgress,
        invalidateCacheTags: props.invalidateCacheTags,
        onCancelToken: props.onCancelToken,
        onBefore: props.onBefore,
        onStart: props.onStart,
        onProgress: props.onProgress,
        onFinish: props.onFinish,
        onCancel: props.onCancel,
        onSuccess: (...args) => {
          props.onSuccess(...args)
          props.onSubmitComplete(exposed)
          maybeReset(props.resetOnSuccess)

          if (props.setDefaultsOnSuccess === true) {
            defaults()
          }
        },
        onError: (...args) => {
          props.onError(...args)
          maybeReset(props.resetOnError)
        },
        ...props.options,
      }

      const [action, data] = getActionAndData()

      // We need transform because we can't override the default data with different keys (by design)
      form.transform(() => props.transform(data)).submit(method.value, action, submitOptions)
    }

    const reset = (...fields: string[]) => {
      resetFormFields(formElement.value, defaultData.value, fields)
      validator.setOldData(getData()) // TODO: should it really do this?
    }

    const resetAndClearErrors = (...fields: string[]) => {
      form.clearErrors(...fields)
      reset(...fields)
    }

    const defaults = () => {
      defaultData.value = getFormData()
      isDirty.value = false
    }

    const validating = ref(false)

    const validator = usePrecognition({
      onStart: () => {
        validating.value = true
      },
      onFinish: () => {
        validating.value = false
      },
      onPrecognitionSuccess: () => form.clearErrors(),
      onValidationError: (errors) => form.setError(errors),
    })

    onMounted(() => {
      const [_action, data] = getActionAndData()

      // Set the initial data on the validator
      validator.setOldData(data)
    })

    const validate = (field?: string | string[]) => {
      const [action, data] = getActionAndData()

      validator.validate({
        action,
        method: method.value,
        data,
        only: Array.isArray(field) ? field : [field],
      })
    }

    const exposed = {
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
      get validating() {
        return validating.value
      },
      clearErrors: (...fields: string[]) => form.clearErrors(...fields),
      resetAndClearErrors,
      setError: (fieldOrFields: string | Record<string, string>, maybeValue?: string) =>
        form.setError(typeof fieldOrFields === 'string' ? { [fieldOrFields]: maybeValue } : fieldOrFields),
      get isDirty() {
        return isDirty.value
      },
      reset,
      submit,
      defaults,

      // Precognition
      valid: (field: string) => form.errors[field] === undefined,
      invalid: (field: string) => form.errors[field] !== undefined,
      validate,
    }

    expose<FormComponentRef>(exposed)

    return () => {
      return h(
        'form',
        {
          ...attrs,
          ref: formElement,
          action: isUrlMethodPair(props.action) ? props.action.url : props.action,
          method: method.value,
          onSubmit: (event) => {
            event.preventDefault()
            submit()
          },
          inert: props.disableWhileProcessing && form.processing,
        },
        slots.default ? slots.default(<FormComponentSlotProps>exposed) : [],
      )
    }
  },
})

export default Form
