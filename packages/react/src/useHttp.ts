import {
  CancelToken,
  Errors,
  ErrorValue,
  FormDataConvertible,
  FormDataErrors,
  FormDataKeys,
  FormDataType,
  FormDataValues,
  getHttpClient,
  HttpCancelledError,
  HttpProgressEvent,
  HttpResponseError,
  mergeDataIntoQueryString,
  Method,
  objectToFormData,
  Progress,
  UrlMethodPair,
  UseFormArguments,
  UseFormTransformCallback,
  UseFormUtils,
  UseFormWithPrecognitionArguments,
  UseHttpSubmitOptions,
} from '@inertiajs/core'
import { NamedInputEvent, ValidationConfig, Validator } from 'laravel-precognition'
import { cloneDeep } from 'lodash-es'
import { useCallback, useRef, useState } from 'react'
import useFormState, { SetDataAction } from './useFormState'
import useRemember from './useRemember'

type PrecognitionValidationConfig<TKeys> = ValidationConfig & {
  only?: TKeys[] | Iterable<TKeys> | ArrayLike<TKeys>
}

export interface UseHttpProps<TForm extends object, TResponse = unknown> {
  data: TForm
  isDirty: boolean
  errors: FormDataErrors<TForm>
  hasErrors: boolean
  processing: boolean
  progress: Progress | null
  wasSuccessful: boolean
  recentlySuccessful: boolean
  response: TResponse | null
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
  get: (url: string, options?: UseHttpSubmitOptions<TResponse>) => Promise<TResponse>
  post: (url: string, options?: UseHttpSubmitOptions<TResponse>) => Promise<TResponse>
  put: (url: string, options?: UseHttpSubmitOptions<TResponse>) => Promise<TResponse>
  patch: (url: string, options?: UseHttpSubmitOptions<TResponse>) => Promise<TResponse>
  delete: (url: string, options?: UseHttpSubmitOptions<TResponse>) => Promise<TResponse>
  cancel: () => void
  dontRemember: <K extends FormDataKeys<TForm>>(...fields: K[]) => UseHttpProps<TForm, TResponse>
  withPrecognition: (...args: UseFormWithPrecognitionArguments) => UseHttpPrecognitiveProps<TForm, TResponse>
}

export interface UseHttpValidationProps<TForm extends object, TResponse = unknown> {
  invalid: <K extends FormDataKeys<TForm>>(field: K) => boolean
  setValidationTimeout: (duration: number) => UseHttpPrecognitiveProps<TForm, TResponse>
  touch: <K extends FormDataKeys<TForm>>(
    field: K | NamedInputEvent | Array<K>,
    ...fields: K[]
  ) => UseHttpPrecognitiveProps<TForm, TResponse>
  touched: <K extends FormDataKeys<TForm>>(field?: K) => boolean
  valid: <K extends FormDataKeys<TForm>>(field: K) => boolean
  validate: <K extends FormDataKeys<TForm>>(
    field?: K | NamedInputEvent | PrecognitionValidationConfig<K>,
    config?: PrecognitionValidationConfig<K>,
  ) => UseHttpPrecognitiveProps<TForm, TResponse>
  validateFiles: () => UseHttpPrecognitiveProps<TForm, TResponse>
  validating: boolean
  validator: () => Validator
  withAllErrors: () => UseHttpPrecognitiveProps<TForm, TResponse>
  withoutFileValidation: () => UseHttpPrecognitiveProps<TForm, TResponse>
  setErrors: (errors: FormDataErrors<TForm>) => UseHttpPrecognitiveProps<TForm, TResponse>
  forgetError: <K extends FormDataKeys<TForm> | NamedInputEvent>(field: K) => UseHttpPrecognitiveProps<TForm, TResponse>
}

export type UseHttp<TForm extends object, TResponse = unknown> = UseHttpProps<TForm, TResponse>
export type UseHttpPrecognitiveProps<TForm extends object, TResponse = unknown> = UseHttpProps<TForm, TResponse> &
  UseHttpValidationProps<TForm, TResponse>

function hasFiles(data: object): boolean {
  for (const value of Object.values(data)) {
    if (value instanceof File) {
      return true
    }

    if (typeof value === 'object' && value !== null && hasFiles(value)) {
      return true
    }
  }

  return false
}

export default function useHttp<TForm extends FormDataType<TForm>, TResponse = unknown>(
  method: Method | (() => Method),
  url: string | (() => string),
  data: TForm | (() => TForm),
): UseHttpPrecognitiveProps<TForm, TResponse>
export default function useHttp<TForm extends FormDataType<TForm>, TResponse = unknown>(
  urlMethodPair: UrlMethodPair | (() => UrlMethodPair),
  data: TForm | (() => TForm),
): UseHttpPrecognitiveProps<TForm, TResponse>
export default function useHttp<TForm extends FormDataType<TForm>, TResponse = unknown>(
  rememberKey: string,
  data: TForm | (() => TForm),
): UseHttp<TForm, TResponse>
export default function useHttp<TForm extends FormDataType<TForm>, TResponse = unknown>(
  data: TForm | (() => TForm),
): UseHttp<TForm, TResponse>
export default function useHttp<TForm extends FormDataType<TForm>, TResponse = unknown>(): UseHttp<TForm, TResponse>
export default function useHttp<TForm extends FormDataType<TForm>, TResponse = unknown>(
  ...args: UseFormArguments<TForm>
): UseHttp<TForm, TResponse> | UseHttpPrecognitiveProps<TForm, TResponse> {
  const { rememberKey, data, precognitionEndpoint } = UseFormUtils.parseUseFormArguments<TForm>(...args)

  // Resolve initial data for remember functionality hooks
  const initialDefaults = typeof data === 'function' ? cloneDeep(data()) : cloneDeep(data)

  const abortController = useRef<AbortController | null>(null)
  const excludeKeysRef = useRef<FormDataKeys<TForm>[]>([])
  const [response, setResponse] = useState<TResponse | null>(null)

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
    dataRef,
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

  const submit = useCallback(
    async (method: Method, url: string, options: UseHttpSubmitOptions<TResponse>): Promise<TResponse> => {
      const onBefore = options.onBefore?.()

      if (onBefore === false) {
        return Promise.reject(new Error('Request cancelled by onBefore'))
      }

      defaultsCalledInOnSuccessRef.current = false

      if (isMounted.current) {
        resetBeforeSubmit()
      }

      abortController.current = new AbortController()

      const cancelToken: CancelToken = {
        cancel: () => abortController.current?.abort(),
      }

      options.onCancelToken?.(cancelToken)

      if (isMounted.current) {
        setProcessing(true)
      }

      options.onStart?.()

      const transformedData = transformRef.current(dataRef.current)
      const useFormData = hasFiles(transformedData)

      let requestUrl = url
      let requestData: FormData | string | undefined
      let contentType: string | undefined

      if (method === 'get') {
        const [urlWithParams] = mergeDataIntoQueryString(
          method,
          url,
          transformedData as Record<string, FormDataConvertible>,
        )
        requestUrl = urlWithParams
      } else {
        if (useFormData) {
          requestData = objectToFormData(transformedData as Record<string, FormDataConvertible>)
        } else {
          requestData = JSON.stringify(transformedData)
          contentType = 'application/json'
        }
      }

      const httpClient = getHttpClient()

      try {
        const httpResponse = await httpClient.request({
          method,
          url: requestUrl,
          data: requestData,
          headers: {
            Accept: 'application/json',
            ...(contentType ? { 'Content-Type': contentType } : {}),
            ...options.headers,
          },
          signal: abortController.current.signal,
          onUploadProgress: (event: HttpProgressEvent) => {
            if (isMounted.current) {
              setProgress(event)
            }

            options.onProgress?.(event)
          },
        })

        const responseData = JSON.parse(httpResponse.data) as TResponse

        if (httpResponse.status >= 200 && httpResponse.status < 300) {
          if (isMounted.current) {
            markAsSuccessful()
            setResponse(responseData)
          }

          options.onSuccess?.(responseData)

          if (isMounted.current && !defaultsCalledInOnSuccessRef.current) {
            baseForm.setData((data: TForm) => {
              setDefaultsState(cloneDeep(data))
              return data
            })
          }

          return responseData
        }

        throw new HttpResponseError(`Request failed with status ${httpResponse.status}`, httpResponse)
      } catch (error: unknown) {
        if (error instanceof HttpResponseError) {
          if (error.response.status === 422) {
            const responseData = JSON.parse(error.response.data)
            const validationErrors = responseData.errors || {}
            const flatErrors: FormDataErrors<TForm> = {} as FormDataErrors<TForm>

            for (const [key, value] of Object.entries(validationErrors)) {
              ;(flatErrors as Record<string, string>)[key] = Array.isArray(value) ? value[0] : (value as string)
            }

            if (isMounted.current) {
              clearErrors()
              setError(flatErrors)
            }

            options.onError?.(flatErrors as Errors)
          }

          throw error
        }

        if (error instanceof Error && error.name === 'AbortError') {
          options.onCancel?.()
          throw new HttpCancelledError()
        }

        throw error
      } finally {
        if (isMounted.current) {
          finishProcessing()
        }

        abortController.current = null
        options.onFinish?.()
      }
    },
    [clearErrors, setError],
  )

  const cancel = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort()
    }
  }, [])

  const createSubmitMethod =
    (method: Method) =>
    async (url: string, options: UseHttpSubmitOptions<TResponse> = {}): Promise<TResponse> => {
      return submit(method, url, options)
    }

  // Add useHttp-specific methods to the form object (mutate in place like Svelte)
  Object.assign(baseForm, {
    response,
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

  // Cast to the full form type (baseForm now has HTTP methods)
  const form = baseForm as unknown as UseHttpProps<TForm, TResponse>

  // Wrap withPrecognition to return the correct type with HTTP methods
  const originalWithPrecognition = baseForm.withPrecognition
  form.withPrecognition = (...args: UseFormWithPrecognitionArguments): UseHttpPrecognitiveProps<TForm, TResponse> => {
    originalWithPrecognition(...args)
    return form as UseHttpPrecognitiveProps<TForm, TResponse>
  }

  return precognitionEndpointRef.current ? (form as UseHttpPrecognitiveProps<TForm, TResponse>) : form
}
