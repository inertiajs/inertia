import {
  FormComponentProps,
  FormComponentRef,
  FormComponentSlotProps,
  FormDataConvertible,
  formDataToObject,
  mergeDataIntoQueryString,
  Method,
  resetFormFields,
  VisitOptions,
} from '@inertiajs/core'
import { isEqual } from 'lodash-es'
import { computed, defineComponent, DefineComponent, h, onBeforeUnmount, onMounted, PropType, ref } from 'vue'
import type { LiveValidationProps, ValidationEvent } from './types'
import useForm from './useForm'
import useValidate from './useValidate'

type InertiaFormComponentProps = FormComponentProps & LiveValidationProps
type InertiaForm = DefineComponent<InertiaFormComponentProps>

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
    // Precognition integration (optional, only used when enabled)
    precognitive: {
      type: [Boolean, Object] as PropType<boolean | Record<string, any>>, // ValidationConfig-like
      default: false,
    },
    validateOn: {
      type: [String, Array] as PropType<ValidationEvent | ValidationEvent[]>,
      default: 'input',
    },
    validationTimeout: {
      type: Number,
      default: undefined,
    },
    provider: {
      type: String as PropType<string>,
      default: undefined,
    },
  },
  setup(props, { slots, attrs, expose }) {
    const form = useForm<Record<string, any>>({})
    const formElement = ref()
    const method = computed(() =>
      typeof props.action === 'object' ? props.action.method : (props.method.toLowerCase() as Method),
    )

    // Can't use computed because FormData is not reactive
    const isDirty = ref(false)

    const defaultData = ref(new FormData())

    const getFormData = (): FormData => new FormData(formElement.value)

    // Convert the FormData to an object because we can't compare two FormData
    // instances directly (which is needed for isDirty), mergeDataIntoQueryString()
    // expects an object, and submitting a FormData instance directly causes problems with nested objects.
    const getData = (): Record<string, FormDataConvertible> => formDataToObject(getFormData())

    const onFormUpdate = (event: Event) => {
      // If the form is reset, we set isDirty to false as we already know it's back
      // to defaults. Also, the fields are updated after the reset event, so the
      // comparison will be incorrect unless we use nextTick/setTimeout.
      isDirty.value = event.type === 'reset' ? false : !isEqual(getData(), formDataToObject(defaultData.value))
    }

    const formEvents: Array<keyof HTMLElementEventMap> = ['input', 'change', 'reset']
    const validationEvents: ValidationEvent[] = ['input', 'change', 'blur']

    // ========= Optional live validation via composable =========
    const {
      validating,
      maybeValidate,
      validate: runValidate,
      reset: resetValidation,
    } = useValidate({
      getData: () => getData(),
      method: () => method.value,
      action: () => (typeof props.action === 'object' ? props.action.url : props.action),
      props: {
        precognitive: props.precognitive as any,
        validateOn: props.validateOn as any,
        validationTimeout: props.validationTimeout,
        provider: props.provider,
      },
      setErrors: (simple) => {
        form.clearErrors()
        form.setError(simple as Record<string, string>)
      },
    })

    onMounted(() => {
      defaultData.value = getFormData()
      formEvents.forEach((e) => formElement.value.addEventListener(e, onFormUpdate))
      // Attach validation listeners (includes blur if configured)
      ;(validationEvents as Array<keyof HTMLElementEventMap>).forEach((e) =>
        formElement.value.addEventListener(e, maybeValidate),
      )
    })

    onBeforeUnmount(() => {
      formEvents.forEach((e) => formElement.value?.removeEventListener(e, onFormUpdate))
      ;(validationEvents as Array<keyof HTMLElementEventMap>).forEach((e) =>
        formElement.value?.removeEventListener(e, maybeValidate),
      )
      try {
        resetValidation()
      } catch {}
    })

    const submit = () => {
      const [action, data] = mergeDataIntoQueryString(
        method.value,
        typeof props.action === 'object' ? props.action.url : props.action,
        getData(),
        props.queryStringArrayFormat,
      )

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

      // We need transform because we can't override the default data with different keys (by design)
      form.transform(() => props.transform(data)).submit(method.value, action, submitOptions)
    }

    const reset = (...fields: string[]) => {
      resetFormFields(formElement.value, defaultData.value, fields)
      try {
        resetValidation(...fields)
      } catch {}
    }

    const resetAndClearErrors = (...fields: string[]) => {
      form.clearErrors(...fields)
      reset(...fields)
    }

    const defaults = () => {
      defaultData.value = getFormData()
      isDirty.value = false
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
      clearErrors: (...fields: string[]) => form.clearErrors(...fields),
      resetAndClearErrors,
      setError: (fieldOrFields: string | Record<string, string>, maybeValue?: string) =>
        form.setError(typeof fieldOrFields === 'string' ? { [fieldOrFields]: maybeValue } : fieldOrFields),
      get isDirty() {
        return isDirty.value
      },
      get validating() {
        return validating.value
      },
      validate: (name?: string) => {
        runValidate(name)
      },
      reset,
      submit,
      defaults,
    }

    expose<FormComponentRef>(exposed)

    return () => {
      return h(
        'form',
        {
          ...attrs,
          ref: formElement,
          action: typeof props.action === 'object' ? props.action.url : props.action,
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
