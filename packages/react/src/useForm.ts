import {
  CancelToken,
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
import type { NamedInputEvent, PrecognitionPath, ValidationConfig, Validator } from 'laravel-precognition'
import { cloneDeep } from 'lodash-es'
import { useCallback, useRef, useState } from 'react'
import { useIsomorphicLayoutEffect } from './react'
import useFormState, { SetDataAction, SetDataByKeyValuePair, SetDataByMethod, SetDataByObject } from './useFormState'
import useRemember from './useRemember'

// Re-export types that were moved to useFormState
export { SetDataAction, SetDataByKeyValuePair, SetDataByMethod, SetDataByObject }

type PrecognitionValidationConfig<TKeys> = ValidationConfig & {
  only?: TKeys[] | Iterable<TKeys> | ArrayLike<TKeys>
}

export interface InertiaFormProps<TForm extends Record<string, any>> {
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
  post: (url: string, options?: UseFormSubmitOptions) => void
  put: (url: string, options?: UseFormSubmitOptions) => void
  patch: (url: string, options?: UseFormSubmitOptions) => void
  delete: (url: string, options?: UseFormSubmitOptions) => void
  cancel: () => void
  dontRemember: <K extends FormDataKeys<TForm>>(...fields: K[]) => InertiaFormProps<TForm>
  withPrecognition: (...args: UseFormWithPrecognitionArguments) => InertiaPrecognitiveFormProps<TForm>
}

export interface InertiaFormValidationProps<TForm extends Record<string, any>> {
  invalid: <K extends FormDataKeys<TForm>>(field: K) => boolean
  setValidationTimeout: (duration: number) => InertiaPrecognitiveFormProps<TForm>
  touch: <K extends FormDataKeys<TForm>>(
    field: K | NamedInputEvent | Array<K>,
    ...fields: K[]
  ) => InertiaPrecognitiveFormProps<TForm>
  touched: <K extends FormDataKeys<TForm>>(field?: K) => boolean
  valid: <K extends FormDataKeys<TForm>>(field: K) => boolean
  validate: <K extends FormDataKeys<TForm> | PrecognitionPath<TForm>>(
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

export type InertiaForm<TForm extends Record<string, any>> = InertiaFormProps<TForm>
export type InertiaPrecognitiveFormProps<TForm extends Record<string, any>> = InertiaFormProps<TForm> &
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
  const { rememberKey, data, precognitionEndpoint } = UseFormUtils.parseUseFormArguments<TForm>(...args)

  // Resolve initial data for remember functionality hooks
  const initialDefaults = typeof data === 'function' ? cloneDeep(data()) : cloneDeep(data)

  const cancelToken = useRef<CancelToken | null>(null)
  const excludeKeysRef = useRef<FormDataKeys<TForm>[]>([])

  // For remember functionality, we need custom state hooks
  const useDataState = rememberKey
    ? () => useRemember<TForm>(initialDefaults, `${rememberKey}:data`, excludeKeysRef)
    : undefined

  const useErrorsState = rememberKey
    ? () => useRemember<FormDataErrors<TForm>>({} as FormDataErrors<TForm>, `${rememberKey}:errors`)
    : undefined

  const {
    form: baseForm,
    setDefaultsState,
    transformRef,
    precognitionEndpointRef,
    isMounted,
    setProcessing,
    setProgress,
    markAsSuccessful,
    clearErrors,
    setError,
    defaultsCalledInOnSuccessRef,
    resetBeforeSubmit,
    finishProcessing,
  } = useFormState<TForm>({
    data,
    precognitionEndpoint,
    useDataState,
    useErrorsState,
  })

  // Handle dataAsDefaults pattern for setDefaults synchronization
  // When setDefaults() is called without args immediately after setData(),
  // dataRef.current may be stale. This layout effect ensures the current
  // data state is used as defaults.
  const [dataAsDefaults, setDataAsDefaults] = useState(false)

  const originalSetDefaults = baseForm.setDefaults
  baseForm.setDefaults = useCallback(
    (fieldOrFields?: FormDataKeys<TForm> | Partial<TForm>, maybeValue?: unknown) => {
      if (typeof fieldOrFields === 'undefined') {
        setDataAsDefaults(true)
      }

      return originalSetDefaults(fieldOrFields as any, maybeValue as any)
    },
    [originalSetDefaults],
  ) as typeof baseForm.setDefaults

  useIsomorphicLayoutEffect(() => {
    if (!dataAsDefaults) {
      return
    }

    if (baseForm.isDirty) {
      setDefaultsState(baseForm.data)
    }

    setDataAsDefaults(false)
  }, [dataAsDefaults])

  const submit = useCallback(
    (...args: UseFormSubmitArguments) => {
      const { method, url, options } = UseFormUtils.parseSubmitArguments(args, precognitionEndpointRef.current)

      defaultsCalledInOnSuccessRef.current = false

      const _options: VisitOptions = {
        ...options,
        onCancelToken: (token) => {
          cancelToken.current = token

          return options.onCancelToken?.(token)
        },
        onBefore: (visit) => {
          resetBeforeSubmit()

          return options.onBefore?.(visit)
        },
        onStart: (visit) => {
          setProcessing(true)

          return options.onStart?.(visit)
        },
        onProgress: (event) => {
          setProgress(event || null)

          return options.onProgress?.(event)
        },
        onSuccess: async (page) => {
          if (isMounted.current) {
            markAsSuccessful()
          }

          const onSuccess = options.onSuccess ? await options.onSuccess(page) : null

          if (isMounted.current && !defaultsCalledInOnSuccessRef.current) {
            baseForm.setData((data: TForm) => {
              setDefaultsState(cloneDeep(data))
              return data
            })
          }

          return onSuccess
        },
        onError: (errors) => {
          if (isMounted.current) {
            clearErrors()
            setError(errors as FormDataErrors<TForm>)
          }

          return options.onError?.(errors)
        },
        onCancel: () => {
          return options.onCancel?.()
        },
        onFinish: (visit) => {
          if (isMounted.current) {
            finishProcessing()
          }

          cancelToken.current = null

          return options.onFinish?.(visit)
        },
      }

      const transformedData = transformRef.current(baseForm.data) as RequestPayload

      if (method === 'delete') {
        router.delete(url, { ..._options, data: transformedData })
      } else {
        router[method](url, transformedData, _options)
      }
    },
    [baseForm.data, clearErrors, setError, transformRef],
  )

  const cancel = useCallback(() => {
    if (cancelToken.current) {
      cancelToken.current.cancel()
    }
  }, [])

  const createSubmitMethod =
    (method: Method) =>
    (url: string, options: VisitOptions = {}) => {
      submit(method, url, options)
    }

  // Add useForm-specific methods to the form object (mutate in place like Svelte)
  Object.assign(baseForm, {
    submit,
    get: createSubmitMethod('get'),
    post: createSubmitMethod('post'),
    put: createSubmitMethod('put'),
    patch: createSubmitMethod('patch'),
    delete: createSubmitMethod('delete'),
    cancel,
    dontRemember: <K extends FormDataKeys<TForm>>(...keys: K[]) => {
      excludeKeysRef.current = keys
      return form
    },
  })

  // Cast to the full form type (baseForm now has submit methods)
  const form = baseForm as unknown as InertiaFormProps<TForm>

  // Wrap withPrecognition to return the correct type with submit methods
  const originalWithPrecognition = baseForm.withPrecognition
  form.withPrecognition = (...args: UseFormWithPrecognitionArguments): InertiaPrecognitiveFormProps<TForm> => {
    originalWithPrecognition(...args)
    return form as InertiaPrecognitiveFormProps<TForm>
  }

  return precognitionEndpointRef.current ? (form as InertiaPrecognitiveFormProps<TForm>) : form
}
