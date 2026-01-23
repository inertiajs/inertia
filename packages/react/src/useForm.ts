import {
  CancelToken,
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
import { NamedInputEvent, ValidationConfig, Validator } from 'laravel-precognition'
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
    <K extends FormDataKeys<TForm>>(field: K, value: string): void
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
  const parsedArgs = UseFormUtils.parseUseFormArguments<TForm>(...args)
  const { rememberKey, data } = parsedArgs

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
    recentlySuccessfulTimeoutId,
    isMounted,
    setProcessing,
    setProgress,
    setWasSuccessful,
    setRecentlySuccessful,
    markAsSuccessful,
    setError,
    defaultsCalledInOnSuccessRef,
  } = useFormState<TForm>({
    data,
    precognitionEndpoint: parsedArgs.precognitionEndpoint,
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
          setWasSuccessful(false)
          setRecentlySuccessful(false)
          clearTimeout(recentlySuccessfulTimeoutId.current)

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
            setError(errors as FormDataErrors<TForm>)
          }

          return options.onError?.(errors)
        },
        onCancel: () => {
          return options.onCancel?.()
        },
        onFinish: (visit) => {
          if (isMounted.current) {
            setProcessing(false)
            setProgress(null)
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
    [baseForm.data, setError, transformRef],
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

  return precognitionEndpointRef.current
    ? (form as InertiaPrecognitiveFormProps<TForm>)
    : (form as InertiaFormProps<TForm>)
}
