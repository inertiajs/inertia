import {
  ErrorValue,
  FormDataError,
  FormDataKeys,
  FormDataType,
  FormDataValues,
  Method,
  Progress,
  router,
  VisitOptions,
} from '@inertiajs/core'
import { cloneDeep, isEqual } from 'es-toolkit'
import { get, has, set } from 'es-toolkit/compat'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import useRemember from './useRemember'

export type SetDataByObject<TForm> = (data: TForm) => void
export type SetDataByMethod<TForm> = (data: (previousData: TForm) => TForm) => void
export type SetDataByKeyValuePair<TForm> = <K extends FormDataKeys<TForm>>(key: K, value: FormDataValues<TForm, K>) => void
export type SetDataAction<TForm extends Record<any, any>> = SetDataByObject<TForm> & SetDataByMethod<TForm> & SetDataByKeyValuePair<TForm>

type FormOptions = Omit<VisitOptions, 'data'>

export interface InertiaFormProps<TForm extends FormDataType<TForm>> {
  data: TForm
  isDirty: boolean
  errors: FormDataError<TForm>
  hasErrors: boolean
  processing: boolean
  progress: Progress | null
  wasSuccessful: boolean
  recentlySuccessful: boolean
  setData: SetDataAction<TForm>
  transform: (callback: (data: TForm) => FormDataType<TForm>) => void
  setDefaults(): void
  setDefaults<T extends FormDataKeys<TForm>>(field: T, value: FormDataValues<TForm, T>): void
  setDefaults(fields: Partial<TForm>): void
  reset: (...fields: FormDataKeys<TForm>[]) => void
  clearErrors: (...fields: FormDataKeys<TForm>[]) => void
  resetAndClearErrors: (...fields: FormDataKeys<TForm>[]) => void
  setError(field: FormDataKeys<TForm>, value: ErrorValue): void
  setError(errors: FormDataError<TForm>): void
  submit: (...args: [Method, string, FormOptions?] | [{ url: string; method: Method }, FormOptions?]) => void
  get: (url: string, options?: FormOptions) => void
  patch: (url: string, options?: FormOptions) => void
  post: (url: string, options?: FormOptions) => void
  put: (url: string, options?: FormOptions) => void
  delete: (url: string, options?: FormOptions) => void
  cancel: () => void
}
export default function useForm<TForm extends FormDataType<TForm>>(
  initialValues?: TForm | (() => TForm),
): InertiaFormProps<TForm>
export default function useForm<TForm extends FormDataType<TForm>>(
  rememberKey: string,
  initialValues?: TForm | (() => TForm),
): InertiaFormProps<TForm>
export default function useForm<TForm extends FormDataType<TForm>>(
  rememberKeyOrInitialValues?: string | TForm | (() => TForm),
  maybeInitialValues?: TForm | (() => TForm),
): InertiaFormProps<TForm> {
  const isMounted = useRef<boolean>(null)
  const rememberKey = typeof rememberKeyOrInitialValues === 'string' ? rememberKeyOrInitialValues : null
  const [defaults, setDefaults] = useState(
    (typeof rememberKeyOrInitialValues === 'string' ? maybeInitialValues : rememberKeyOrInitialValues) || ({} as TForm),
  )
  const cancelToken = useRef<{ cancel: VoidFunction }>(null)
  const recentlySuccessfulTimeoutId = useRef<number>(null)
  const [data, setData] = rememberKey ? useRemember(defaults, `${rememberKey}:data`) : useState(defaults)
  const [errors, setErrors] = rememberKey
    ? useRemember({} as FormDataError<TForm>, `${rememberKey}:errors`)
    : useState({} as FormDataError<TForm>)
  const [hasErrors, setHasErrors] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState<Progress|null>(null)
  const [wasSuccessful, setWasSuccessful] = useState(false)
  const [recentlySuccessful, setRecentlySuccessful] = useState(false)
  const transform = useRef<(data: TForm) => FormDataType<TForm>>((data) => data)
  const isDirty = useMemo(() => !isEqual(data, defaults), [data, defaults])

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  const submit = useCallback(
    (...args: (
      [method: Method, url: string, options?: FormOptions]
      |
      [methodAndUrl: {method: Method, url: string}, options?: FormOptions]
    )) => {
      const objectPassed = typeof args[0] === 'object'

      const method = objectPassed ? args[0].method : args[0]
      const url = objectPassed ? args[0].url : args[1]
      const options = (objectPassed ? args[1] : args[2]) ?? {}

      const _options: FormOptions = {
        ...options,
        onCancelToken: (token) => {
          cancelToken.current = token

          if (options.onCancelToken) {
            return options.onCancelToken(token)
          }
        },
        onBefore: (visit) => {
          setWasSuccessful(false)
          setRecentlySuccessful(false)
          clearTimeout(recentlySuccessfulTimeoutId.current!)

          if (options.onBefore) {
            return options.onBefore(visit)
          }
        },
        onStart: (visit) => {
          setProcessing(true)

          if (options.onStart) {
            return options.onStart(visit)
          }
        },
        onProgress: (event) => {
          setProgress(event ?? null)

          if (options.onProgress) {
            return options.onProgress(event)
          }
        },
        onSuccess: (page) => {
          if (isMounted.current) {
            setProcessing(false)
            setProgress(null)
            setErrors({})
            setHasErrors(false)
            setWasSuccessful(true)
            setRecentlySuccessful(true)
            setDefaults(cloneDeep(data))
            recentlySuccessfulTimeoutId.current = setTimeout(() => {
              if (isMounted.current) {
                setRecentlySuccessful(false)
              }
            }, 2000)
          }

          if (options.onSuccess) {
            return options.onSuccess(page)
          }
        },
        onError: (errors) => {
          if (isMounted.current) {
            setProcessing(false)
            setProgress(null)
            setErrors(errors as FormDataError<TForm>)
            setHasErrors(true)
          }

          if (options.onError) {
            return options.onError(errors)
          }
        },
        onCancel: () => {
          if (isMounted.current) {
            setProcessing(false)
            setProgress(null)
          }

          if (options.onCancel) {
            return options.onCancel()
          }
        },
        onFinish: (visit) => {
          if (isMounted.current) {
            setProcessing(false)
            setProgress(null)
          }

          cancelToken.current = null

          if (options.onFinish) {
            return options.onFinish(visit)
          }
        },
      }

      if (method === 'delete') {
        router.delete(url, { ..._options, data: transform.current(data) })
      } else {
        router[method](url, transform.current(data), _options)
      }
    },
    [data, setErrors, transform],
  )

  const setDataFunction = useCallback(
    (keyOrData: FormDataKeys<TForm> | ((data: TForm)=>TForm) | TForm, maybeValue?: any) => {
      if (typeof keyOrData === 'string') {
        setData((data) => set(cloneDeep(data), keyOrData, maybeValue))
      } else if (typeof keyOrData === 'function') {
        setData((data) => keyOrData(data))
      } else {
        setData(keyOrData)
      }
    },
    [setData],
  )

  const [dataAsDefaults, setDataAsDefaults] = useState(false)

  const setDefaultsFunction = useCallback(
    (fieldOrFields?: FormDataKeys<TForm> | Partial<TForm>, maybeValue?: unknown) => {
      if (typeof fieldOrFields === 'undefined') {
        setDefaults(data)
        // If setData was called right before setDefaults, data was not
        // updated in that render yet, so we set a flag to update
        // defaults right after the next render.
        setDataAsDefaults(true)
      } else {
        setDefaults((defaults) => {
          return typeof fieldOrFields === 'string'
            ? set(cloneDeep(defaults), fieldOrFields, maybeValue)
            : Object.assign(cloneDeep(defaults), fieldOrFields)
        })
      }
    },
    [data, setDefaults],
  )

  useLayoutEffect(() => {
    if (!dataAsDefaults) {
      return
    }

    if (isDirty) {
      // Data has been updated in this next render and is different from
      // the defaults, so now we can set defaults to the current data.
      setDefaults(data)
    }

    setDataAsDefaults(false)
  }, [dataAsDefaults])

  const reset = useCallback(
    (...fields: Array<FormDataKeys<TForm>>) => {
      if (fields.length === 0) {
        setData(defaults)
      } else {
        setData((data) =>
          fields
            .filter((key) => has(defaults, key))
            .reduce(
              (carry, key) => {
                return set(carry, key, get(defaults, key))
              },
              { ...data } as TForm,
            ),
        )
      }
    },
    [setData, defaults],
  )

  const setError = useCallback(
    (fieldOrFields: FormDataKeys<TForm> | FormDataError<TForm>, maybeValue?: string) => {
      setErrors((errors) => {
        const newErrors = {
          ...errors,
          ...(typeof fieldOrFields === 'string' ? { [fieldOrFields]: maybeValue } : fieldOrFields),
        }
        setHasErrors(Object.keys(newErrors).length > 0)
        return newErrors
      })
    },
    [setErrors, setHasErrors],
  )

  const clearErrors = useCallback(
    (...fields: FormDataKeys<TForm>[]) => {
      setErrors((errors) => {
        const newErrors = (Object.keys(errors) as Array<FormDataKeys<TForm>>).reduce(
          (carry, field) => ({
            ...carry,
            ...(fields.length > 0 && !fields.includes(field) ? { [field]: errors[field] } : {}),
          }),
          {},
        )
        setHasErrors(Object.keys(newErrors).length > 0)
        return newErrors
      })
    },
    [setErrors, setHasErrors],
  )

  const resetAndClearErrors = useCallback(
    (...fields: FormDataKeys<TForm>[]) => {
      reset(...fields)
      clearErrors(...fields)
    },
    [reset, clearErrors],
  )

  const createSubmitMethod = (method: Method) => (url: string, options?: FormOptions) => {
    submit(method, url, options)
  }
  const getMethod = useCallback(createSubmitMethod('get'), [submit])
  const post = useCallback(createSubmitMethod('post'), [submit])
  const put = useCallback(createSubmitMethod('put'), [submit])
  const patch = useCallback(createSubmitMethod('patch'), [submit])
  const deleteMethod = useCallback(createSubmitMethod('delete'), [submit])

  const cancel = useCallback(() => {
    if (cancelToken.current) {
      cancelToken.current.cancel()
    }
  }, [])

  const transformFunction = useCallback((callback: (data: TForm) => FormDataType<TForm>) => {
    transform.current = callback
  }, [])

  return {
    data,
    setData: setDataFunction,
    isDirty,
    errors,
    hasErrors,
    processing,
    progress,
    wasSuccessful,
    recentlySuccessful,
    transform: transformFunction,
    setDefaults: setDefaultsFunction,
    reset,
    setError,
    clearErrors,
    resetAndClearErrors,
    submit,
    get: getMethod,
    post,
    put,
    patch,
    delete: deleteMethod,
    cancel,
  }
}
