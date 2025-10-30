import {
  FormComponentProps,
  FormComponentRef,
  FormComponentSlotProps,
  FormComponentValidateOptions,
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
    const formElement = useRef<HTMLFormElement>(null)

    const resolvedMethod = useMemo(() => {
      return isUrlMethodPair(action) ? action.method : (method.toLowerCase() as Method)
    }, [action, method])

    const [isDirty, setIsDirty] = useState(false)
    const defaultData = useRef<FormData>(new FormData())

    const [validating, setValidating] = useState(false)
    const [validated, setValidated] = useState<string[]>([])
    const [touched, setTouched] = useState<string[]>([])

    const validator = useMemo(
      () =>
        usePrecognition({
          timeout: validateTimeout,
          onStart: () => setValidating(true),
          onFinish: () => setValidating(false),
        }),
      [],
    )

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

    useEffect(() => {
      defaultData.current = getFormData()

      const formEvents: Array<keyof HTMLElementEventMap> = ['input', 'change', 'reset']

      formEvents.forEach((e) => formElement.current.addEventListener(e, updateDirtyState))

      return () => formEvents.forEach((e) => formElement.current?.removeEventListener(e, updateDirtyState))
    }, [])

    useEffect(() => {
      validator.validateFiles(validateFiles)
    }, [validateFiles, validator])

    useEffect(() => {
      validator.setTimeout(validateTimeout)
    }, [validateTimeout, validator])

    useEffect(() => {
      updateDataOnValidator()
    }, [])

    const updateDataOnValidator = () => {
      try {
        // This might fail if the component is already unmounted but this function
        // is called after navigating away after a form submission.
        validator.setOldData(transform(getData()))
      } catch {}
    }

    const reset = (...fields: string[]) => {
      resetFormFields(formElement.current, defaultData.current, fields)
      updateDataOnValidator()

      if (fields.length === 0) {
        setTouched([])
      } else {
        setTouched((prev) => prev.filter((field) => !fields.includes(field)))
      }
    }

    const resetAndClearErrors = (...fields: string[]) => {
      form.clearErrors(...fields)
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
      updateDataOnValidator()
    }

    const validate = (
      only?: string | string[] | FormComponentValidateOptions,
      maybeOptions?: FormComponentValidateOptions,
    ) => {
      let fields: string[]
      let options: FormComponentValidateOptions = {}

      if (typeof only === 'object' && !Array.isArray(only)) {
        // Called as validate({ only: [...], onSuccess, onError, onFinish })
        const onlyFields = only.only
        fields = onlyFields === undefined ? touched : Array.isArray(onlyFields) ? onlyFields : [onlyFields]
        options = only
      } else {
        // Called as validate('field') or validate(['field1', 'field2']) or validate('field', {options})
        fields = only === undefined ? touched : Array.isArray(only) ? only : [only]
        options = maybeOptions || {}
      }

      // We're not using the data object from this method as it might be empty
      // on GET requests, and we still want to pass a data object to the
      // validator so it knows the current state of the form.
      const [url] = getUrlAndData()

      validator.validate({
        url,
        method: resolvedMethod,
        data: transform(getData()),
        only: fields,
        errorBag,
        headers,
        simpleValidationErrors,
        onBefore: options.onBefore,
        onPrecognitionSuccess: () => {
          setValidated((prev) => [...prev, ...fields])
          form.clearErrors(...fields)
          options.onSuccess?.()
        },
        onValidationError: (errors) => {
          setValidated((prev) => [...prev, ...fields])

          const validFields = fields.filter((field) => errors[field] === undefined)

          if (validFields.length) {
            form.clearErrors(...validFields)
          }

          form.setError({ ...form.errors, ...errors })
          options.onError?.(errors)
        },
        onException: options.onException,
        onFinish: () => {
          options.onFinish?.()
        },
      })
    }

    const touch = (field: string | string[]) => {
      const fields = Array.isArray(field) ? field : [field]

      // Use Set to avoid duplicates
      setTouched((prev) => [...new Set([...prev, ...fields])])
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
      clearErrors: form.clearErrors,
      resetAndClearErrors,
      setError: form.setError,
      reset,
      submit,
      defaults,

      // Precognition
      validating,
      valid: (field: string) => validated.includes(field) && form.errors[field] === undefined,
      invalid: (field: string) => form.errors[field] !== undefined,
      validate,
      touch,
      touched: isTouched,
    })

    useImperativeHandle(ref, exposed, [
      form,
      isDirty,
      submit,
      validating,
      validated,
      touched,
      validate,
      touch,
      validator,
    ])

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
