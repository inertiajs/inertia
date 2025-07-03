import {
  FormDataConvertible,
  FormDataKeys,
  formDataToObject,
  mergeDataIntoQueryString,
  Method,
  objectToFormData,
  PendingVisit,
  PreserveStateOption,
  Progress,
  VisitOptions,
} from '@inertiajs/core'
import { isEqual } from 'es-toolkit'
import { createElement, FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import useForm from './useForm'

interface InertiaFormSlotProps {
  errors: Record<string, string>
  hasErrors: boolean
  processing: boolean
  progress: Progress | null
  wasSuccessful: boolean
  recentlySuccessful: boolean
  setError: (field: FormDataKeys<Record<string, FormDataConvertible>>, value: string) => void
  clearErrors: (...fields: FormDataKeys<Record<string, FormDataConvertible>>[]) => void
  isDirty: boolean
  reset: () => void
  submit: () => void
}

interface InertiaFormProps {
  data?: Record<string, FormDataConvertible>
  action: string | { url: string; method: Method }
  method?: Method
  headers?: Record<string, string>
  preserveScroll?: PreserveStateOption
  preserveState?: PreserveStateOption
  preserveUrl?: boolean
  replace?: boolean
  only?: string[]
  except?: string[]
  reset?: string[]
  onCancelToken?: (cancelToken: import('axios').CancelTokenSource) => void
  onBefore?: () => boolean | void
  onStart?: (visit: PendingVisit) => void
  onProgress?: (progress: Progress) => void
  onFinish?: (visit: PendingVisit) => void
  onCancel?: () => void
  onSuccess?: () => void
  onError?: () => void
  queryStringArrayFormat?: 'brackets' | 'indices'
  errorBag?: string | null
  showProgress?: boolean
  children: (props: InertiaFormSlotProps) => ReactNode
}

type FormOptions = Omit<VisitOptions, 'data' | 'onPrefetched' | 'onPrefetching'>

const Form = ({
  data = {},
  action,
  method = 'get',
  replace = false,
  preserveScroll = false,
  preserveState,
  preserveUrl = false,
  only = [],
  except = [],
  reset = [],
  headers = {},
  queryStringArrayFormat = 'brackets',
  onStart = () => {},
  onProgress = () => {},
  onFinish = () => {},
  onBefore = () => {},
  onCancel = () => {},
  onSuccess = () => {},
  onError = () => {},
  onCancelToken = () => {},
  showProgress = true,
  errorBag,
  children,
  ...props
}: InertiaFormProps) => {
  const form = useForm(data)
  const formElement = useRef<HTMLFormElement>(null)

  const resolvedMethod = useMemo(() => {
    return typeof action === 'object' ? action.method : (method.toLowerCase() as Method)
  }, [action, method])

  const [isDirty, setIsDirty] = useState(false)
  const defaultValues = useRef<Record<string, FormDataConvertible>>({})

  const getData = () => formDataToObject(objectToFormData(data || {}, new FormData(formElement.current)))

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
      replace,
      preserveScroll,
      preserveState: preserveState ?? resolvedMethod !== 'get',
      preserveUrl,
      only,
      except,
      reset,
      headers,
      onCancelToken,
      onBefore,
      onStart,
      onProgress,
      onFinish,
      onCancel,
      onSuccess,
      onError,
      showProgress,
      errorBag,
    }

    form.transform(() => _data)
    form.submit(resolvedMethod, url, options)
  }

  return createElement(
    'form',
    {
      ref: formElement,
      action: typeof action === 'object' ? action.url : action,
      method: resolvedMethod,
      onSubmit: (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        submit()
      },
      ...props,
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
          isDirty,
          reset: () => formElement.current?.reset(),
          submit,
        })
      : children,
  )
}

Form.displayName = 'InertiaForm'

export default Form
