import {
  Errors,
  FormComponentProps,
  FormComponentRef,
  FormComponentSlotProps,
  FormDataConvertible,
  formDataToObject,
  isUrlMethodPair,
  mergeDataIntoQueryString,
  Method,
  resetFormFields,
  UseFormUtils,
  VisitOptions,
} from '@inertiajs/core'
import { NamedInputEvent, ValidationConfig } from 'laravel-precognition'
import { isEqual } from 'lodash-es'
import {
  computed,
  defineComponent,
  h,
  inject,
  InjectionKey,
  onBeforeUnmount,
  onMounted,
  PropType,
  provide,
  ref,
  SlotsType,
  watch,
} from 'vue'
import useForm from './useForm'

type FormSubmitOptions = Omit<VisitOptions, 'data' | 'onPrefetched' | 'onPrefetching'>

const noop = () => undefined

export const FormContextKey: InjectionKey<FormComponentRef> = Symbol('InertiaFormContext')

const Form = defineComponent({
  name: 'Form',
  slots: Object as SlotsType<{
    default: FormComponentSlotProps
  }>,
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
    validateFiles: {
      type: Boolean as PropType<FormComponentProps['validateFiles']>,
      default: false,
    },
    validationTimeout: {
      type: Number as PropType<FormComponentProps['validationTimeout']>,
      default: 1500,
    },
    withAllErrors: {
      type: Boolean as PropType<FormComponentProps['withAllErrors']>,
      default: false,
    },
  },
  setup(props, { slots, attrs, expose }) {
    const getTransformedData = (): Record<string, FormDataConvertible> => {
      const [_url, data] = getUrlAndData()

      return props.transform(data)
    }

    const form = useForm<Record<string, any>>({})
      .withPrecognition(
        () => method.value,
        () => getUrlAndData()[0],
      )
      .transform(getTransformedData)
      .setValidationTimeout(props.validationTimeout)

    if (props.validateFiles) {
      form.validateFiles()
    }

    if (props.withAllErrors) {
      form.withAllErrors()
    }

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

      form.defaults(getData())

      formEvents.forEach((e) => formElement.value.addEventListener(e, onFormUpdate))
    })

    watch(
      () => props.validateFiles,
      (value) => (value ? form.validateFiles() : form.withoutFileValidation()),
    )

    watch(
      () => props.validationTimeout,
      (value) => form.setValidationTimeout(value),
    )

    onBeforeUnmount(() => formEvents.forEach((e) => formElement.value?.removeEventListener(e, onFormUpdate)))

    const getFormData = (): FormData => new FormData(formElement.value)

    // Convert the FormData to an object because we can't compare two FormData
    // instances directly (which is needed for isDirty), mergeDataIntoQueryString()
    // expects an object, and submitting a FormData instance directly causes problems with nested objects.
    const getData = (): Record<string, FormDataConvertible> => formDataToObject(getFormData())

    const getUrlAndData = (): [string, Record<string, FormDataConvertible>] => {
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
        queryStringArrayFormat: props.queryStringArrayFormat,
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
          props.onSuccess?.(...args)
          props.onSubmitComplete?.(exposed)
          maybeReset(props.resetOnSuccess)

          if (props.setDefaultsOnSuccess === true) {
            defaults()
          }
        },
        onError: (...args) => {
          props.onError?.(...args)
          maybeReset(props.resetOnError)
        },
        ...props.options,
      }

      const [url, data] = getUrlAndData()

      // We need transform because we can't override the default data with different keys (by design)
      form.transform(() => props.transform(data)).submit(method.value, url, submitOptions)
    }

    const reset = (...fields: string[]) => {
      resetFormFields(formElement.value, defaultData.value, fields)

      form.reset(...fields)
    }

    const clearErrors = (...fields: string[]) => {
      form.clearErrors(...fields)
    }

    const resetAndClearErrors = (...fields: string[]) => {
      clearErrors(...fields)
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
      get validating() {
        return form.validating
      },
      clearErrors,
      resetAndClearErrors,
      setError: (fieldOrFields: string | Record<string, string>, maybeValue?: string) =>
        form.setError((typeof fieldOrFields === 'string' ? { [fieldOrFields]: maybeValue } : fieldOrFields) as Errors),
      get isDirty() {
        return isDirty.value
      },
      reset,
      submit,
      defaults,
      getData,
      getFormData,

      // Precognition
      touch: form.touch,
      valid: form.valid,
      invalid: form.invalid,
      touched: form.touched,
      validate: (field?: string | NamedInputEvent | ValidationConfig, config?: ValidationConfig) =>
        form.validate(...UseFormUtils.mergeHeadersForValidation(field, config, props.headers)),
      validator: () => form.validator(),
    }

    expose<FormComponentRef>(exposed)

    provide(FormContextKey, exposed)

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
        slots.default ? slots.default(exposed) : [],
      )
    }
  },
})

export function useFormContext(): FormComponentRef | undefined {
  return inject(FormContextKey)
}

export default Form
