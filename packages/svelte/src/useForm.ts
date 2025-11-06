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

type InertiaFormStore<TForm extends object> = Writable<InertiaForm<TForm>> & InertiaForm<TForm>
type InertiaPrecognitiveFormStore<TForm extends object> = Writable<InertiaPrecognitiveForm<TForm>> &
  InertiaPrecognitiveForm<TForm>

type TransformCallback<TForm> = (data: TForm) => object

type PrecognitionValidationConfig<TKeys> = ValidationConfig & {
  only?: TKeys[]
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
  withPrecognition: (...args: UseFormWithPrecognitionArguments) => InertiaPrecognitiveForm<TForm>
}

export interface InertiaFormValidationProps<TForm extends object> {
  invalid<K extends FormDataKeys<TForm>>(field: K): boolean
  setValidationTimeout(duration: number): this
  touch<K extends FormDataKeys<TForm>>(...fields: K[]): this
  touched<K extends FormDataKeys<TForm>>(field?: K): boolean
  valid<K extends FormDataKeys<TForm>>(field: K): boolean
  validate<K extends FormDataKeys<TForm>>(
    field?: K | NamedInputEvent | PrecognitionValidationConfig<K>,
    config?: PrecognitionValidationConfig<K>,
  ): this
  validateFiles(): this
  validating: boolean
  validator: () => Validator
  withFullErrors(): this
  withoutFileValidation(): this
}

interface InternalPrecognitionState {
  __touched: string[]
  __valid: string[]
}

export type InertiaForm<TForm extends object> = InertiaFormProps<TForm> & TForm
export type InertiaPrecognitiveForm<TForm extends object> = InertiaForm<TForm> &
  InertiaFormValidationProps<TForm> &
  InternalPrecognitionState

export default function useForm<TForm extends FormDataType<TForm>>(
  method: Method | (() => Method),
  url: string | (() => string),
  data: TForm | (() => TForm),
): InertiaPrecognitiveFormStore<TForm>
export default function useForm<TForm extends FormDataType<TForm>>(
  urlMethodPair: UrlMethodPair | (() => UrlMethodPair),
  data: TForm | (() => TForm),
): InertiaPrecognitiveFormStore<TForm>
export default function useForm<TForm extends FormDataType<TForm>>(
  rememberKey: string,
  data: TForm | (() => TForm),
): InertiaFormStore<TForm>
export default function useForm<TForm extends FormDataType<TForm>>(data: TForm | (() => TForm)): InertiaFormStore<TForm>
export default function useForm<TForm extends FormDataType<TForm>>(
  ...args: UseFormArguments<TForm>
): InertiaFormStore<TForm> | InertiaPrecognitiveFormStore<TForm> {
  const parsedArgs = UseFormUtils.parseUseFormArguments<TForm>(...args)
  const { rememberKey, data: initialData } = parsedArgs
  let precognitionEndpoint = parsedArgs.precognitionEndpoint

  const data: TForm = typeof initialData === 'function' ? initialData() : (initialData as TForm)
  const restored = rememberKey
    ? (router.restore(rememberKey) as { data: TForm; errors: Record<FormDataKeys<TForm>, string> } | null)
    : null
  let defaults = cloneDeep(data)
  let cancelToken: CancelToken | null = null
  let recentlySuccessfulTimeoutId: ReturnType<typeof setTimeout> | null = null
  let transform: UseFormTransformCallback<TForm> = (data) => data as object
  // Track if defaults was called manually during onSuccess to avoid
  // overriding user's custom defaults with automatic behavior.
  let defaultsCalledInOnSuccess = false

  // Precognition state
  let validatorRef: Validator | null = null

  // Internal helper to update form state properties
  const setFormState = <K extends keyof InertiaFormProps<TForm>>(key: K, value: InertiaFormProps<TForm>[K]) => {
    store.update((form) => ({ ...form, [key]: value }))
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

      return this
    },
    reset(...fields: Array<FormDataKeys<TForm>>) {
      const resolvedData = cloneDeep(defaults)

      if (fields.length === 0) {
        // Reset all fields to defaults - use Object.assign to maintain reactivity
        Object.assign(this, resolvedData)
        store.set({ ...getStore(store), ...resolvedData })
      } else {
        // Reset specific fields to defaults
        fields
          .filter((key) => has(resolvedData, key))
          .forEach((key) => {
            const value = get(resolvedData, key)
            ;(this as any)[key] = value
            store.update((currentStore) => ({ ...currentStore, [key]: value }))
          })
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
            store.update((form) => {
              this.defaults(cloneDeep(form.data()))
              return form
            })
          }

          return onSuccess
        },
        onError: (errors: Errors) => {
          setFormState('processing', false)
          setFormState('progress', null)
          this.clearErrors().setError(errors as FormDataErrors<TForm>)

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
  } as any)

  // Add withPrecognition method directly to the store object
  ;(store as any).withPrecognition = (
    ...args: UseFormWithPrecognitionArguments
  ): InertiaPrecognitiveFormStore<TForm> => {
    precognitionEndpoint = UseFormUtils.createWayfinderCallback(...args)

    let simpleValidationErrors = true

    if (!validatorRef) {

      const validator = createValidator((client) => {
        const { method, url } = precognitionEndpoint!()
        const currentForm = getStore(store)
        const transformedData = transform(currentForm.data()) as Record<string, unknown>
        return client[method](url, transformedData)
      }, defaults)

      validatorRef = validator

      // Add all validation properties and methods to the store value for $form access
      store.update((form) => ({
        ...form,
        __touched: [],
        __valid: [],
        validating: false,
        // Validation checking methods
        valid: (field: string) => {
          const currentStore = getStore(store)
          return (currentStore as any).__valid?.includes(field) || false
        },
        invalid: (field: string) => {
          const currentStore = getStore(store)
          return field in (currentStore.errors || {})
        },
        touched: (field?: string): boolean => {
          const currentStore = getStore(store)
          const touched = (currentStore as any).__touched || []
          return typeof field === 'string' ? touched.includes(field) : touched.length > 0
        },
        // Validation action methods
        validate: (field?: string | NamedInputEvent | ValidationConfig, config?: ValidationConfig) => {
          // Handle config object passed as first argument
          if (typeof field === 'object' && !('target' in field)) {
            config = field
            field = undefined
          }

          if (field === undefined) {
            validatorRef!.validate(config)
          } else {
            const fieldName = resolveName(field)
            const currentForm = getStore(store)
            const transformedData = transform(currentForm.data()) as Record<string, unknown>
            validatorRef!.validate(fieldName, get(transformedData, fieldName), config)
          }

          return getStore(store)
        },
        validator: () => validatorRef!,
        setValidationTimeout: (duration: number) => {
          validatorRef!.setTimeout(duration)
          return getStore(store)
        },
        validateFiles: () => {
          validatorRef!.validateFiles()
          return getStore(store)
        },
        withoutFileValidation: () => {
          try {
            if (typeof (validatorRef as any).withoutFileValidation === 'function') {
              ;(validatorRef as any).withoutFileValidation()
            }
          } catch (error) {
            console.warn('withoutFileValidation method not available')
          }
          return getStore(store)
        },
        touch: (...fields: string[]) => {
          validatorRef!.touch(fields)
          return getStore(store)
        },
        withFullErrors: () => {
          simpleValidationErrors = false
          return getStore(store)
        },
      }))

      validator
        .on('validatingChanged', () => {
          store.update((form) => ({ ...form, validating: validator.validating() }))
        })
        .on('validatedChanged', () => {
          store.update((form) => ({ ...form, __valid: validator.valid() }))
        })
        .on('touchedChanged', () => {
          store.update((form) => ({ ...form, __touched: validator.touched() }))
        })
        .on('errorsChanged', () => {
          const validationErrors = simpleValidationErrors
            ? toSimpleValidationErrors(validator.errors())
            : validator.errors()

          store.update((form) => ({
            ...form,
            errors: {} as FormDataErrors<TForm>,
          }))

          getStore(store).setError(validationErrors as FormDataErrors<TForm>)
          store.update((form) => ({ ...form, __valid: validator.valid() }))
        })

    }

    // Add chaining methods to the store object EVERY time withPrecognition is called
    // This ensures they're always available for chaining
    const storeValue = getStore(store)

    // Precognition chaining methods
    ;(store as any).setValidationTimeout = (duration: number) => {
      validatorRef!.setTimeout(duration)
      return store
    }
    ;(store as any).validateFiles = () => {
      validatorRef!.validateFiles()
      return store
    }
    ;(store as any).withoutFileValidation = () => {
      try {
        if (typeof (validatorRef as any).withoutFileValidation === 'function') {
          ;(validatorRef as any).withoutFileValidation()
        }
      } catch (error) {
        console.warn('withoutFileValidation method not available')
      }
      return store
    }
    ;(store as any).touch = (...fields: string[]) => {
      validatorRef!.touch(fields)
      return store
    }
    ;(store as any).withFullErrors = () => {
      simpleValidationErrors = false
      return store
    }
    ;(store as any).validate = (...fields: string[]) => {
      validatorRef!.validate(...fields)
      return store
    }

    // Base form methods for chaining compatibility AND direct access
    ;(store as any).transform = (callback: TransformCallback<TForm>) => {
      transform = callback
      return store
    }
    ;(store as any).defaults = (fieldOrFields?: any, maybeValue?: any) => {
      storeValue.defaults(fieldOrFields, maybeValue)
      return store
    }
    ;(store as any).reset = (...fields: any[]) => {
      storeValue.reset(...(fields as FormDataKeys<TForm>[]))
      return store
    }
    ;(store as any).clearErrors = (...fields: any[]) => {
      storeValue.clearErrors(...(fields as FormDataKeys<TForm>[]))
      return store
    }
    ;(store as any).setError = (fieldOrFields: any, maybeValue?: any) => {
      storeValue.setError(fieldOrFields, maybeValue)
      return store
    }

    // ADD ALL SUBMISSION METHODS TO STORE OBJECT!
    ;(store as any).submit = (...args: any[]) => {
      (storeValue.submit as any)(...args)
    }
    ;(store as any).get = (url: string, options?: any) => {
      storeValue.get(url, options)
    }
    ;(store as any).post = (url: string, options?: any) => {
      storeValue.post(url, options)
    }
    ;(store as any).put = (url: string, options?: any) => {
      storeValue.put(url, options)
    }
    ;(store as any).patch = (url: string, options?: any) => {
      storeValue.patch(url, options)
    }
    ;(store as any).delete = (url: string, options?: any) => {
      storeValue.delete(url, options)
    }
    ;(store as any).cancel = () => {
      storeValue.cancel()
    }

    return store as any as InertiaPrecognitiveFormStore<TForm>
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
      router.remember({ data: form.data(), errors: form.errors }, rememberKey)
    }
  })

  // If legacy precognition patterns were used, automatically call withPrecognition
  // This matches React/Vue behavior exactly
  return precognitionEndpoint
    ? (store as any).withPrecognition(precognitionEndpoint)
    : (store as InertiaFormStore<TForm>)
}
