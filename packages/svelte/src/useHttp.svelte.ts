import type {
  CancelToken,
  Errors,
  ErrorValue,
  FormDataConvertible,
  FormDataErrors,
  FormDataKeys,
  FormDataType,
  FormDataValues,
  HttpProgressEvent,
  Method,
  Progress,
  UrlMethodPair,
  UseFormArguments,
  UseFormTransformCallback,
  UseFormWithPrecognitionArguments,
  UseHttpSubmitOptions,
} from '@inertiajs/core'
import {
  getHttpClient,
  HttpCancelledError,
  HttpResponseError,
  mergeDataIntoQueryString,
  objectToFormData,
  UseFormUtils,
} from '@inertiajs/core'
import type { NamedInputEvent, ValidationConfig, Validator } from 'laravel-precognition'
import { cloneDeep } from 'lodash-es'
import useFormState, { type FormStateWithPrecognition, type InternalPrecognitionState } from './useFormState.svelte'

export interface UseHttpProps<TForm extends object, TResponse = unknown> {
  isDirty: boolean
  errors: FormDataErrors<TForm>
  hasErrors: boolean
  progress: Progress | null
  wasSuccessful: boolean
  recentlySuccessful: boolean
  processing: boolean
  response: TResponse | null
  setStore(data: TForm): void
  setStore<T extends FormDataKeys<TForm>>(key: T, value: FormDataValues<TForm, T>): void
  data(): TForm
  transform(callback: UseFormTransformCallback<TForm>): this
  defaults(): this
  defaults(fields: Partial<TForm>): this
  defaults<T extends FormDataKeys<TForm>>(field: T, value: FormDataValues<TForm, T>): this
  reset<K extends FormDataKeys<TForm>>(...fields: K[]): this
  clearErrors<K extends FormDataKeys<TForm>>(...fields: K[]): this
  resetAndClearErrors<K extends FormDataKeys<TForm>>(...fields: K[]): this
  setError<K extends FormDataKeys<TForm>>(field: K, value: ErrorValue): this
  setError(errors: FormDataErrors<TForm>): this
  get(url: string, options?: UseHttpSubmitOptions<TResponse>): Promise<TResponse>
  post(url: string, options?: UseHttpSubmitOptions<TResponse>): Promise<TResponse>
  put(url: string, options?: UseHttpSubmitOptions<TResponse>): Promise<TResponse>
  patch(url: string, options?: UseHttpSubmitOptions<TResponse>): Promise<TResponse>
  delete(url: string, options?: UseHttpSubmitOptions<TResponse>): Promise<TResponse>
  cancel(): void
  dontRemember<K extends FormDataKeys<TForm>>(...fields: K[]): this
  withPrecognition: (...args: UseFormWithPrecognitionArguments) => UseHttpPrecognitiveProps<TForm, TResponse>
}

type PrecognitionValidationConfig<TKeys> = ValidationConfig & {
  only?: TKeys[] | Iterable<TKeys> | ArrayLike<TKeys>
}

export interface UseHttpValidationProps<TForm extends object> {
  invalid<K extends FormDataKeys<TForm>>(field: K): boolean
  setValidationTimeout(duration: number): this
  touch<K extends FormDataKeys<TForm>>(field: K | NamedInputEvent | Array<K>, ...fields: K[]): this
  touched<K extends FormDataKeys<TForm>>(field?: K): boolean
  valid<K extends FormDataKeys<TForm>>(field: K): boolean
  validate<K extends FormDataKeys<TForm>>(
    field?: K | NamedInputEvent | PrecognitionValidationConfig<K>,
    config?: PrecognitionValidationConfig<K>,
  ): this
  validateFiles(): this
  validating: boolean
  validator: () => Validator
  withAllErrors(): this
  withoutFileValidation(): this
  setErrors(errors: FormDataErrors<TForm> | Record<string, string | string[]>): this
  forgetError<K extends FormDataKeys<TForm> | NamedInputEvent>(field: K): this
}

export type UseHttp<TForm extends object, TResponse = unknown> = UseHttpProps<TForm, TResponse> & TForm
export type UseHttpPrecognitiveProps<TForm extends object, TResponse = unknown> = UseHttp<TForm, TResponse> &
  UseHttpValidationProps<TForm>

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

  let abortController: AbortController | null = null

  const {
    form: baseForm,
    setDefaults,
    getTransform,
    getPrecognitionEndpoint,
    setFormState,
    markAsSuccessful,
    wasDefaultsCalledInOnSuccess,
    resetDefaultsCalledInOnSuccess,
    setRememberExcludeKeys,
    resetBeforeSubmit,
    finishProcessing,
  } = useFormState<TForm>({
    data,
    rememberKey,
    precognitionEndpoint,
  })

  // Access baseForm as the full type with precognition
  const formWithPrecognition = () => baseForm as any as FormStateWithPrecognition<TForm> & InternalPrecognitionState

  // Add response property to form
  setFormState('response', null)

  const submit = async (method: Method, url: string, options: UseHttpSubmitOptions<TResponse>): Promise<TResponse> => {
    const onBefore = options.onBefore?.()

    if (onBefore === false) {
      return Promise.reject(new Error('Request cancelled by onBefore'))
    }

    resetDefaultsCalledInOnSuccess()
    resetBeforeSubmit()

    abortController = new AbortController()

    const cancelToken: CancelToken = {
      cancel: () => abortController?.abort(),
    }

    options.onCancelToken?.(cancelToken)

    setFormState('processing', true)
    options.onStart?.()

    const transformedData = getTransform()(form.data())
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
      const response = await httpClient.request({
        method,
        url: requestUrl,
        data: requestData,
        headers: {
          Accept: 'application/json',
          ...(contentType ? { 'Content-Type': contentType } : {}),
          ...options.headers,
        },
        signal: abortController.signal,
        onUploadProgress: (event: HttpProgressEvent) => {
          setFormState('progress', event)
          options.onProgress?.(event)
        },
      })

      const responseData = JSON.parse(response.data) as TResponse

      if (response.status >= 200 && response.status < 300) {
        markAsSuccessful()
        setFormState('response', responseData)

        options.onSuccess?.(responseData)

        if (!wasDefaultsCalledInOnSuccess()) {
          setDefaults(cloneDeep(form.data()))
        }

        setFormState('isDirty', false)

        return responseData
      }

      throw new HttpResponseError(`Request failed with status ${response.status}`, response)
    } catch (error: unknown) {
      if (error instanceof HttpResponseError) {
        if (error.response.status === 422) {
          const responseData = JSON.parse(error.response.data)
          const validationErrors = responseData.errors || {}
          const flatErrors: FormDataErrors<TForm> = {} as FormDataErrors<TForm>

          for (const [key, value] of Object.entries(validationErrors)) {
            ;(flatErrors as Record<string, string>)[key] = Array.isArray(value) ? value[0] : (value as string)
          }

          form.clearErrors().setError(flatErrors)
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
      finishProcessing()
      abortController = null
      options.onFinish?.()
    }
  }

  const cancel = () => {
    abortController?.abort()
  }

  const createSubmitMethod =
    (method: Method) =>
    async (url: string, options: UseHttpSubmitOptions<TResponse> = {}): Promise<TResponse> => {
      return submit(method, url, options)
    }

  // Add useHttp-specific methods to the form object
  Object.assign(baseForm, {
    get: createSubmitMethod('get'),
    post: createSubmitMethod('post'),
    put: createSubmitMethod('put'),
    patch: createSubmitMethod('patch'),
    delete: createSubmitMethod('delete'),
    cancel,
    dontRemember(...keys: FormDataKeys<TForm>[]) {
      setRememberExcludeKeys(keys)
      return form
    },
  })

  // Cast to the full form type
  const form = baseForm as any as UseHttp<TForm, TResponse>

  // Wrap withPrecognition to return the correct type
  const originalWithPrecognition = formWithPrecognition().withPrecognition
  form.withPrecognition = (...args: UseFormWithPrecognitionArguments): UseHttpPrecognitiveProps<TForm, TResponse> => {
    originalWithPrecognition(...args)
    return form as any as UseHttpPrecognitiveProps<TForm, TResponse>
  }

  return getPrecognitionEndpoint()
    ? (form as unknown as UseHttpPrecognitiveProps<TForm, TResponse>)
    : (form as unknown as UseHttp<TForm, TResponse>)
}
