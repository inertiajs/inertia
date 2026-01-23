import type {
  ActiveVisit,
  CancelToken,
  Errors,
  ErrorValue,
  FormDataErrors,
  FormDataKeys,
  FormDataType,
  FormDataValues,
  HttpProgressEvent,
  Method,
  Page,
  PendingVisit,
  Progress,
  RequestPayload,
  UrlMethodPair,
  UseFormArguments,
  UseFormSubmitArguments,
  UseFormSubmitOptions,
  UseFormTransformCallback,
  UseFormWithPrecognitionArguments,
  VisitOptions,
} from '@inertiajs/core'
import { router, UseFormUtils } from '@inertiajs/core'
import type { NamedInputEvent, ValidationConfig, Validator } from 'laravel-precognition'
import { cloneDeep, isEqual } from 'lodash-es'
import useFormState, { type FormStateWithPrecognition, type InternalPrecognitionState } from './useFormState.svelte'

// Reserved keys validation - logs console.error at runtime when form data keys conflict with form properties
let reservedFormKeys: Set<string> | null = null
let bootstrapping = false

function validateFormDataKeys<TForm extends object>(data: TForm): void {
  if (bootstrapping) {
    return
  }

  if (reservedFormKeys === null) {
    bootstrapping = true
    const store = useForm({})
    // Get the store value to extract form property keys (not the Writable methods)
    reservedFormKeys = new Set(Object.keys(store))
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

type InertiaFormStore<TForm extends object> = InertiaForm<TForm>
type InertiaPrecognitiveFormStore<TForm extends object> = InertiaPrecognitiveForm<TForm>

type PrecognitionValidationConfig<TKeys> = ValidationConfig & {
  only?: TKeys[] | Iterable<TKeys> | ArrayLike<TKeys>
}

export interface InertiaFormProps<TForm extends object> {
  isDirty: boolean
  errors: FormDataErrors<TForm>
  hasErrors: boolean
  progress: Progress | null
  wasSuccessful: boolean
  recentlySuccessful: boolean
  processing: boolean
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
  submit: (...args: UseFormSubmitArguments) => void
  get(url: string, options?: UseFormSubmitOptions): void
  post(url: string, options?: UseFormSubmitOptions): void
  put(url: string, options?: UseFormSubmitOptions): void
  patch(url: string, options?: UseFormSubmitOptions): void
  delete(url: string, options?: UseFormSubmitOptions): void
  cancel(): void
  dontRemember<K extends FormDataKeys<TForm>>(...fields: K[]): this
  withPrecognition: (...args: UseFormWithPrecognitionArguments) => InertiaPrecognitiveFormStore<TForm>
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

export type InertiaForm<TForm extends object> = InertiaFormProps<TForm> & TForm
export type InertiaPrecognitiveForm<TForm extends object> = InertiaForm<TForm> & InertiaFormValidationProps<TForm>

type ReservedFormKeys = keyof InertiaFormProps<any>

type ValidateFormData<T> = {
  [K in keyof T]: K extends ReservedFormKeys ? ['Error: This field name is reserved by useForm:', K] : T[K]
}

export default function useForm<TForm extends FormDataType<TForm>>(
  method: Method | (() => Method),
  url: string | (() => string),
  data: ValidateFormData<TForm> | (() => ValidateFormData<TForm>),
): InertiaPrecognitiveFormStore<TForm>
export default function useForm<TForm extends FormDataType<TForm>>(
  urlMethodPair: UrlMethodPair | (() => UrlMethodPair),
  data: ValidateFormData<TForm> | (() => ValidateFormData<TForm>),
): InertiaPrecognitiveFormStore<TForm>
export default function useForm<TForm extends FormDataType<TForm>>(
  rememberKey: string,
  data: ValidateFormData<TForm> | (() => ValidateFormData<TForm>),
): InertiaFormStore<TForm>
export default function useForm<TForm extends FormDataType<TForm>>(
  data: ValidateFormData<TForm> | (() => ValidateFormData<TForm>),
): InertiaFormStore<TForm>
export default function useForm<TForm extends FormDataType<TForm>>(): InertiaFormStore<TForm>
export default function useForm<TForm extends FormDataType<TForm>>(
  ...args: UseFormArguments<TForm>
): InertiaFormStore<TForm> | InertiaPrecognitiveFormStore<TForm> {
  const parsedArgs = UseFormUtils.parseUseFormArguments<TForm>(...args)
  const { rememberKey, data, precognitionEndpoint } = parsedArgs

  // Resolve data for validation (useFormState handles the actual function data logic)
  const resolvedData: TForm = typeof data === 'function' ? data() : (data as TForm)
  validateFormDataKeys(resolvedData)

  let cancelToken: CancelToken | null = null
  let rememberExcludeKeys: FormDataKeys<TForm>[] = []

  const {
    form: baseForm,
    setDefaults,
    getTransform,
    getPrecognitionEndpoint,
    setFormState,
    clearRecentlySuccessfulTimeout,
    markAsSuccessful,
    wasDefaultsCalledInOnSuccess,
    resetDefaultsCalledInOnSuccess,
  } = useFormState<TForm>({
    data,
    rememberKey,
    precognitionEndpoint,
  })

  // Access baseForm as the full type with precognition
  const formWithPrecognition = () => baseForm as any as FormStateWithPrecognition<TForm> & InternalPrecognitionState

  const dontRememberMethod = (...keys: FormDataKeys<TForm>[]) => {
    rememberExcludeKeys = keys
    return form
  }

  const submit = (...args: UseFormSubmitArguments) => {
    const { method, url, options } = UseFormUtils.parseSubmitArguments(args, getPrecognitionEndpoint())

    resetDefaultsCalledInOnSuccess()

    const transformedData = getTransform()(form.data()) as RequestPayload

    const _options: Omit<VisitOptions, 'method'> = {
      ...options,
      onCancelToken: (token: CancelToken) => {
        cancelToken = token

        return options.onCancelToken?.(token)
      },
      onBefore: (visit: PendingVisit) => {
        setFormState('wasSuccessful', false)
        setFormState('recentlySuccessful', false)
        clearRecentlySuccessfulTimeout()

        return options.onBefore?.(visit)
      },
      onStart: (visit: PendingVisit) => {
        setFormState('processing', true)

        return options.onStart?.(visit)
      },
      onProgress: (event?: HttpProgressEvent) => {
        setFormState('progress', event || null)

        return options.onProgress?.(event)
      },
      onSuccess: async (page: Page) => {
        markAsSuccessful()

        const onSuccess = options.onSuccess ? await options.onSuccess(page) : null

        if (!wasDefaultsCalledInOnSuccess()) {
          setDefaults(cloneDeep(form.data()))
        }

        return onSuccess
      },
      onError: (errors: Errors) => {
        form.clearErrors().setError(errors as FormDataErrors<TForm>)

        return options.onError?.(errors)
      },
      onCancel: () => {
        return options.onCancel?.()
      },
      onFinish: (visit: ActiveVisit) => {
        setFormState('processing', false)
        setFormState('progress', null)
        cancelToken = null

        return options.onFinish?.(visit)
      },
    }

    if (method === 'delete') {
      router.delete(url, { ..._options, data: transformedData })
    } else {
      router[method](url, transformedData, _options)
    }
  }

  const cancel = () => {
    cancelToken?.cancel()
  }

  const createSubmitMethod =
    (method: Method) =>
    (url: string, options: VisitOptions = {}) => {
      submit(method, url, options)
    }

  // Add useForm-specific methods to the form object
  Object.assign(baseForm, {
    submit,
    get: createSubmitMethod('get'),
    post: createSubmitMethod('post'),
    put: createSubmitMethod('put'),
    patch: createSubmitMethod('patch'),
    delete: createSubmitMethod('delete'),
    cancel,
    __remember() {
      const data = form.data()
      if (rememberExcludeKeys.length > 0) {
        const filtered = { ...data } as Record<string, unknown>
        rememberExcludeKeys.forEach((k) => delete filtered[k as string])
        return { data: filtered as TForm, errors: $state.snapshot(form.errors) }
      }
      return { data, errors: $state.snapshot(form.errors) }
    },
    dontRemember: dontRememberMethod,
  })

  // Cast to the full form type
  const form = baseForm as any as InertiaForm<TForm>

  // Handle remember functionality
  $effect(() => {
    if (rememberKey) {
      const storedData = router.restore(rememberKey)
      const newData = (form as any).__remember()
      if (!isEqual(storedData, newData)) {
        router.remember(newData, rememberKey)
      }
    }
  })

  // Wrap withPrecognition to return the correct type with submit methods
  const originalWithPrecognition = formWithPrecognition().withPrecognition
  form.withPrecognition = (...args: UseFormWithPrecognitionArguments): InertiaPrecognitiveFormStore<TForm> => {
    originalWithPrecognition(...args)
    return form as any as InertiaPrecognitiveFormStore<TForm>
  }

  return getPrecognitionEndpoint() ? (form as InertiaPrecognitiveFormStore<TForm>) : (form as InertiaFormStore<TForm>)
}
