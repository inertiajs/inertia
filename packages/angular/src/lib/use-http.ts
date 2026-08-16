import { DestroyRef, inject, signal, type Signal } from '@angular/core'
import {
  hasFiles,
  http,
  HttpCancelledError,
  HttpResponseError,
  mergeDataIntoQueryString,
  objectToFormData,
  UseFormUtils,
  type CancelToken,
  type Errors,
  type FormDataConvertible,
  type FormDataErrors,
  type FormDataKeys,
  type FormDataType,
  type HttpProgressEvent,
  type Method,
  type UrlMethodPair,
  type UseFormArguments,
  type UseFormSubmitArguments,
  type UseFormWithPrecognitionArguments,
  type UseHttpSubmitArguments,
  type UseHttpSubmitOptions,
} from '@inertiajs/core'
import { cloneDeep } from 'es-toolkit'
import { toSimpleValidationErrors } from 'laravel-precognition'
import { createFormState, type FormState, type FormValidationState } from './form-state'

export interface UseHttpProps<TForm extends object, TResponse = unknown> extends FormState<TForm> {
  response: Signal<TResponse | null>
  submit(...args: UseHttpSubmitArguments<TResponse, TForm>): Promise<TResponse>
  get(url: string, options?: UseHttpSubmitOptions<TResponse, TForm>): Promise<TResponse>
  post(url: string, options?: UseHttpSubmitOptions<TResponse, TForm>): Promise<TResponse>
  put(url: string, options?: UseHttpSubmitOptions<TResponse, TForm>): Promise<TResponse>
  patch(url: string, options?: UseHttpSubmitOptions<TResponse, TForm>): Promise<TResponse>
  delete(url: string, options?: UseHttpSubmitOptions<TResponse, TForm>): Promise<TResponse>
  cancel(): void
  dontRemember<K extends FormDataKeys<TForm>>(...fields: K[]): this
  optimistic(callback: (currentData: TForm) => Partial<TForm>): this
  withAllErrors(): this
  withPrecognition(...args: UseFormWithPrecognitionArguments): UseHttpPrecognitiveProps<TForm, TResponse>
}

export type UseHttpValidationProps<TForm extends object> = FormValidationState<TForm>
export type UseHttp<TForm extends object, TResponse = unknown> = UseHttpProps<TForm, TResponse>
export type UseHttpPrecognitiveProps<TForm extends object, TResponse = unknown> = UseHttpProps<TForm, TResponse> &
  UseHttpValidationProps<TForm>

export function useHttp<TForm extends FormDataType<TForm>, TResponse = unknown>(
  method: Method | (() => Method),
  url: string | (() => string),
  data: TForm | (() => TForm),
): UseHttpPrecognitiveProps<TForm, TResponse>
export function useHttp<TForm extends FormDataType<TForm>, TResponse = unknown>(
  urlMethodPair: UrlMethodPair | (() => UrlMethodPair),
  data: TForm | (() => TForm),
): UseHttpPrecognitiveProps<TForm, TResponse>
export function useHttp<TForm extends FormDataType<TForm>, TResponse = unknown>(
  rememberKey: string,
  data: TForm | (() => TForm),
): UseHttpProps<TForm, TResponse>
export function useHttp<TForm extends FormDataType<TForm>, TResponse = unknown>(
  data: TForm | (() => TForm),
): UseHttpProps<TForm, TResponse>
export function useHttp<TForm extends FormDataType<TForm>, TResponse = unknown>(): UseHttpProps<TForm, TResponse>
export function useHttp<TForm extends FormDataType<TForm>, TResponse = unknown>(
  ...args: UseFormArguments<TForm>
): UseHttpProps<TForm, TResponse> | UseHttpPrecognitiveProps<TForm, TResponse> {
  const destroyRef = inject(DestroyRef)
  const parsed = UseFormUtils.parseUseFormArguments<TForm>(...args)
  const state = createFormState<TForm>({
    data: parsed.data,
    rememberKey: parsed.rememberKey,
    precognitionEndpoint: parsed.precognitionEndpoint,
  })
  const response = signal<TResponse | null>(null)
  let abortController: AbortController | null = null
  let pendingOptimistic: ((currentData: TForm) => Partial<TForm>) | null = null
  const form = state.form as UseHttpProps<TForm, TResponse>

  const submit = async (
    method: Method,
    url: string,
    options: UseHttpSubmitOptions<TResponse, TForm> = {},
  ): Promise<TResponse> => {
    if (options.onBefore?.() === false) {
      throw new Error('Request cancelled by onBefore')
    }

    state.resetDefaultsFlag()
    state.resetBeforeSubmit()
    abortController = new AbortController()
    const cancelToken: CancelToken = { cancel: () => abortController?.abort() }
    options.onCancelToken?.(cancelToken)

    const optimistic = options.optimistic ?? pendingOptimistic ?? undefined
    pendingOptimistic = null
    let snapshot: TForm | undefined
    if (optimistic) {
      snapshot = cloneDeep(form.data())
      form.data.set({ ...snapshot, ...optimistic(cloneDeep(snapshot)) })
    }

    state.setProcessing(true)
    options.onStart?.()
    const transformed = state.getTransform()(cloneDeep(form.data())) as Record<string, FormDataConvertible>
    let requestUrl = url
    let requestData: FormData | string | undefined
    let contentType: string | undefined

    if (method === 'get') {
      ;[requestUrl] = mergeDataIntoQueryString(method, url, transformed)
    } else if (hasFiles(transformed)) {
      requestData = objectToFormData(transformed)
    } else {
      requestData = JSON.stringify(transformed)
      contentType = 'application/json'
    }

    try {
      const httpResponse = await http.getClient().request({
        method,
        url: requestUrl,
        ...(requestData !== undefined ? { data: requestData } : {}),
        headers: {
          Accept: 'application/json',
          ...(contentType ? { 'Content-Type': contentType } : {}),
          ...options.headers,
        },
        signal: abortController.signal,
        onUploadProgress: (event: HttpProgressEvent) => {
          state.setProgress(event)
          options.onProgress?.(event)
        },
      })
      const responseData = (httpResponse.data ? JSON.parse(httpResponse.data) : null) as TResponse
      if (httpResponse.status < 200 || httpResponse.status >= 300) {
        throw new HttpResponseError(`Request failed with status ${httpResponse.status}`, httpResponse, url)
      }

      state.markAsSuccessful()
      response.set(responseData)
      options.onSuccess?.(responseData, httpResponse)
      if (!state.defaultsWereSet()) state.replaceDefaults(form.data())
      return responseData
    } catch (error: unknown) {
      if (snapshot) form.data.set(snapshot)

      if (error instanceof HttpResponseError) {
        if (error.response.status === 422) {
          const payload = JSON.parse(error.response.data) as { errors?: Record<string, string | string[]> }
          const validationErrors = payload.errors ?? {}
          const nextErrors = (
            state.allErrorsEnabled()
              ? validationErrors
              : toSimpleValidationErrors(validationErrors as Parameters<typeof toSimpleValidationErrors>[0])
          ) as FormDataErrors<TForm>
          form.clearErrors()
          form.setError(nextErrors)
          options.onError?.(nextErrors as Errors)
          return undefined as TResponse
        }

        options.onHttpException?.(error.response)
        throw error
      }

      if (error instanceof HttpCancelledError || (error instanceof Error && error.name === 'AbortError')) {
        options.onCancel?.()
        throw new HttpCancelledError('Request was cancelled', url)
      }

      options.onNetworkError?.(error instanceof Error ? error : new Error('Unknown error'))
      throw error
    } finally {
      state.finishProcessing()
      abortController = null
      options.onFinish?.()
    }
  }

  const submitWithArgs = (...submitArgs: UseHttpSubmitArguments<TResponse, TForm>): Promise<TResponse> => {
    const result = UseFormUtils.parseSubmitArguments(
      submitArgs as unknown as UseFormSubmitArguments,
      state.getPrecognitionEndpoint(),
    )
    return submit(result.method, result.url, result.options as unknown as UseHttpSubmitOptions<TResponse, TForm>)
  }

  Object.assign(form, {
    response: response.asReadonly(),
    submit: submitWithArgs,
    get: (url: string, options: UseHttpSubmitOptions<TResponse, TForm> = {}) => submit('get', url, options),
    post: (url: string, options: UseHttpSubmitOptions<TResponse, TForm> = {}) => submit('post', url, options),
    put: (url: string, options: UseHttpSubmitOptions<TResponse, TForm> = {}) => submit('put', url, options),
    patch: (url: string, options: UseHttpSubmitOptions<TResponse, TForm> = {}) => submit('patch', url, options),
    delete: (url: string, options: UseHttpSubmitOptions<TResponse, TForm> = {}) => submit('delete', url, options),
    cancel: () => abortController?.abort(),
    dontRemember: (...keys: FormDataKeys<TForm>[]) => {
      state.setRememberExclusions(keys)
      return form
    },
    optimistic: (callback: (currentData: TForm) => Partial<TForm>) => {
      pendingOptimistic = callback
      return form
    },
    withAllErrors: () => {
      state.enableAllErrors()
      return form
    },
  } satisfies Partial<UseHttpProps<TForm, TResponse>>)

  const originalWithPrecognition = form.withPrecognition.bind(form)
  form.withPrecognition = (...precognitionArgs) => {
    originalWithPrecognition(...precognitionArgs)
    return form as UseHttpPrecognitiveProps<TForm, TResponse>
  }

  destroyRef.onDestroy(() => abortController?.abort())
  return state.getPrecognitionEndpoint() ? (form as UseHttpPrecognitiveProps<TForm, TResponse>) : form
}
