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
  VisitOptions,
} from '@inertiajs/core'
import {
  createValidator,
  NamedInputEvent,
  toSimpleValidationErrors,
  ValidationConfig,
  Validator,
} from 'laravel-precognition'
import { isEqual } from 'lodash-es'
import React, {
  createElement,
  FormEvent,
  forwardRef,
  ReactNode,
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

const noop = () => undefined

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
      validateTimeout = 1500,
      simpleValidationErrors = true,
      children,
      ...props
    },
    ref,
  ) => {
    const form = useForm<Record<string, any>>({})
    const formElement = useRef<HTMLFormElement>(undefined)

    const resolvedMethod = useMemo(() => {
      return isUrlMethodPair(action) ? action.method : (method.toLowerCase() as Method)
    }, [action, method])

    const [isDirty, setIsDirty] = useState(false)
    const defaultData = useRef<FormData>(new FormData())

    const [validating, setValidating] = useState(false)
    const [valid, setValid] = useState<string[]>([])
    const [touched, setTouched] = useState<string[]>([])

    const [validator, setValidator] = useState<Validator>()

    const getFormData = (): FormData => new FormData(formElement.current)

    // Convert the FormData to an object because we can't compare two FormData
    // instances directly (which is needed for isDirty), mergeDataIntoQueryString()
    // expects an object, and submitting a FormData instance directly causes problems with nested objects.
    const getData = (): Record<string, FormDataConvertible> => formDataToObject(getFormData())

    const getUrlAndData = (): [string, Record<string, FormDataConvertible>] => {
      return mergeDataIntoQueryString(
        resolvedMethod,
        isUrlMethodPair(action) ? action.url : action,
        getData(),
        queryStringArrayFormat,
      )
    }

    const updateDirtyState = (event: Event) =>
      deferStateUpdate(() =>
        setIsDirty(event.type === 'reset' ? false : !isEqual(getData(), formDataToObject(defaultData.current))),
      )

    const clearErrors = (...names: string[]) => {
      form.clearErrors(...names)

      if (names.length === 0) {
        validator!.setErrors({})
      } else {
        names.forEach(validator!.forgetError)
      }

      return form
    }

    const getTransformedData = (): Record<string, FormDataConvertible> => {
      const [_url, data] = getUrlAndData()
      return transform(data)
    }

    useEffect(() => {
      defaultData.current = getFormData()

      const formEvents: Array<keyof HTMLElementEventMap> = ['input', 'change', 'reset']

      formEvents.forEach((e) => formElement.current!.addEventListener(e, updateDirtyState))

      // Initialize validator
      const newValidator = createValidator(
        (client) =>
          client[resolvedMethod](getUrlAndData()[0], getTransformedData(), {
            headers,
          }),
        getTransformedData(),
      )
        .on('validatingChanged', () => {
          setValidating(newValidator.validating())
        })
        .on('validatedChanged', () => {
          setValid(newValidator.valid())
        })
        .on('touchedChanged', () => {
          setTouched(newValidator.touched())
        })
        .on('errorsChanged', () => {
          form.clearErrors()

          const errors = simpleValidationErrors
            ? toSimpleValidationErrors(newValidator.errors())
            : newValidator.errors()

          form.setError(errors as Errors)

          setValid(newValidator.valid())
        })

      newValidator.setTimeout(validateTimeout)

      if (validateFiles) {
        newValidator.validateFiles()
      }

      setValidator(newValidator)

      return () => {
        formEvents.forEach((e) => formElement.current?.removeEventListener(e, updateDirtyState))
      }
    }, [])

    useEffect(() => {
      validator?.setTimeout(validateTimeout)
    }, [validateTimeout, validator])

    const reset = (...fields: string[]) => {
      if (formElement.current) {
        resetFormFields(formElement.current, defaultData.current, fields)
      }

      validator!.reset(...fields)
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

    const submit = () => {
      const [url, _data] = getUrlAndData()

      const submitOptions: FormSubmitOptions = {
        headers,
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

      form.transform(() => transform(_data))
      form.submit(resolvedMethod, url, submitOptions)
    }

    const defaults = () => {
      defaultData.current = getFormData()
      setIsDirty(false)
    }

    const touch = (...fields: string[]) => {
      validator!.touch(fields)
    }

    const isTouched = (field?: string): boolean => {
      if (typeof field === 'string') {
        return touched.includes(field)
      }

      return touched.length > 0
    }

    const exposed = () => ({
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
      validator: validator!,
      validating,
      valid: (field: string) => valid.includes(field),
      invalid: (field: string) => form.errors[field] !== undefined,
      validate: (input?: string | NamedInputEvent | ValidationConfig, value?: unknown, config?: ValidationConfig) =>
        validator!.validate(input, value, config),
      touch,
      touched: isTouched,
    })

    useImperativeHandle(ref, exposed, [form, isDirty, submit, validating, valid, touched, touch, validator])

    return createElement(
      'form',
      {
        ...props,
        ref: formElement,
        action: isUrlMethodPair(action) ? action.url : action,
        method: resolvedMethod,
        onSubmit: (event: FormEvent<HTMLFormElement>) => {
          event.preventDefault()
          submit()
        },
        // Only React 19 supports passing a boolean to the `inert` attribute.
        // To support earlier versions as well, we use the string 'true'.
        // Unfortunately, React 19 treats an empty string as `false`.
        // See: https://github.com/inertiajs/inertia/pull/2536
        inert: disableWhileProcessing && form.processing && 'true',
      },
      typeof children === 'function' ? children(exposed()) : children,
    )
  },
)

Form.displayName = 'InertiaForm'

export default Form
