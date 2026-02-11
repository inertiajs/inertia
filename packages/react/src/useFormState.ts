import {
  Errors,
  ErrorValue,
  FormDataErrors,
  FormDataKeys,
  FormDataValues,
  Progress,
  UrlMethodPair,
  UseFormTransformCallback,
  UseFormUtils,
  UseFormWithPrecognitionArguments,
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

export interface FormStateProps<TForm extends object> {
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
  withPrecognition: (...args: UseFormWithPrecognitionArguments) => FormStateWithPrecognition<TForm>
}

export interface FormStateValidationProps<TForm extends object> {
  invalid: <K extends FormDataKeys<TForm>>(field: K) => boolean
  setValidationTimeout: (duration: number) => FormStateWithPrecognition<TForm>
  touch: <K extends FormDataKeys<TForm>>(
    field: K | NamedInputEvent | Array<K>,
    ...fields: K[]
  ) => FormStateWithPrecognition<TForm>
  touched: <K extends FormDataKeys<TForm>>(field?: K) => boolean
  valid: <K extends FormDataKeys<TForm>>(field: K) => boolean
  validate: <K extends FormDataKeys<TForm>>(
    field?: K | NamedInputEvent | PrecognitionValidationConfig<K>,
    config?: PrecognitionValidationConfig<K>,
  ) => FormStateWithPrecognition<TForm>
  validateFiles: () => FormStateWithPrecognition<TForm>
  validating: boolean
  validator: () => Validator
  withAllErrors: () => FormStateWithPrecognition<TForm>
  withoutFileValidation: () => FormStateWithPrecognition<TForm>
  setErrors: (errors: FormDataErrors<TForm>) => FormStateWithPrecognition<TForm>
  forgetError: <K extends FormDataKeys<TForm> | NamedInputEvent>(field: K) => FormStateWithPrecognition<TForm>
}

export type FormState<TForm extends object> = FormStateProps<TForm>
export type FormStateWithPrecognition<TForm extends object> = FormStateProps<TForm> & FormStateValidationProps<TForm>

export interface UseFormStateOptions<TForm extends object> {
  data: TForm | (() => TForm)
  precognitionEndpoint?: (() => UrlMethodPair) | null
  useDataState?: () => [TForm, React.Dispatch<React.SetStateAction<TForm>>]
  useErrorsState?: () => [FormDataErrors<TForm>, React.Dispatch<React.SetStateAction<FormDataErrors<TForm>>>]
}

export interface UseFormStateReturn<TForm extends object> {
  form: FormState<TForm>
  setDefaultsState: React.Dispatch<React.SetStateAction<TForm>>
  transformRef: React.MutableRefObject<UseFormTransformCallback<TForm>>
  precognitionEndpointRef: React.MutableRefObject<(() => UrlMethodPair) | null>
  dataRef: React.MutableRefObject<TForm>
  isMounted: React.MutableRefObject<boolean>
  setProcessing: React.Dispatch<React.SetStateAction<boolean>>
  setProgress: React.Dispatch<React.SetStateAction<Progress | null>>
  markAsSuccessful: () => void
  clearErrors: (...fields: string[]) => void
  setError: (fieldOrFields: FormDataKeys<TForm> | FormDataErrors<TForm>, maybeValue?: ErrorValue) => void
  defaultsCalledInOnSuccessRef: React.MutableRefObject<boolean>
  resetBeforeSubmit: () => void
  finishProcessing: () => void
}

export default function useFormState<TForm extends object>(
  options: UseFormStateOptions<TForm>,
): UseFormStateReturn<TForm> {
  const { data: dataOption, useDataState, useErrorsState } = options

  const isDataFunction = typeof dataOption === 'function'
  const resolveData = () => (isDataFunction ? (dataOption as () => TForm)() : dataOption)

  const initialData = cloneDeep(resolveData())

  const isMounted = useRef(false)
  const precognitionEndpointRef = useRef(options.precognitionEndpoint ?? null)

  const [defaults, setDefaultsState] = useState(cloneDeep(initialData))

  const [data, setData] = useDataState ? useDataState() : useState(cloneDeep(initialData))
  const [errors, setErrors] = useErrorsState ? useErrorsState() : useState({} as FormDataErrors<TForm>)

  const [hasErrors, setHasErrors] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState<Progress | null>(null)
  const [wasSuccessful, setWasSuccessful] = useState(false)
  const [recentlySuccessful, setRecentlySuccessful] = useState(false)

  const recentlySuccessfulTimeoutId = useRef<number>(undefined)
  const transformRef = useRef<UseFormTransformCallback<TForm>>((data) => data)
  const isDirty = useMemo(() => !isEqual(data, defaults), [data, defaults])
  const defaultsCalledInOnSuccessRef = useRef(false)

  const validatorRef = useRef<Validator | null>(null)
  const [validating, setValidating] = useState(false)
  const [touchedFields, setTouchedFields] = useState<string[]>([])
  const [validFields, setValidFields] = useState<string[]>([])
  const withAllErrorsRef = useRef<boolean | null>(null)

  const dataRef = useRef(data)

  useEffect(() => {
    dataRef.current = data
  })

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

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

  const setDefaultsFunction = useCallback(
    (fieldOrFields?: FormDataKeys<TForm> | Partial<TForm>, maybeValue?: unknown) => {
      if (isDataFunction) {
        throw new Error('You cannot call `defaults()` when using a function to define your form data.')
      }

      defaultsCalledInOnSuccessRef.current = true

      let newDefaults = {} as TForm

      if (typeof fieldOrFields === 'undefined') {
        newDefaults = { ...dataRef.current }
        setDefaultsState(dataRef.current)
      } else {
        setDefaultsState((defaults) => {
          newDefaults =
            typeof fieldOrFields === 'string'
              ? set(cloneDeep(defaults), fieldOrFields, maybeValue)
              : Object.assign(cloneDeep(defaults), fieldOrFields)

          return newDefaults as TForm
        })
      }

      validatorRef.current?.defaults(newDefaults as Record<string, unknown>)
    },
    [setDefaultsState],
  )

  const reset = useCallback(
    (...fields: string[]) => {
      const resolvedData = isDataFunction ? cloneDeep(resolveData()) : defaults
      const clonedData = cloneDeep(resolvedData)

      if (fields.length === 0) {
        if (isDataFunction) {
          setDefaultsState(clonedData)
        }
        setData(clonedData)
      } else {
        if (isDataFunction) {
          setDefaultsState((currentDefaults) => {
            const newDefaults = cloneDeep(currentDefaults)
            ;(fields as Array<FormDataKeys<TForm>>)
              .filter((key) => has(clonedData, key))
              .forEach((key) => {
                set(newDefaults, key, get(clonedData, key))
              })
            return newDefaults
          })
        }

        setData((data) =>
          (fields as Array<FormDataKeys<TForm>>)
            .filter((key) => has(clonedData, key))
            .reduce(
              (carry, key) => {
                return set(carry, key, get(clonedData, key))
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

  const markAsSuccessful = useCallback(() => {
    clearErrors()
    setWasSuccessful(true)
    setRecentlySuccessful(true)

    recentlySuccessfulTimeoutId.current = window.setTimeout(() => {
      if (isMounted.current) {
        setRecentlySuccessful(false)
      }
    }, config.get('form.recentlySuccessfulDuration'))
  }, [clearErrors, setWasSuccessful, setRecentlySuccessful])

  const resetBeforeSubmit = useCallback(() => {
    setWasSuccessful(false)
    setRecentlySuccessful(false)
    clearTimeout(recentlySuccessfulTimeoutId.current)
  }, [setWasSuccessful, setRecentlySuccessful])

  const finishProcessing = useCallback(() => {
    setProcessing(false)
    setProgress(null)
  }, [setProcessing, setProgress])

  const transformFunction = useCallback((callback: UseFormTransformCallback<TForm>) => {
    transformRef.current = callback
  }, [])

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
  } as FormState<TForm>

  const validate = (field?: string | NamedInputEvent | ValidationConfig, config?: ValidationConfig) => {
    if (typeof field === 'object' && !('target' in field)) {
      config = field
      field = undefined
    }

    if (field === undefined) {
      validatorRef.current!.validate(config)
    } else {
      const fieldName = resolveName(field)
      const transformedData = transformRef.current(dataRef.current) as Record<string, unknown>
      validatorRef.current!.validate(fieldName, get(transformedData, fieldName), config)
    }

    return form
  }

  const withPrecognition = (...args: UseFormWithPrecognitionArguments): FormStateWithPrecognition<TForm> => {
    precognitionEndpointRef.current = UseFormUtils.createWayfinderCallback(...args)

    if (!validatorRef.current) {
      const validator = createValidator(
        (client) => {
          const { method, url } = precognitionEndpointRef.current!()
          const currentData = dataRef.current
          const transformedData = transformRef.current(currentData) as Record<string, unknown>
          return client[method](url, transformedData)
        },
        cloneDeep(defaults as Record<string, unknown>),
      )

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
          const validationErrors =
            (withAllErrorsRef.current ?? config.get('form.withAllErrors'))
              ? validator.errors()
              : toSimpleValidationErrors(validator.errors())

          setErrors(validationErrors as FormDataErrors<TForm>)
          setHasErrors(Object.keys(validationErrors).length > 0)
          setValidFields(validator.valid())
        })
    }

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
      withAllErrors: () => tap(precognitiveForm, () => (withAllErrorsRef.current = true)),
      setValidationTimeout: (duration: number) =>
        tap(precognitiveForm, () => validatorRef.current?.setTimeout(duration)),
      validateFiles: () => tap(precognitiveForm, () => validatorRef.current?.validateFiles()),
      validate,
      setErrors: (errors: FormDataErrors<TForm>) => tap(precognitiveForm, () => form.setError(errors)),
      forgetError: (field: FormDataKeys<TForm> | NamedInputEvent) =>
        tap(precognitiveForm, () =>
          form.clearErrors(resolveName(field as string | NamedInputEvent) as FormDataKeys<TForm>),
        ),
    }) as FormStateWithPrecognition<TForm>

    return precognitiveForm
  }

  form.withPrecognition = withPrecognition

  if (precognitionEndpointRef.current) {
    form.withPrecognition(precognitionEndpointRef.current)
  }

  return {
    form,
    setDefaultsState,
    transformRef,
    precognitionEndpointRef,
    dataRef,
    isMounted,
    setProcessing,
    setProgress,
    markAsSuccessful,
    clearErrors,
    setError,
    defaultsCalledInOnSuccessRef,
    resetBeforeSubmit,
    finishProcessing,
  }
}
