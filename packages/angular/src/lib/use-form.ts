import { DestroyRef, inject } from '@angular/core'
import {
  router,
  UseFormUtils,
  type CancelToken,
  type FormDataKeys,
  type FormDataType,
  type Method,
  type OptimisticCallback,
  type RequestPayload,
  type UseFormArguments,
  type UseFormSubmitArguments,
  type UseFormSubmitOptions,
  type UseFormWithPrecognitionArguments,
  type UrlMethodPair,
  type VisitOptions,
} from '@inertiajs/core'
import { cloneDeep } from 'es-toolkit'
import {
  createFormState,
  type FormState,
  type FormValidationState,
  type SetDataAction,
  type SetDataByKeyValuePair,
  type SetDataByMethod,
  type SetDataByObject,
} from './form-state'

export type { SetDataAction, SetDataByKeyValuePair, SetDataByMethod, SetDataByObject }

export interface InertiaFormProps<TForm extends object> extends FormState<TForm> {
  submit(...args: UseFormSubmitArguments): void
  get(url: string, options?: UseFormSubmitOptions): void
  post(url: string, options?: UseFormSubmitOptions): void
  put(url: string, options?: UseFormSubmitOptions): void
  patch(url: string, options?: UseFormSubmitOptions): void
  delete(url: string, options?: UseFormSubmitOptions): void
  cancel(): void
  dontRemember<K extends FormDataKeys<TForm>>(...fields: K[]): this
  optimistic<TProps>(callback: OptimisticCallback<TProps>): this
  withPrecognition(...args: UseFormWithPrecognitionArguments): InertiaPrecognitiveFormProps<TForm>
}

export type InertiaPrecognitiveFormProps<TForm extends object> = InertiaFormProps<TForm> & FormValidationState<TForm>
export type InertiaForm<TForm extends object> = InertiaFormProps<TForm>
export type InertiaPrecognitiveForm<TForm extends object> = InertiaPrecognitiveFormProps<TForm>

export function useForm<TForm extends FormDataType<TForm>>(
  method: Method | (() => Method),
  url: string | (() => string),
  data: TForm | (() => TForm),
): InertiaPrecognitiveFormProps<TForm>
export function useForm<TForm extends FormDataType<TForm>>(
  urlMethodPair: UrlMethodPair | (() => UrlMethodPair),
  data: TForm | (() => TForm),
): InertiaPrecognitiveFormProps<TForm>
export function useForm<TForm extends FormDataType<TForm>>(
  rememberKey: string,
  data: TForm | (() => TForm),
): InertiaFormProps<TForm>
export function useForm<TForm extends FormDataType<TForm>>(data: TForm | (() => TForm)): InertiaFormProps<TForm>
export function useForm<TForm extends FormDataType<TForm>>(): InertiaFormProps<TForm>
export function useForm<TForm extends FormDataType<TForm>>(
  ...args: UseFormArguments<TForm>
): InertiaFormProps<TForm> | InertiaPrecognitiveFormProps<TForm> {
  const destroyRef = inject(DestroyRef)
  const parsed = UseFormUtils.parseUseFormArguments<TForm>(...args)
  const state = createFormState<TForm>({
    data: parsed.data,
    rememberKey: parsed.rememberKey,
    precognitionEndpoint: parsed.precognitionEndpoint,
  })
  let cancelToken: CancelToken | null = null
  let responseReceived = false
  let pendingOptimistic: OptimisticCallback | null = null
  const form = state.form as InertiaFormProps<TForm>

  const submit = (...submitArguments: UseFormSubmitArguments) => {
    const { method, url, options } = UseFormUtils.parseSubmitArguments(submitArguments, state.getPrecognitionEndpoint())
    state.resetDefaultsFlag()
    const visitOptions: VisitOptions = {
      ...options,
      onCancelToken: (token) => {
        cancelToken = token
        return options.onCancelToken?.(token)
      },
      onBefore: (visit) => {
        responseReceived = false
        state.resetBeforeSubmit()
        return options.onBefore?.(visit)
      },
      onStart: (visit) => {
        state.setProcessing(true)
        return options.onStart?.(visit)
      },
      onProgress: (progress) => {
        state.setProgress(progress ?? null)
        return options.onProgress?.(progress)
      },
      onSuccess: async (page) => {
        responseReceived = true
        state.markAsSuccessful()
        const result = options.onSuccess ? await options.onSuccess(page) : undefined
        if (!state.defaultsWereSet()) state.replaceDefaults(form.data())
        return result
      },
      onError: (errors) => {
        responseReceived = true
        form.clearErrors()
        form.setError(errors as Parameters<InertiaFormProps<TForm>['setError']>[0])
        return options.onError?.(errors)
      },
      onCancel: () => options.onCancel?.(),
      onFinish: (visit) => {
        state.finishProcessing()
        cancelToken = null
        return options.onFinish?.(visit)
      },
    }
    const optimistic = visitOptions.optimistic ?? pendingOptimistic
    if (optimistic) visitOptions.optimistic = optimistic
    pendingOptimistic = null
    const transformed = state.getTransform()(cloneDeep(form.data())) as RequestPayload
    if (method === 'delete') router.delete(url, { ...visitOptions, data: transformed })
    else router[method](url, transformed, visitOptions)
  }

  Object.assign(form, {
    submit,
    get: (url: string, options: UseFormSubmitOptions = {}) => submit('get', url, options),
    post: (url: string, options: UseFormSubmitOptions = {}) => submit('post', url, options),
    put: (url: string, options: UseFormSubmitOptions = {}) => submit('put', url, options),
    patch: (url: string, options: UseFormSubmitOptions = {}) => submit('patch', url, options),
    delete: (url: string, options: UseFormSubmitOptions = {}) => submit('delete', url, options),
    cancel: () => cancelToken?.cancel(),
    dontRemember: (...keys: FormDataKeys<TForm>[]) => {
      state.setRememberExclusions(keys)
      return form
    },
    optimistic: <TProps>(callback: OptimisticCallback<TProps>) => {
      pendingOptimistic = callback as OptimisticCallback
      return form
    },
  } satisfies Partial<InertiaFormProps<TForm>>)

  const originalWithPrecognition = form.withPrecognition.bind(form)
  form.withPrecognition = (...precognitionArgs) => {
    originalWithPrecognition(...precognitionArgs)
    return form as InertiaPrecognitiveFormProps<TForm>
  }

  destroyRef.onDestroy(() => {
    if (!responseReceived) cancelToken?.cancel()
  })
  return state.getPrecognitionEndpoint() ? (form as InertiaPrecognitiveFormProps<TForm>) : form
}
