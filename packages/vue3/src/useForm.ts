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
import { NamedInputEvent, ValidationConfig, Validator } from 'laravel-precognition'
import { cloneDeep } from 'lodash-es'
import useFormState from './useFormState'

// Reserved keys validation - logs console.error at runtime when form data keys conflict with form properties
let reservedFormKeys: Set<string> | null = null
let bootstrapping = false

function validateFormDataKeys<TForm extends object>(data: TForm): void {
  if (bootstrapping) {
    return
  }

  if (reservedFormKeys === null) {
    bootstrapping = true
    reservedFormKeys = new Set(Object.keys(useForm({})))
    bootstrapping = false
  }

  const conflicts = Object.keys(data).filter((key) => reservedFormKeys!.has(key))
  if (conflicts.length > 0) {
    console.error(
      `[Inertia] useForm() data contains field(s) that conflict with form properties: ${conflicts.map((k) => `"${k}"`).join(', ')}. ` +
        `These fields will be overwritten by form methods/properties. Please rename these fields.`,
    )
  }
}

export interface InertiaFormProps<TForm extends object> {
  isDirty: boolean
  errors: FormDataErrors<TForm>
  hasErrors: boolean
  processing: boolean
  progress: Progress | null
  wasSuccessful: boolean
  recentlySuccessful: boolean
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
  submit: (...args: UseFormSubmitArguments) => void
  get(url: string, options?: UseFormSubmitOptions): void
  post(url: string, options?: UseFormSubmitOptions): void
  put(url: string, options?: UseFormSubmitOptions): void
  patch(url: string, options?: UseFormSubmitOptions): void
  delete(url: string, options?: UseFormSubmitOptions): void
  cancel(): void
  dontRemember<K extends FormDataKeys<TForm>>(...fields: K[]): this
  withPrecognition(...args: UseFormWithPrecognitionArguments): InertiaPrecognitiveForm<TForm>
}

type PrecognitionValidationConfig<TKeys> = ValidationConfig & {
  only?: TKeys[] | Iterable<TKeys> | ArrayLike<TKeys>
}

export interface InertiaFormValidationProps<TForm extends object> {
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
  // Backward compatibility for easy migration from the original Precognition libraries
  setErrors(errors: FormDataErrors<TForm> | Record<string, string | string[]>): this
  forgetError<K extends FormDataKeys<TForm> | NamedInputEvent>(field: K): this
}

interface InternalPrecognitionState {
  __touched: string[]
  __valid: string[]
}

export type InertiaForm<TForm extends object> = TForm & InertiaFormProps<TForm>
export type InertiaPrecognitiveForm<TForm extends object> = InertiaForm<TForm> &
  InertiaFormValidationProps<TForm> &
  InternalPrecognitionState

type ReservedFormKeys = keyof InertiaFormProps<any>

type ValidateFormData<T> = {
  [K in keyof T]: K extends ReservedFormKeys ? ['Error: This field name is reserved by useForm:', K] : T[K]
}

export default function useForm<TForm extends FormDataType<TForm>>(
  method: Method | (() => Method),
  url: string | (() => string),
  data: ValidateFormData<TForm> | (() => ValidateFormData<TForm>),
): InertiaPrecognitiveForm<TForm>
export default function useForm<TForm extends FormDataType<TForm>>(
  urlMethodPair: UrlMethodPair | (() => UrlMethodPair),
  data: ValidateFormData<TForm> | (() => ValidateFormData<TForm>),
): InertiaPrecognitiveForm<TForm>
export default function useForm<TForm extends FormDataType<TForm>>(
  rememberKey: string,
  data: ValidateFormData<TForm> | (() => ValidateFormData<TForm>),
): InertiaForm<TForm>
export default function useForm<TForm extends FormDataType<TForm>>(
  data: ValidateFormData<TForm> | (() => ValidateFormData<TForm>),
): InertiaForm<TForm>
export default function useForm<TForm extends FormDataType<TForm>>(): InertiaForm<TForm>
export default function useForm<TForm extends FormDataType<TForm>>(
  ...args: UseFormArguments<TForm>
): InertiaForm<TForm> | InertiaPrecognitiveForm<TForm> {
  const { rememberKey, data, precognitionEndpoint } = UseFormUtils.parseUseFormArguments<TForm>(...args)

  const initialDefaults = typeof data === 'function' ? cloneDeep(data()) : cloneDeep(data)
  validateFormDataKeys(initialDefaults)

  let cancelToken: CancelToken | null = null

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
  } = useFormState<TForm>({
    data,
    rememberKey,
    precognitionEndpoint,
  })

  // Add useForm-specific methods
  const form = baseForm as unknown as InertiaForm<TForm>

  const createSubmitMethod =
    (method: Method) =>
    (url: string, options: VisitOptions = {}) => {
      form.submit(method, url, options)
    }

  Object.assign(form, {
    submit(...args: UseFormSubmitArguments) {
      const { method, url, options } = UseFormUtils.parseSubmitArguments(args, getPrecognitionEndpoint())

      resetDefaultsCalledInOnSuccess()

      const _options: VisitOptions = {
        ...options,
        onCancelToken: (token) => {
          cancelToken = token

          return options.onCancelToken?.(token)
        },
        onBefore: (visit) => {
          resetBeforeSubmit()

          return options.onBefore?.(visit)
        },
        onStart: (visit) => {
          form.processing = true

          return options.onStart?.(visit)
        },
        onProgress: (event) => {
          form.progress = event ?? null

          return options.onProgress?.(event)
        },
        onSuccess: async (page) => {
          markAsSuccessful()

          const onSuccess = options.onSuccess ? await options.onSuccess(page) : null

          if (!wasDefaultsCalledInOnSuccess()) {
            setDefaults(cloneDeep(form.data()))
            form.isDirty = false
          }

          return onSuccess
        },
        onError: (errors) => {
          form.clearErrors().setError(errors as FormDataErrors<TForm>)

          return options.onError?.(errors)
        },
        onCancel: () => {
          return options.onCancel?.()
        },
        onFinish: (visit) => {
          finishProcessing()
          cancelToken = null

          return options.onFinish?.(visit)
        },
      }

      const transformedData = getTransform()(form.data()) as RequestPayload

      if (method === 'delete') {
        router.delete(url, { ..._options, data: transformedData })
      } else {
        router[method](url, transformedData, _options)
      }
    },

    get: createSubmitMethod('get'),
    post: createSubmitMethod('post'),
    put: createSubmitMethod('put'),
    patch: createSubmitMethod('patch'),
    delete: createSubmitMethod('delete'),

    cancel() {
      if (cancelToken) {
        cancelToken.cancel()
      }
    },

    dontRemember(...keys: FormDataKeys<TForm>[]) {
      setRememberExcludeKeys(keys)
      return form
    },
  })

  return getPrecognitionEndpoint()
    ? (form as unknown as InertiaPrecognitiveForm<TForm>)
    : (form as unknown as InertiaForm<TForm>)
}
