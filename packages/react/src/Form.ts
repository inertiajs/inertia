import {
  FormComponentProps,
  FormComponentRef,
  FormComponentResetSymbol,
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
import React, {
  createContext,
  createElement,
  FormEvent,
  forwardRef,
  ReactNode,
  use,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import useForm from './useForm'

// Polyfill for startTransition to support React 16.9+
const deferStateUpdate = (callback: () => void) => {
  typeof React.startTransition === 'function' ? React.startTransition(callback) : setTimeout(callback, 0)
}

type ComponentProps = (FormComponentProps &
  Omit<React.FormHTMLAttributes<HTMLFormElement>, keyof FormComponentProps | 'children'> &
  Omit<React.AllHTMLAttributes<HTMLFormElement>, keyof FormComponentProps | 'children'>) & {
  children: ReactNode | ((props: FormComponentSlotProps) => ReactNode)
}

type FormSubmitOptions = Omit<VisitOptions, 'data' | 'onPrefetched' | 'onPrefetching'>
type FormSubmitter = HTMLElement | null

const noop = () => undefined

const FormContext = createContext<FormComponentRef | undefined>(undefined)

const Form = forwardRef<FormComponentRef, ComponentProps>(
  (
    {
      action = '',
      method = 'get',
      headers = {},
      queryStringArrayFormat = 'brackets',
      errorBag = null,
      showProgress = true,
      transform = (data) => data,
      options = {},
      onStart = noop,
      onProgress = noop,
      onFinish = noop,
      onBefore = noop,
      onCancel = noop,
      onSuccess = noop,
      onError = noop,
      onCancelToken = noop,
      onSubmitComplete = noop,
      disableWhileProcessing = false,
      resetOnError = false,
      resetOnSuccess = false,
      setDefaultsOnSuccess = false,
      invalidateCacheTags = [],
      validateFiles = false,
      validationTimeout = 1500,
      withAllErrors = false,
      children,
      ...props
    },
    ref,
  ) => {
    const getTransformedData = (): Record<string, FormDataConvertible> => {
      const [_url, data] = getUrlAndData()
      return transform(data)
    }

    const form = useForm<Record<string, any>>({})
      .withPrecognition(
        () => resolvedMethod,
        () => getUrlAndData()[0],
      )
      .setValidationTimeout(validationTimeout)

    if (validateFiles) {
      form.validateFiles()
    }

    if (withAllErrors) {
      form.withAllErrors()
    }

    form.transform(getTransformedData)

    const formElement = useRef<HTMLFormElement>(undefined)

    const resolvedMethod = useMemo(() => {
      return isUrlMethodPair(action) ? action.method : (method.toLowerCase() as Method)
    }, [action, method])

    const [isDirty, setIsDirty] = useState(false)
    const defaultData = useRef<FormData>(new FormData())

    const getFormData = (submitter?: FormSubmitter): FormData => new FormData(formElement.current, submitter)

    // Convert the FormData to an object because we can't compare two FormData
    // instances directly (which is needed for isDirty), mergeDataIntoQueryString()
    // expects an object, and submitting a FormData instance directly causes problems with nested objects.
    const getData = (submitter?: FormSubmitter): Record<string, FormDataConvertible> =>
      formDataToObject(getFormData(submitter))

    const getUrlAndData = (submitter?: FormSubmitter): [string, Record<string, FormDataConvertible>] => {
      return mergeDataIntoQueryString(
        resolvedMethod,
        isUrlMethodPair(action) ? action.url : action,
        getData(submitter),
        queryStringArrayFormat,
      )
    }

    const updateDirtyState = (event: Event) => {
      if (event.type === 'reset' && (event as CustomEvent).detail?.[FormComponentResetSymbol]) {
        // When the form is reset programmatically, prevent native reset behavior
        event.preventDefault()
      }

      deferStateUpdate(() =>
        setIsDirty(event.type === 'reset' ? false : !isEqual(getData(), formDataToObject(defaultData.current))),
      )
    }

    const clearErrors = (...names: string[]) => {
      form.clearErrors(...names)

      return form
    }

    useEffect(() => {
      defaultData.current = getFormData()

      form.setDefaults(getData())

      const formEvents: Array<keyof HTMLElementEventMap> = ['input', 'change', 'reset']

      formEvents.forEach((e) => formElement.current!.addEventListener(e, updateDirtyState))

      return () => {
        formEvents.forEach((e) => formElement.current?.removeEventListener(e, updateDirtyState))
      }
    }, [])

    useEffect(() => {
      form.setValidationTimeout(validationTimeout)
    }, [validationTimeout])

    useEffect(() => {
      if (validateFiles) {
        form.validateFiles()
      } else {
        form.withoutFileValidation()
      }
    }, [validateFiles])

    const reset = (...fields: string[]) => {
      if (formElement.current) {
        resetFormFields(formElement.current, defaultData.current, fields)
      }

      form.reset(...fields)
    }

    const resetAndClearErrors = (...fields: string[]) => {
      clearErrors(...fields)
      reset(...fields)
    }

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

    const submit = (submitter?: FormSubmitter) => {
      const [url, data] = getUrlAndData(submitter)
      const formTarget = (submitter as HTMLButtonElement | HTMLInputElement | null)?.getAttribute('formtarget')

      if (formTarget === '_blank' && resolvedMethod === 'get') {
        window.open(url, '_blank')
        return
      }

      const submitOptions: FormSubmitOptions = {
        headers,
        queryStringArrayFormat,
        errorBag,
        showProgress,
        invalidateCacheTags,
        onCancelToken,
        onBefore,
        onStart,
        onProgress,
        onFinish,
        onCancel,
        onSuccess: (...args) => {
          onSuccess(...args)
          onSubmitComplete({
            reset,
            defaults,
          })
          maybeReset(resetOnSuccess)

          if (setDefaultsOnSuccess === true) {
            defaults()
          }
        },
        onError(...args) {
          onError(...args)
          maybeReset(resetOnError)
        },
        ...options,
      }

      // We need transform because we can't override the default data with different keys (by design)
      form.transform(() => transform(data))
      form.submit(resolvedMethod, url, submitOptions)

      // Reset the transformer back so the submitter is not used for future submissions
      form.transform(getTransformedData)
    }

    const defaults = () => {
      defaultData.current = getFormData()
      setIsDirty(false)
    }

    const exposed = {
      errors: form.errors,
      hasErrors: form.hasErrors,
      processing: form.processing,
      progress: form.progress,
      wasSuccessful: form.wasSuccessful,
      recentlySuccessful: form.recentlySuccessful,
      isDirty,
      clearErrors,
      resetAndClearErrors,
      setError: form.setError,
      reset,
      submit,
      defaults,
      getData,
      getFormData,

      // Precognition
      validator: () => form.validator(),
      validating: form.validating,
      valid: form.valid,
      invalid: form.invalid,
      validate: (field?: string | NamedInputEvent | ValidationConfig, config?: ValidationConfig) =>
        form.validate(...UseFormUtils.mergeHeadersForValidation(field, config, headers)),
      touch: form.touch,
      touched: form.touched,
    }

    useImperativeHandle(ref, () => exposed, [form, isDirty, submit])

    const formNode = createElement(
      'form',
      {
        ...props,
        ref: formElement,
        action: isUrlMethodPair(action) ? action.url : action,
        method: resolvedMethod,
        onSubmit: (event: FormEvent<HTMLFormElement>) => {
          event.preventDefault()
          submit((event.nativeEvent as SubmitEvent).submitter)
        },
        inert: disableWhileProcessing && form.processing,
      },
      typeof children === 'function' ? children(exposed) : children,
    )

    return createElement(FormContext.Provider, { value: exposed }, formNode)
  },
)

Form.displayName = 'InertiaForm'

export function useFormContext(): FormComponentRef | undefined {
  return use(FormContext)
}

export default Form
