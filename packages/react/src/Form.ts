import {
  FormComponentProps,
  FormComponentRef,
  FormComponentSlotProps,
  FormDataConvertible,
  formDataToObject,
  mergeDataIntoQueryString,
  Method,
  VisitOptions,
} from '@inertiajs/core'
import { isEqual } from 'es-toolkit'
import {
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
      afterSubmit = noop,
      children,
      ...props
    },
    ref,
  ) => {
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

    const reset = (...fields: string[]) => {
      if (fields.length === 0) {
        formElement.current?.reset()
      } else {
        fields.forEach((field) => {
          const input = formElement.current?.querySelector(`[name="${field}"]`) as HTMLInputElement

          if (input) {
            // @ts-expect-error
            input.value = defaultValues.current[field] || ''
          }
        })
      }
    }

    const resetAndClearErrors = (...fields: string[]) => {
      // @ts-expect-error
      form.resetAndClearErrors(...fields)
      reset(...fields)
    }

    const submit = () => {
      const [url, _data] = mergeDataIntoQueryString(
        resolvedMethod,
        typeof action === 'object' ? action.url : action,
        getData(),
        queryStringArrayFormat,
      )

      const submitOptions: FormSubmitOptions = {
        headers,
        errorBag,
        showProgress,
        onCancelToken,
        onBefore,
        onStart,
        onProgress,
        onFinish: (...args) => {
          onFinish(...args)
          afterSubmit({
            reset,
            resetAndClearErrors,
            clearErrors: form.clearErrors,
          })
        },
        onCancel,
        onSuccess,
        onError,
        ...options,
      }

      form.transform(() => transform(_data))
      form.submit(resolvedMethod, url, submitOptions)
    }

    useImperativeHandle(
      ref,
      () => ({
        errors: form.errors,
        hasErrors: form.hasErrors,
        processing: form.processing,
        progress: form.progress,
        wasSuccessful: form.wasSuccessful,
        recentlySuccessful: form.recentlySuccessful,
        clearErrors: form.clearErrors,
        resetAndClearErrors,
        setError: form.setError,
        isDirty,
        reset,
        submit,
      }),
      [form, isDirty, submit],
    )

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
            reset,
            submit,
          })
        : children,
    )
  },
)

Form.displayName = 'InertiaForm'

export default Form
