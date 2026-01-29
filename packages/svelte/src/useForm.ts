import type {
  ActiveVisit,
  CancelToken,
  Errors,
  ErrorValue,
  FormDataErrors,
  FormDataKeys,
  FormDataType,
  FormDataValues,
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
import type { AxiosProgressEvent } from 'axios'
import type { NamedInputEvent, ValidationConfig, Validator } from 'laravel-precognition'
import { createValidator, resolveName, toSimpleValidationErrors } from 'laravel-precognition'
import { cloneDeep, get, has, isEqual, set } from 'lodash-es'
import { get as getStore, writable, type Writable } from 'svelte/store'
import { config } from '.'

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
    reservedFormKeys = new Set(Object.keys(getStore(store)))
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

type InertiaFormStore<TForm extends object> = Writable<InertiaForm<TForm>> & InertiaForm<TForm>
type InertiaPrecognitiveFormStore<TForm extends object> = Writable<InertiaPrecognitiveForm<TForm>> &
  InertiaPrecognitiveForm<TForm>

type TransformCallback<TForm> = (data: TForm) => object

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

interface InternalPrecognitionState {
  __touched: string[]
  __valid: string[]
}

export type InertiaForm<TForm extends object> = InertiaFormProps<TForm> & TForm
export type InertiaPrecognitiveForm<TForm extends object> = InertiaForm<TForm> & InertiaFormValidationProps<TForm>

type ReservedFormKeys = keyof InertiaFormProps<any>

type ValidateFormData<T> = string extends keyof T
  ? T
  : {
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
  const { rememberKey, data: initialData } = parsedArgs
  let precognitionEndpoint = parsedArgs.precognitionEndpoint

  const data: TForm = typeof initialData === 'function' ? initialData() : (initialData as TForm)
  const restored = rememberKey
    ? (router.restore(rememberKey) as { data: TForm; errors: Record<FormDataKeys<TForm>, ErrorValue> } | null)
    : null
  let defaults = cloneDeep(data)
  validateFormDataKeys(defaults)
  let cancelToken: CancelToken | null = null
  let recentlySuccessfulTimeoutId: ReturnType<typeof setTimeout> | null = null
  let transform: UseFormTransformCallback<TForm> = (data) => data as object
  let rememberExcludeKeys: FormDataKeys<TForm>[] = []
  // Track if defaults was called manually during onSuccess to avoid
  // overriding user's custom defaults with automatic behavior.
  let defaultsCalledInOnSuccess = false

  // Precognition state
  let validatorRef: Validator | null = null

  // Internal helper to update form state properties (handles both base form and precognition properties)
  let setFormState: <K extends string>(key: K, value: any) => void

  // Add withPrecognition method to store object (not just store value)
  const withPrecognition = (...args: UseFormWithPrecognitionArguments): InertiaPrecognitiveFormStore<TForm> => {
    precognitionEndpoint = UseFormUtils.createWayfinderCallback(...args)

    // Type assertion helper for accessing precognition state
    // We're dynamically adding precognition properties to the store value, so we assert the type
    const formWithPrecognition = () =>
      getStore(store) as any as InertiaPrecognitiveForm<TForm> & InternalPrecognitionState

    let withAllErrors = false

    if (!validatorRef) {
      const validator = createValidator((client) => {
        const { method, url } = precognitionEndpoint!()
        const form = formWithPrecognition()
        const transformedData = cloneDeep(transform(form.data())) as Record<string, unknown>
        return client[method](url, transformedData)
      }, cloneDeep(defaults))

      validatorRef = validator

      validator
        .on('validatingChanged', () => {
          setFormState('validating', validator.validating())
        })
        .on('validatedChanged', () => {
          setFormState('__valid', validator.valid())
        })
        .on('touchedChanged', () => {
          setFormState('__touched', validator.touched())
        })
        .on('errorsChanged', () => {
          const validationErrors = withAllErrors ? validator.errors() : toSimpleValidationErrors(validator.errors())

          setFormState('errors', {} as FormDataErrors<TForm>)
          formWithPrecognition().setError(validationErrors as FormDataErrors<TForm>)
          setFormState('__valid', validator.valid())
        })
    }

    // Helper function for method chaining
    const tap = <T>(value: T, callback: (value: T) => unknown): T => {
      callback(value)
      return value
    }

    // Add validation methods to store object for direct calls
    // These need to be added after validatorRef is initialized
    if (validatorRef) {
      Object.assign(store, {})
    }

    // Add validation methods to store value for $form reactive access
    store.update((form) => {
      return Object.assign(store, {
        ...form,
        __touched: [],
        __valid: [],
        validating: false,
        validator: () => validatorRef!,
        validate: (field?: string | NamedInputEvent | ValidationConfig, config?: ValidationConfig) => {
          const form = formWithPrecognition()

          // Handle config object passed as first argument
          if (typeof field === 'object' && !('target' in field)) {
            config = field
            field = undefined
          }

          if (field === undefined) {
            validatorRef!.validate(config)
          } else {
            field = resolveName(field)
            const transformedData = transform(form.data()) as Record<string, unknown>
            validatorRef!.validate(field, get(transformedData, field), config)
          }

          return form
        },
        touch: (
          field: FormDataKeys<TForm> | NamedInputEvent | Array<FormDataKeys<TForm>>,
          ...fields: FormDataKeys<TForm>[]
        ) => {
          const form = formWithPrecognition()
          if (Array.isArray(field)) {
            validatorRef?.touch(field)
          } else if (typeof field === 'string') {
            validatorRef?.touch([field, ...fields])
          } else {
            validatorRef?.touch(field)
          }

          return form
        },
        validateFiles: () => tap(formWithPrecognition(), () => validatorRef?.validateFiles()),
        setValidationTimeout: (duration: number) =>
          tap(formWithPrecognition(), () => validatorRef!.setTimeout(duration)),
        withAllErrors: () => tap(formWithPrecognition(), () => (withAllErrors = true)),
        withoutFileValidation: () => tap(formWithPrecognition(), () => validatorRef?.withoutFileValidation()),
        valid: (field: string) => formWithPrecognition().__valid.includes(field),
        invalid: (field: string) => field in formWithPrecognition().errors,
        touched: (field?: string): boolean => {
          const touched = formWithPrecognition().__touched

          return typeof field === 'string' ? touched.includes(field) : touched.length > 0
        },
        setErrors: (errors: FormDataErrors<TForm>) =>
          tap(formWithPrecognition(), () => {
            const form = formWithPrecognition()
            form.setError(errors)
          }),
        forgetError: (field: FormDataKeys<TForm> | NamedInputEvent) =>
          tap(formWithPrecognition(), () => {
            const form = formWithPrecognition()
            form.clearErrors(resolveName(field as string | NamedInputEvent) as FormDataKeys<TForm>)
          }),
      })
    })

    return store as any as InertiaPrecognitiveFormStore<TForm>
  }

  const store = writable<InertiaForm<TForm>>({
    ...(restored ? restored.data : data),
    isDirty: false,
    errors: (restored ? restored.errors : {}) as FormDataErrors<TForm>,
    hasErrors: false,
    progress: null,
    wasSuccessful: false,
    recentlySuccessful: false,
    processing: false,
    setStore(keyOrData: keyof InertiaFormProps<TForm> | FormDataKeys<TForm> | TForm, maybeValue = undefined) {
      store.update((store) => {
        return typeof keyOrData === 'string' ? set(store, keyOrData, maybeValue) : Object.assign(store, keyOrData)
      })
    },
    data() {
      return Object.keys(data).reduce((carry, key) => {
        return set(carry, key, get(this, key))
      }, {} as TForm)
    },
    transform(callback: TransformCallback<TForm>) {
      transform = callback
      return this
    },
    defaults(fieldOrFields?: FormDataKeys<TForm> | Partial<TForm>, maybeValue?: unknown) {
      defaultsCalledInOnSuccess = true

      if (typeof fieldOrFields === 'undefined') {
        defaults = cloneDeep(this.data())
      } else {
        defaults =
          typeof fieldOrFields === 'string'
            ? set(cloneDeep(defaults), fieldOrFields, maybeValue)
            : Object.assign(cloneDeep(defaults), fieldOrFields)
      }

      validatorRef?.defaults(defaults)

      return this
    },
    reset(...fields: Array<FormDataKeys<TForm>>) {
      const clonedData = cloneDeep(defaults)
      if (fields.length === 0) {
        this.setStore(clonedData)
      } else {
        this.setStore(
          fields
            .filter((key) => has(clonedData, key))
            .reduce((carry, key) => {
              return set(carry, key, get(clonedData, key))
            }, {} as TForm),
        )
      }

      validatorRef?.reset(...fields)

      return this
    },
    setError(fieldOrFields: FormDataKeys<TForm> | FormDataErrors<TForm>, maybeValue?: ErrorValue) {
      const errors = typeof fieldOrFields === 'string' ? { [fieldOrFields]: maybeValue } : fieldOrFields

      setFormState('errors', {
        ...this.errors,
        ...errors,
      })

      validatorRef?.setErrors(errors as Errors)

      return this
    },
    clearErrors(...fields: string[]) {
      setFormState(
        'errors',
        Object.keys(this.errors).reduce(
          (carry, field) => ({
            ...carry,
            ...(fields.length > 0 && !fields.includes(field) ? { [field]: (this.errors as Errors)[field] } : {}),
          }),
          {},
        ) as FormDataErrors<TForm>,
      )

      if (validatorRef) {
        if (fields.length === 0) {
          validatorRef.setErrors({})
        } else {
          fields.forEach(validatorRef.forgetError)
        }
      }

      return this
    },
    resetAndClearErrors(...fields: Array<FormDataKeys<TForm>>) {
      this.reset(...fields)
      this.clearErrors(...fields)
      return this
    },
    submit(...args: UseFormSubmitArguments) {
      const { method, url, options } = UseFormUtils.parseSubmitArguments(args, precognitionEndpoint)

      defaultsCalledInOnSuccess = false

      const data = transform(this.data()) as RequestPayload

      const _options: Omit<VisitOptions, 'method'> = {
        ...options,
        onCancelToken: (token: CancelToken) => {
          cancelToken = token

          if (options.onCancelToken) {
            return options.onCancelToken(token)
          }
        },
        onBefore: (visit: PendingVisit) => {
          setFormState('wasSuccessful', false)
          setFormState('recentlySuccessful', false)
          if (recentlySuccessfulTimeoutId) {
            clearTimeout(recentlySuccessfulTimeoutId)
          }

          if (options.onBefore) {
            return options.onBefore(visit)
          }
        },
        onStart: (visit: PendingVisit) => {
          setFormState('processing', true)

          if (options.onStart) {
            return options.onStart(visit)
          }
        },
        onProgress: (event?: AxiosProgressEvent) => {
          setFormState('progress', event || null)

          if (options.onProgress) {
            return options.onProgress(event)
          }
        },
        onSuccess: async (page: Page) => {
          setFormState('processing', false)
          setFormState('progress', null)
          this.clearErrors()
          setFormState('wasSuccessful', true)
          setFormState('recentlySuccessful', true)
          recentlySuccessfulTimeoutId = setTimeout(
            () => setFormState('recentlySuccessful', false),
            config.get('form.recentlySuccessfulDuration'),
          )

          const onSuccess = options.onSuccess ? await options.onSuccess(page) : null

          if (!defaultsCalledInOnSuccess) {
            this.defaults(cloneDeep(getStore(store).data()))
          }

          return onSuccess
        },
        onError: (errors: Errors) => {
          setFormState('processing', false)
          setFormState('progress', null)
          setFormState('errors', errors as FormDataErrors<TForm>)

          validatorRef?.setErrors(errors)

          if (options.onError) {
            return options.onError(errors)
          }
        },
        onCancel: () => {
          setFormState('processing', false)
          setFormState('progress', null)

          if (options.onCancel) {
            return options.onCancel()
          }
        },
        onFinish: (visit: ActiveVisit) => {
          setFormState('processing', false)
          setFormState('progress', null)
          cancelToken = null

          if (options.onFinish) {
            return options.onFinish(visit)
          }
        },
      }

      if (method === 'delete') {
        router.delete(url, { ..._options, data })
      } else {
        router[method](url, data, _options)
      }
    },
    get(url: string, options: VisitOptions) {
      this.submit('get', url, options)
    },
    post(url: string, options: VisitOptions) {
      this.submit('post', url, options)
    },
    put(url: string, options: VisitOptions) {
      this.submit('put', url, options)
    },
    patch(url: string, options: VisitOptions) {
      this.submit('patch', url, options)
    },
    delete(url: string, options: VisitOptions) {
      this.submit('delete', url, options)
    },
    cancel() {
      cancelToken?.cancel()
    },
    __remember() {
      const data = this.data()
      if (rememberExcludeKeys.length > 0) {
        const filtered = { ...data } as Record<string, unknown>
        rememberExcludeKeys.forEach((k) => delete filtered[k as string])
        return { data: filtered as TForm, errors: this.errors }
      }
      return { data, errors: this.errors }
    },
    withPrecognition,
  } as any)

  // Add withPrecognition and dontRemember to store object
  const dontRememberMethod = (...keys: FormDataKeys<TForm>[]) => {
    rememberExcludeKeys = keys
    return store
  }

  Object.assign(store, {
    withPrecognition,
    dontRemember: dontRememberMethod,
  })

  // Assign setFormState after store is created
  setFormState = <K extends string>(key: K, value: any) => {
    store.update((form) => ({ ...form, [key]: value }))
  }

  store.subscribe((form) => {
    if (form.isDirty === isEqual(form.data(), defaults)) {
      setFormState('isDirty', !form.isDirty)
    }

    const hasErrors = Object.keys(form.errors).length > 0
    if (form.hasErrors !== hasErrors) {
      setFormState('hasErrors', !form.hasErrors)
    }

    if (rememberKey) {
      const storedData = router.restore(rememberKey)
      const newData = (form as any).__remember()
      if (!isEqual(storedData, newData)) {
        router.remember(newData, rememberKey)
      }
    }
  })

  return precognitionEndpoint
    ? (store as any).withPrecognition(precognitionEndpoint)
    : (store as InertiaFormStore<TForm>)
}
