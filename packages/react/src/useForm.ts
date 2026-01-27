import {
  CancelToken,
  Errors,
  ErrorValue,
  FormDataErrors,
  FormDataKeys,
  FormDataType,
  FormDataValues,
  Method,
  Progress,
  RequestPayload,
  router,
  UrlMethodPair,
  UseFormArguments,
  UseFormSubmitArguments,
  UseFormSubmitOptions,
  UseFormTransformCallback,
  UseFormUtils,
  UseFormWithPrecognitionArguments,
  VisitOptions,
} from '@inertiajs/core'
import {
  createValidator,
  NamedInputEvent,
  resolveName,
  toSimpleValidationErrors,
  ValidationConfig,
  Validator,
} from 'laravel-precognition'
import { cloneDeep, get, has, isEqual, set } from 'lodash-es'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { config } from '.'
import { useIsomorphicLayoutEffect } from './react'
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

type PrecognitionValidationConfig<TKeys> = ValidationConfig & {
  only?: TKeys[] | Iterable<TKeys> | ArrayLike<TKeys>
}

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
  transform: (callback: UseFormTransformCallback<TForm>) => void
  setDefaults: {
    (): void
    <T extends FormDataKeys<TForm>>(field: T, value: FormDataValues<TForm, T>): void
    (fields: Partial<TForm>): void
  }
  reset: <K extends FormDataKeys<TForm>>(...fields: K[]) => void
  clearErrors: <K extends FormDataKeys<TForm>>(...fields: K[]) => void
  resetAndClearErrors: <K extends FormDataKeys<TForm>>(...fields: K[]) => void
  setError: {
    <K extends FormDataKeys<TForm>>(field: K, value: ErrorValue): void
    (errors: FormDataErrors<TForm>): void
  }
  submit: (...args: UseFormSubmitArguments) => void
  get: (url: string, options?: UseFormSubmitOptions) => void
  patch: (url: string, options?: UseFormSubmitOptions) => void
  post: (url: string, options?: UseFormSubmitOptions) => void
  put: (url: string, options?: UseFormSubmitOptions) => void
  delete: (url: string, options?: UseFormSubmitOptions) => void
  cancel: () => void
  dontRemember: <K extends FormDataKeys<TForm>>(...fields: K[]) => InertiaFormProps<TForm>
  withPrecognition: (...args: UseFormWithPrecognitionArguments) => InertiaPrecognitiveFormProps<TForm>
}

export interface InertiaFormValidationProps<TForm extends object> {
  invalid: <K extends FormDataKeys<TForm>>(field: K) => boolean
  setValidationTimeout: (duration: number) => InertiaPrecognitiveFormProps<TForm>
  touch: <K extends FormDataKeys<TForm>>(
    field: K | NamedInputEvent | Array<K>,
    ...fields: K[]
  ) => InertiaPrecognitiveFormProps<TForm>
  touched: <K extends FormDataKeys<TForm>>(field?: K) => boolean
  valid: <K extends FormDataKeys<TForm>>(field: K) => boolean
  validate: <K extends FormDataKeys<TForm>>(
    field?: K | NamedInputEvent | PrecognitionValidationConfig<K>,
    config?: PrecognitionValidationConfig<K>,
  ) => InertiaPrecognitiveFormProps<TForm>
  validateFiles: () => InertiaPrecognitiveFormProps<TForm>
  validating: boolean
  validator: () => Validator
  withAllErrors: () => InertiaPrecognitiveFormProps<TForm>
  withoutFileValidation: () => InertiaPrecognitiveFormProps<TForm>
  // Backward compatibility for easy migration from the original Precognition libraries
  setErrors: (errors: FormDataErrors<TForm>) => InertiaPrecognitiveFormProps<TForm>
  forgetError: <K extends FormDataKeys<TForm> | NamedInputEvent>(field: K) => InertiaPrecognitiveFormProps<TForm>
}

export type InertiaForm<TForm extends object> = InertiaFormProps<TForm>
export type InertiaPrecognitiveFormProps<TForm extends object> = InertiaFormProps<TForm> &
  InertiaFormValidationProps<TForm>

export default function useForm<TForm extends FormDataType<TForm>>(
  method: Method | (() => Method),
  url: string | (() => string),
  data: TForm | (() => TForm),
): InertiaPrecognitiveFormProps<TForm>
export default function useForm<TForm extends FormDataType<TForm>>(
  urlMethodPair: UrlMethodPair | (() => UrlMethodPair),
  data: TForm | (() => TForm),
): InertiaPrecognitiveFormProps<TForm>
export default function useForm<TForm extends FormDataType<TForm>>(
  rememberKey: string,
  data: TForm | (() => TForm),
): InertiaFormProps<TForm>
export default function useForm<TForm extends FormDataType<TForm>>(data: TForm | (() => TForm)): InertiaFormProps<TForm>
export default function useForm<TForm extends FormDataType<TForm>>(): InertiaFormProps<TForm>
export default function useForm<TForm extends FormDataType<TForm>>(
  ...args: UseFormArguments<TForm>
): InertiaFormProps<TForm> | InertiaPrecognitiveFormProps<TForm> {
  const isMounted = useRef(false)
  const parsedArgs = UseFormUtils.parseUseFormArguments<TForm>(...args)

  const { rememberKey, data: initialData } = parsedArgs
  const precognitionEndpoint = useRef(parsedArgs.precognitionEndpoint)

  const [defaults, setDefaults] = useState(
    typeof initialData === 'function' ? cloneDeep(initialData()) : cloneDeep(initialData),
  )
  const cancelToken = useRef<CancelToken | null>(null)
  const recentlySuccessfulTimeoutId = useRef<number>(undefined)
  const excludeKeysRef = useRef<FormDataKeys<TForm>[]>([])
  const [data, setData] = rememberKey
    ? useRemember(defaults, `${rememberKey}:data`, excludeKeysRef)
    : useState(defaults)
  const [errors, setErrors] = rememberKey
    ? useRemember({} as FormDataErrors<TForm>, `${rememberKey}:errors`)
    : useState({} as FormDataErrors<TForm>)
  const [hasErrors, setHasErrors] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState<Progress | null>(null)
  const [wasSuccessful, setWasSuccessful] = useState(false)
  const [recentlySuccessful, setRecentlySuccessful] = useState(false)
  const transform = useRef<UseFormTransformCallback<TForm>>((data) => data)
  const isDirty = useMemo(() => !isEqual(data, defaults), [data, defaults])

  // Precognition state
  const validatorRef = useRef<Validator | null>(null)
  const [validating, setValidating] = useState(false)
  const [touchedFields, setTouchedFields] = useState<string[]>([])
  const [validFields, setValidFields] = useState<string[]>([])
  const withAllErrors = useRef(false)

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
    (...args: UseFormSubmitArguments) => {
      const { method, url, options } = UseFormUtils.parseSubmitArguments(args, precognitionEndpoint.current)

      setDefaultsCalledInOnSuccess.current = false

      const _options: VisitOptions = {
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
          setProgress(event || null)

          if (options.onProgress) {
            return options.onProgress(event)
          }
        },
        onSuccess: async (page) => {
          if (isMounted.current) {
            setErrors({} as FormDataErrors<TForm>)
            setHasErrors(false)
            setWasSuccessful(true)
            setRecentlySuccessful(true)
            recentlySuccessfulTimeoutId.current = setTimeout(() => {
              if (isMounted.current) {
                setRecentlySuccessful(false)
              }
            }, config.get('form.recentlySuccessfulDuration'))
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
            setErrors(errors as FormDataErrors<TForm>)
            setHasErrors(Object.keys(errors).length > 0)
            validatorRef.current?.setErrors(errors as Errors)
          }

          if (options.onError) {
            return options.onError(errors)
          }
        },
        onCancel: () => {
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

      const transformedData = transform.current(data) as RequestPayload

      if (method === 'delete') {
        router.delete(url, { ..._options, data: transformedData })
      } else {
        router[method](url, transformedData, _options)
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
      let newDefaults = {} as TForm

      if (typeof fieldOrFields === 'undefined') {
        newDefaults = { ...dataRef.current }
        setDefaults(dataRef.current)
        // If setData was called right before setDefaults, data was not
        // updated in that render yet, so we set a flag to update
        // defaults right after the next render.
        setDataAsDefaults(true)
      } else {
        setDefaults((defaults) => {
          newDefaults =
            typeof fieldOrFields === 'string'
              ? set(cloneDeep(defaults), fieldOrFields, maybeValue)
              : Object.assign(cloneDeep(defaults), fieldOrFields)

          return newDefaults as TForm
        })
      }

      validatorRef.current?.defaults(newDefaults)
    },
    [setDefaults],
  )

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
    (...fields: string[]) => {
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

      validatorRef.current?.reset(...fields)
    },
    [setData, defaults],
  )

  const setError = useCallback(
    (fieldOrFields: FormDataKeys<TForm> | FormDataErrors<TForm>, maybeValue?: ErrorValue) => {
      setErrors((errors) => {
        const newErrors = {
          ...errors,
          ...(typeof fieldOrFields === 'string' ? { [fieldOrFields]: maybeValue } : fieldOrFields),
        }
        setHasErrors(Object.keys(newErrors).length > 0)

        validatorRef.current?.setErrors(newErrors)

        return newErrors
      })
    },
    [setErrors, setHasErrors],
  )

  const clearErrors = useCallback(
    (...fields: string[]) => {
      setErrors((errors) => {
        const newErrors = Object.keys(errors).reduce(
          (carry, field) => ({
            ...carry,
            ...(fields.length > 0 && !fields.includes(field) ? { [field]: (errors as Errors)[field] } : {}),
          }),
          {},
        )
        setHasErrors(Object.keys(newErrors).length > 0)

        if (validatorRef.current) {
          if (fields.length === 0) {
            validatorRef.current.setErrors({})
          } else {
            fields.forEach(validatorRef.current.forgetError)
          }
        }

        return newErrors as FormDataErrors<TForm>
      })
    },
    [setErrors, setHasErrors],
  )

  const resetAndClearErrors = useCallback(
    (...fields: string[]) => {
      reset(...fields)
      clearErrors(...fields)
    },
    [reset, clearErrors],
  )

  const createSubmitMethod =
    (method: Method) =>
    (url: string, options: VisitOptions = {}) => {
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

  const transformFunction = useCallback((callback: UseFormTransformCallback<TForm>) => {
    transform.current = callback
  }, [])

  // Build base form properties
  const form = {
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
    dontRemember: <K extends FormDataKeys<TForm>>(...keys: K[]) => {
      excludeKeysRef.current = keys
      return form
    },
  } as InertiaFormProps<TForm>

  const tap = <T>(value: T, callback: (value: T) => unknown): T => {
    callback(value)
    return value
  }

  const valid = useCallback(
    <K extends FormDataKeys<TForm>>(field: K) => validFields.includes(field as string),
    [validFields],
  )

  const invalid = useCallback(<K extends FormDataKeys<TForm>>(field: K) => field in errors, [errors])

  const touched = useCallback(
    <K extends FormDataKeys<TForm>>(field?: K) =>
      typeof field === 'string' ? touchedFields.includes(field as string) : touchedFields.length > 0,
    [touchedFields],
  )

  const validate = (field?: string | NamedInputEvent | ValidationConfig, config?: ValidationConfig) => {
    // Handle config object passed as first argument
    if (typeof field === 'object' && !('target' in field)) {
      config = field
      field = undefined
    }

    if (field === undefined) {
      validatorRef.current!.validate(config)
    } else {
      const fieldName = resolveName(field)
      const currentData = dataRef.current
      const transformedData = transform.current(currentData) as Record<string, unknown>
      validatorRef.current!.validate(fieldName, get(transformedData, fieldName), config)
    }

    return form
  }

  // Create withPrecognition method that returns a precognitive form
  const withPrecognition = (...args: UseFormWithPrecognitionArguments): InertiaPrecognitiveFormProps<TForm> => {
    precognitionEndpoint.current = UseFormUtils.createWayfinderCallback(...args)

    if (!validatorRef.current) {
      const validator = createValidator((client) => {
        const { method, url } = precognitionEndpoint.current!()
        // Get the current data from the ref, not the closure
        const currentData = dataRef.current
        const transformedData = transform.current(currentData) as Record<string, unknown>
        return client[method](url, transformedData)
      }, cloneDeep(defaults))

      validatorRef.current = validator

      validator
        .on('validatingChanged', () => {
          setValidating(validator.validating())
        })
        .on('validatedChanged', () => {
          setValidFields(validator.valid())
        })
        .on('touchedChanged', () => {
          setTouchedFields(validator.touched())
        })
        .on('errorsChanged', () => {
          const validationErrors = withAllErrors.current
            ? validator.errors()
            : toSimpleValidationErrors(validator.errors())

          setErrors(validationErrors as FormDataErrors<TForm>)
          setHasErrors(Object.keys(validationErrors).length > 0)
          setValidFields(validator.valid())
        })
    }

    // Create precognitive form with all validation methods
    const precognitiveForm = Object.assign(form, {
      validating,
      validator: () => validatorRef.current!,
      valid,
      invalid,
      touched,
      withoutFileValidation: () => tap(precognitiveForm, () => validatorRef.current?.withoutFileValidation()),
      touch: (
        field: FormDataKeys<TForm> | NamedInputEvent | Array<FormDataKeys<TForm>>,
        ...fields: FormDataKeys<TForm>[]
      ) => {
        if (Array.isArray(field)) {
          validatorRef.current?.touch(field)
        } else if (typeof field === 'string') {
          validatorRef.current?.touch([field, ...fields])
        } else {
          validatorRef.current?.touch(field)
        }

        return precognitiveForm
      },
      withAllErrors: () => tap(precognitiveForm, () => (withAllErrors.current = true)),
      setValidationTimeout: (duration: number) =>
        tap(precognitiveForm, () => validatorRef.current?.setTimeout(duration)),
      validateFiles: () => tap(precognitiveForm, () => validatorRef.current?.validateFiles()),
      validate,
      setErrors: (errors: FormDataErrors<TForm>) => tap(precognitiveForm, () => form.setError(errors)),
      forgetError: (field: FormDataKeys<TForm> | NamedInputEvent) =>
        tap(precognitiveForm, () =>
          form.clearErrors(resolveName(field as string | NamedInputEvent) as FormDataKeys<TForm>),
        ),
    }) as InertiaPrecognitiveFormProps<TForm>

    return precognitiveForm
  }

  form.withPrecognition = withPrecognition

  return precognitionEndpoint.current ? form.withPrecognition(precognitionEndpoint.current) : form
}
