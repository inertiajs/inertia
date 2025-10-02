import {
  ErrorValue,
  FormDataErrors,
  FormDataKeys,
  FormDataType,
  FormDataValues,
  Method,
  Progress,
  router,
  UrlMethodPair,
  VisitOptions,
} from '@inertiajs/core'
import { cloneDeep, get, has, isEqual, set } from 'lodash-es'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import useRemember from './useRemember'

export type SetDataByObject<TForm> = (data: Partial<TForm>) => void
export type SetDataByMethod<TForm> = (data: (previousData: TForm) => TForm) => void
export type SetDataByKeyValuePair<TForm> = <K extends FormDataKeys<TForm>>(
  key: K,
  value: FormDataValues<TForm, K>,
) => void
export type SetDataAction<TForm extends Record<any, any>> = SetDataByObject<TForm> &
  SetDataByMethod<TForm> &
  SetDataByKeyValuePair<TForm>

type FormOptions = Omit<VisitOptions, 'data'>

export interface InertiaFormProps<TForm extends object> {
  data: TForm
  isDirty: boolean
  errors: FormDataErrors<TForm>
  hasErrors: boolean
  processing: boolean
  progress: Progress | null
  wasSuccessful: boolean
  recentlySuccessful: boolean
  setData: SetDataAction<TForm>
  transform: (callback: (data: TForm) => object) => void
  setDefaults(): void
  setDefaults<T extends FormDataKeys<TForm>>(field: T, value: FormDataValues<TForm, T>): void
  setDefaults(fields: Partial<TForm>): void
  reset<K extends FormDataKeys<TForm>>(...fields: K[]): void
  clearErrors<K extends FormDataKeys<TForm>>(...fields: K[]): void
  resetAndClearErrors<K extends FormDataKeys<TForm>>(...fields: K[]): void
  setError<K extends FormDataKeys<TForm>>(field: K, value: ErrorValue): void
  setError(errors: FormDataErrors<TForm>): void
  submit: (...args: [Method, string, FormOptions?] | [UrlMethodPair, FormOptions?]) => void
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
  const isMounted = useRef(null)
  const rememberKey = typeof rememberKeyOrInitialValues === 'string' ? rememberKeyOrInitialValues : null
  const [defaults, setDefaults] = useState(
    (typeof rememberKeyOrInitialValues === 'string' ? maybeInitialValues : rememberKeyOrInitialValues) || ({} as TForm),
  )
  const cancelToken = useRef(null)
  const recentlySuccessfulTimeoutId = useRef(null)
  const [data, setData] = rememberKey ? useRemember(defaults, `${rememberKey}:data`) : useState(defaults)
  const [errors, setErrors] = rememberKey
    ? useRemember({} as FormDataErrors<TForm>, `${rememberKey}:errors`)
    : useState({} as FormDataErrors<TForm>)
  const [hasErrors, setHasErrors] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(null)
  const [wasSuccessful, setWasSuccessful] = useState(false)
  const [recentlySuccessful, setRecentlySuccessful] = useState(false)
  const transform = useRef((data) => data)
  const isDirty = useMemo(() => !isEqual(data, defaults), [data, defaults])

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  // Track if setDefaults was called manually during onSuccess to avoid
  // overriding user's custom defaults with automatic behavior.
  const setDefaultsCalledInOnSuccess = useRef(false)

  const submit = useCallback(
    (...args) => {
      const objectPassed = args[0] !== null && typeof args[0] === 'object'

      const method = objectPassed ? args[0].method : args[0]
      const url = objectPassed ? args[0].url : args[1]
      const options = (objectPassed ? args[1] : args[2]) ?? {}

      setDefaultsCalledInOnSuccess.current = false

      const _options = {
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
          clearTimeout(recentlySuccessfulTimeoutId.current)

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
          setProgress(event)

          if (options.onProgress) {
            return options.onProgress(event)
          }
        },
        onSuccess: async (page) => {
          if (isMounted.current) {
            setProcessing(false)
            setProgress(null)
            setErrors({} as FormDataErrors<TForm>)
            setHasErrors(false)
            setWasSuccessful(true)
            setRecentlySuccessful(true)
            recentlySuccessfulTimeoutId.current = setTimeout(() => {
              if (isMounted.current) {
                setRecentlySuccessful(false)
              }
            }, 2000)
          }

          const onSuccess = options.onSuccess ? await options.onSuccess(page) : null

          if (isMounted.current && !setDefaultsCalledInOnSuccess.current) {
            setData((data) => {
              setDefaults(cloneDeep(data))
              return data
            })
          }

          return onSuccess
        },
        onError: (errors) => {
          if (isMounted.current) {
            setProcessing(false)
            setProgress(null)
            setErrors(errors)
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
    (keyOrData: FormDataKeys<TForm> | Function | Partial<TForm>, maybeValue?: any) => {
      if (typeof keyOrData === 'string') {
        setData((data) => set(cloneDeep(data), keyOrData, maybeValue))
      } else if (typeof keyOrData === 'function') {
        setData((data) => keyOrData(data))
      } else {
        setData(keyOrData as TForm)
      }
    },
    [setData],
  )

  const [dataAsDefaults, setDataAsDefaults] = useState(false)

  const dataRef = useRef(data)

  useEffect(() => {
    dataRef.current = data
  })

  const setDefaultsFunction = useCallback(
    (fieldOrFields?: FormDataKeys<TForm> | Partial<TForm>, maybeValue?: unknown) => {
      setDefaultsCalledInOnSuccess.current = true

      if (typeof fieldOrFields === 'undefined') {
        setDefaults(dataRef.current)
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
    [setDefaults],
  )

  const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

  useIsomorphicLayoutEffect(() => {
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
    (...fields) => {
      if (fields.length === 0) {
        setData(defaults)
      } else {
        setData((data) =>
          (fields as Array<FormDataKeys<TForm>>)
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
    (fieldOrFields: FormDataKeys<TForm> | FormDataErrors<TForm>, maybeValue?: string) => {
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
    (...fields) => {
      setErrors((errors) => {
        const newErrors = Object.keys(errors).reduce(
          (carry, field) => ({
            ...carry,
            ...(fields.length > 0 && !fields.includes(field) ? { [field]: errors[field] } : {}),
          }),
          {},
        )
        setHasErrors(Object.keys(newErrors).length > 0)
        return newErrors as FormDataErrors<TForm>
      })
    },
    [setErrors, setHasErrors],
  )

  const resetAndClearErrors = useCallback(
    (...fields) => {
      reset(...fields)
      clearErrors(...fields)
    },
    [reset, clearErrors],
  )

  const createSubmitMethod = (method) => (url, options) => {
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

  const transformFunction = useCallback((callback) => {
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
