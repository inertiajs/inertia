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
  hasFiles,
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
import useFormState from './useFormState'

export interface UseHttpProps<TForm extends object, TResponse = unknown> {
  isDirty: boolean
  errors: FormDataErrors<TForm>
  hasErrors: boolean
  processing: boolean
  progress: Progress | null
  wasSuccessful: boolean
  recentlySuccessful: boolean
  response: TResponse | null
  data(): TForm
  transform(callback: UseFormTransformCallback<TForm>): this
  defaults(): this
  defaults<T extends FormDataKeys<TForm>>(field: T, value: FormDataValues<TForm, T>): this
  defaults(fields: Partial<TForm>): this
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
  withPrecognition(...args: UseFormWithPrecognitionArguments): UseHttpPrecognitiveProps<TForm, TResponse>
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

interface InternalPrecognitionState {
  __touched: string[]
  __valid: string[]
}

export type UseHttp<TForm extends object, TResponse = unknown> = TForm & UseHttpProps<TForm, TResponse>
export type UseHttpPrecognitiveProps<TForm extends object, TResponse = unknown> = UseHttp<TForm, TResponse> &
  UseHttpValidationProps<TForm> &
  InternalPrecognitionState

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
    markAsSuccessful,
    wasDefaultsCalledInOnSuccess,
    resetDefaultsCalledInOnSuccess,
    setRememberExcludeKeys,
    resetBeforeSubmit,
    finishProcessing,
  } = useFormState({
    data,
    rememberKey,
    precognitionEndpoint,
  })

  // Cast needed: baseForm has all form state/methods, we're adding HTTP methods below via Object.assign
  const form = baseForm as unknown as UseHttp<TForm, TResponse>

  // Add response property
  ;(form as any).response = null as TResponse | null

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

    form.processing = true
    options.onStart?.()

    const transform = getTransform()
    const transformedData = transform(form.data())
    const useFormData = hasFiles(transformedData as Record<string, FormDataConvertible>)

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
          form.progress = event
          options.onProgress?.(event)
        },
      })

      const responseData = JSON.parse(response.data) as TResponse

      if (response.status >= 200 && response.status < 300) {
        markAsSuccessful()
        ;(form as any).response = responseData

        options.onSuccess?.(responseData)

        if (!wasDefaultsCalledInOnSuccess()) {
          setDefaults(cloneDeep(form.data()))
        }

        form.isDirty = false

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

  const createSubmitMethod =
    (method: Method) =>
    async (url: string, options: UseHttpSubmitOptions<TResponse> = {}): Promise<TResponse> => {
      return submit(method, url, options)
    }

  Object.assign(form, {
    get: createSubmitMethod('get'),
    post: createSubmitMethod('post'),
    put: createSubmitMethod('put'),
    patch: createSubmitMethod('patch'),
    delete: createSubmitMethod('delete'),

    cancel() {
      if (abortController) {
        abortController.abort()
      }
    },

    dontRemember(...keys: FormDataKeys<TForm>[]) {
      setRememberExcludeKeys(keys)
      return form
    },
  })

  return getPrecognitionEndpoint() ? (form as UseHttpPrecognitiveProps<TForm, TResponse>) : form
}
