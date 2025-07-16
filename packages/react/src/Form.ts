import {
  FormDataConvertible,
  formDataToObject,
  mergeDataIntoQueryString,
  Method,
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
  clearErrors: (...fields: string[]) => void
  resetAndClearErrors: (...fields: string[]) => void
  setError(field: string, value: string): void
  setError(errors: Record<string, string>): void
  isDirty: boolean
  reset: () => void
  submit: () => void
}

interface InertiaFormSubmitProps {
  preserveScroll?: PreserveStateOption
  preserveState?: PreserveStateOption
  preserveUrl?: boolean
  replace?: boolean
  only?: string[]
  except?: string[]
  reset?: string[]
}

interface InertiaFormProps {
  action: string | { url: string; method: Method }
  method?: Method
  headers?: Record<string, string>
  queryStringArrayFormat?: 'brackets' | 'indices'
  errorBag?: string | null
  showProgress?: boolean
  transform?: (data: Record<string, FormDataConvertible>) => Record<string, FormDataConvertible>
  submitOptions?: InertiaFormSubmitProps
  onCancelToken?: (cancelToken: import('axios').CancelTokenSource) => void
  onBefore?: () => boolean | void
  onStart?: (visit: PendingVisit) => void
  onProgress?: (progress: Progress) => void
  onFinish?: (visit: PendingVisit) => void
  onCancel?: () => void
  onSuccess?: () => void
  onError?: () => void
  children: (props: InertiaFormSlotProps) => ReactNode
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
  submitOptions = {
    replace: false,
    preserveScroll: false,
    preserveState: null,
    preserveUrl: false,
    only: [],
    except: [],
    reset: [],
  },
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
}: InertiaFormProps) => {
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
      replace: submitOptions.replace,
      preserveScroll: submitOptions.preserveScroll,
      preserveState: submitOptions.preserveState ?? resolvedMethod !== 'get',
      preserveUrl: submitOptions.preserveUrl,
      only: submitOptions.only,
      except: submitOptions.except,
      reset: submitOptions.reset,
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
