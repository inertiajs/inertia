import {
  FormDataConvertible,
  formDataToObject,
  FormComponentProps,
  FormComponentSlotProps,
  mergeDataIntoQueryString,
  Method,
  VisitOptions,
} from '@inertiajs/core'
import { isEqual } from 'es-toolkit'
import { createElement, FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import useForm from './useForm'

type ComponentProps = FormComponentProps & {
  children: (props: FormComponentSlotProps) => ReactNode
}

type FormOptions = Omit<VisitOptions, 'data' | 'onPrefetched' | 'onPrefetching'>

const Form = ({
  action,
  method = 'get',
  headers = {},
  queryStringArrayFormat = 'brackets',
  errorBag = null,
  showProgress = true,
  transform = (data) => data,
  visitOptions = {},
  onStart = () => {},
  onProgress = () => {},
  onFinish = () => {},
  onBefore = () => {},
  onCancel = () => {},
  onSuccess = () => {},
  onError = () => {},
  onCancelToken = () => {},
  children,
  ...props
}: ComponentProps) => {
  const form = useForm({})
  const formElement = useRef<HTMLFormElement>(null)

  const resolvedMethod = useMemo(() => {
    return typeof action === 'object' ? action.method : (method.toLowerCase() as Method)
  }, [action, method])

  const [isDirty, setIsDirty] = useState(false)
  const defaultValues = useRef<Record<string, FormDataConvertible>>({})

  const getData = (): Record<string, FormDataConvertible> => {
    // Convert the FormData to an object because we can't compare two FormData
    // instances directly (which is needed for isDirty), mergeDataIntoQueryString()
    // expects an object, and submitting a FormData instance directly causes problems with nested objects.
    return formDataToObject(new FormData(formElement.current))
  }

  const updateDirtyState = (event: Event) =>
    setIsDirty(event.type === 'reset' ? false : !isEqual(getData(), defaultValues.current))

  useEffect(() => {
    defaultValues.current = getData()

    const formEvents: Array<keyof HTMLElementEventMap> = ['input', 'change', 'reset']

    formEvents.forEach((e) => formElement.current.addEventListener(e, updateDirtyState))

    return () => formEvents.forEach((e) => formElement.current?.removeEventListener(e, updateDirtyState))
  }, [])

  const submit = () => {
    const [url, _data] = mergeDataIntoQueryString(
      resolvedMethod,
      typeof action === 'object' ? action.url : action,
      getData(),
      queryStringArrayFormat,
    )

    const options: FormOptions = {
      headers,
      errorBag,
      showProgress,
      onCancelToken,
      onBefore,
      onStart,
      onProgress,
      onFinish,
      onCancel,
      onSuccess,
      onError,
      ...visitOptions,
    }

    form.transform(() => transform(_data))
    form.submit(resolvedMethod, url, options)
  }

  return createElement(
    'form',
    {
      ...props,
      ref: formElement,
      action: typeof action === 'object' ? action.url : action,
      method: resolvedMethod,
      onSubmit: (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        submit()
      },
    },
    typeof children === 'function'
      ? children({
          errors: form.errors,
          hasErrors: form.hasErrors,
          processing: form.processing,
          progress: form.progress,
          wasSuccessful: form.wasSuccessful,
          recentlySuccessful: form.recentlySuccessful,
          setError: form.setError,
          clearErrors: form.clearErrors,
          resetAndClearErrors: form.resetAndClearErrors,
          isDirty,
          reset: () => formElement.current?.reset(),
          submit,
        })
      : children,
  )
}

Form.displayName = 'InertiaForm'

export default Form
