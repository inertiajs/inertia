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
  router,
  UrlMethodPair,
  UseFormArguments,
  UseFormTransformCallback,
  UseFormUtils,
  UseFormWithPrecognitionArguments,
  UseHttpSubmitOptions,
} from '@inertiajs/core'
import { NamedInputEvent, ValidationConfig, Validator } from 'laravel-precognition'
import { cloneDeep, isEqual } from 'lodash-es'
import { watch } from 'vue'
import { config } from '.'
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

interface InternalRememberState<TForm extends object> {
  __rememberable: boolean
  __remember(): { data: TForm; errors: FormDataErrors<TForm> }
  __restore(restored: { data: TForm; errors: FormDataErrors<TForm> }): void
}

export type UseHttp<TForm extends object, TResponse = unknown> = TForm & UseHttpProps<TForm, TResponse>
export type UseHttpPrecognitiveProps<TForm extends object, TResponse = unknown> = UseHttp<TForm, TResponse> &
  UseHttpValidationProps<TForm> &
  InternalPrecognitionState

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
  let rememberExcludeKeys: FormDataKeys<TForm>[] = []

  const {
    form: baseForm,
    setDefaults,
    getTransform,
    getPrecognitionEndpoint,
    setRecentlySuccessfulTimeoutId,
    clearRecentlySuccessfulTimeout,
    wasDefaultsCalledInOnSuccess,
    resetDefaultsCalledInOnSuccess,
  } = useFormState({
    data,
    rememberKey,
    precognitionEndpoint,
  })

  const form = baseForm as unknown as UseHttp<TForm, TResponse> & InternalRememberState<TForm>

  // Add response property
  ;(form as any).response = null as TResponse | null

  const submit = async (method: Method, url: string, options: UseHttpSubmitOptions<TResponse>): Promise<TResponse> => {
    const onBefore = options.onBefore?.()

    if (onBefore === false) {
      return Promise.reject(new Error('Request cancelled by onBefore'))
    }

    resetDefaultsCalledInOnSuccess()

    form.wasSuccessful = false
    form.recentlySuccessful = false
    clearRecentlySuccessfulTimeout()

    abortController = new AbortController()

    const cancelToken: CancelToken = {
      cancel: () => abortController?.abort(),
    }

    options.onCancelToken?.(cancelToken)

    form.processing = true
    options.onStart?.()

    const transform = getTransform()
    const transformedData = transform(form.data())
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
          form.progress = event
          options.onProgress?.(event)
        },
      })

      const responseData = JSON.parse(response.data) as TResponse

      if (response.status >= 200 && response.status < 300) {
        form.clearErrors()
        form.wasSuccessful = true
        form.recentlySuccessful = true
        ;(form as any).response = responseData

        setRecentlySuccessfulTimeoutId(
          setTimeout(() => (form.recentlySuccessful = false), config.get('form.recentlySuccessfulDuration')),
        )

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
      form.processing = false
      form.progress = null
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
      rememberExcludeKeys = keys
      return form
    },

    __rememberable: rememberKey === null,

    __remember() {
      const formData = form.data()
      if (rememberExcludeKeys.length > 0) {
        const filtered = { ...formData } as Record<string, unknown>
        rememberExcludeKeys.forEach((k) => delete filtered[k as string])
        return { data: filtered as TForm, errors: form.errors }
      }
      return { data: formData, errors: form.errors }
    },

    __restore(restored: { data: TForm; errors: FormDataErrors<TForm> }) {
      Object.assign(form, restored.data)
      form.setError(restored.errors)
    },
  })

  // Watch for remember functionality
  watch(
    form,
    (newValue) => {
      const storedData = router.restore(rememberKey!)
      const newData = cloneDeep(newValue.__remember())

      if (rememberKey && !isEqual(storedData, newData)) {
        router.remember(newData, rememberKey)
      }
    },
    { immediate: true, deep: true },
  )

  return getPrecognitionEndpoint()
    ? (form as unknown as UseHttpPrecognitiveProps<TForm, TResponse>)
    : (form as unknown as UseHttp<TForm, TResponse>)
}
