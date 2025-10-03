import {
  Errors,
  FormComponentPrecognition,
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
  children: ReactNode | ((props: FormComponentSlotProps & FormComponentPrecognition) => ReactNode)
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
        const data = getData()
        validator.setOldData(data)
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
    }

    const validate = (field?: string | string[]) => {
      const only = field === undefined ? touched : Array.isArray(field) ? field : [field]

      // We're not using the data object from this method as it might be empty
      // on GET requests, and we still want to pass a data object to the
      // validator so it knows the current state of the form.
      const [url] = getUrlAndData()

      validator.validate({
        url,
        method: resolvedMethod,
        data: getData(),
        only,
        onPrecognitionSuccess: () => {
          setValidated((prev) => [...prev, ...only])
          form.clearErrors(...only)
        },
        onValidationError: (errors) => {
          setValidated((prev) => [...prev, ...only])

          const validFields = only.filter((field) => errors[field] === undefined)

          if (validFields.length) {
            form.clearErrors(...validFields)
          }

          const scopedErrors = (errorBag ? errors[errorBag || ''] || {} : errors) as Errors
          form.setError({ ...form.errors, ...scopedErrors })
        },
      })
    }

    const touch = (field: string | string[]) => {
      const fields = Array.isArray(field) ? field : [field]

      // Use Set to avoid duplicates
      setTouched((prev) => [...new Set([...prev, ...fields])])
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
      setValidationTimeout: (duration: number) => validator.setTimeout(duration),
      validateFiles: () => validator.validateFiles(true),
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
