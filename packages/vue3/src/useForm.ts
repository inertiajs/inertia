import {
  CancelToken,
  Errors,
  ErrorValue,
  FormDataErrors,
  FormDataKeys,
  FormDataType,
  FormDataValues,
  isUrlMethodPair,
  Method,
  Progress,
  RequestPayload,
  router,
  UrlMethodPair,
  VisitOptions,
} from '@inertiajs/core'
import {
  createValidator,
  NamedInputEvent,
  resolveName,
  toSimpleValidationErrors,
  ValidationConfig,
  Validator,
} from 'laravel-precognition'
import { cloneDeep, get, has, isEqual, set } from 'lodash-es'
import { reactive, watch } from 'vue'
import { config } from '.'

type FormOptions = Omit<VisitOptions, 'data'>
type SubmitArgs = [Method, string, FormOptions?] | [UrlMethodPair, FormOptions?] | [FormOptions?]
type TransformCallback<TForm> = (data: TForm) => object

type WithPrecognitionArgs = [Method | (() => Method), string | (() => string)] | [UrlMethodPair | (() => UrlMethodPair)]

export interface InertiaFormProps<TForm extends object> {
  isDirty: boolean
  errors: FormDataErrors<TForm>
  hasErrors: boolean
  processing: boolean
  progress: Progress | null
  wasSuccessful: boolean
  recentlySuccessful: boolean
  data(): TForm
  transform(callback: TransformCallback<TForm>): this
  defaults(): this
  defaults<T extends FormDataKeys<TForm>>(field: T, value: FormDataValues<TForm, T>): this
  defaults(fields: Partial<TForm>): this
  reset<K extends FormDataKeys<TForm>>(...fields: K[]): this
  clearErrors<K extends FormDataKeys<TForm>>(...fields: K[]): this
  resetAndClearErrors<K extends FormDataKeys<TForm>>(...fields: K[]): this
  setError<K extends FormDataKeys<TForm>>(field: K, value: ErrorValue): this
  setError(errors: FormDataErrors<TForm>): this
  submit: (...args: SubmitArgs) => void
  get(url: string, options?: FormOptions): void
  post(url: string, options?: FormOptions): void
  put(url: string, options?: FormOptions): void
  patch(url: string, options?: FormOptions): void
  delete(url: string, options?: FormOptions): void
  cancel(): void
  withPrecognition(...args: WithPrecognitionArgs): InertiaPrecognitiveForm<TForm>
}

type PrecognitionValidationConfig<TKeys> = ValidationConfig & {
  only?: TKeys[]
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

// Internal state for precognition validation
interface PrecognitionInternalState {
  __touched: string[]
  __valid: string[]
}

// Internal state for remember/restore functionality
interface RememberInternalState<TForm extends object> {
  __rememberable: boolean
  __remember: () => { data: TForm; errors: FormDataErrors<TForm> }
  __restore: (restored: { data: TForm; errors: FormDataErrors<TForm> }) => void
}

export type InertiaForm<TForm extends object> = TForm & InertiaFormProps<TForm>
export type InertiaPrecognitiveForm<TForm extends object> = TForm &
  InertiaFormProps<TForm> &
  InertiaFormValidationProps<TForm> &
  PrecognitionInternalState

type UseFormInertiaArguments<TForm> = [data: TForm | (() => TForm)] | [rememberKey: string, data: TForm | (() => TForm)]
type UseFormPrecognitionArguments<TForm> =
  | [urlMethodPair: UrlMethodPair | (() => UrlMethodPair), data: TForm | (() => TForm)]
  | [method: Method | (() => Method), url: string | (() => string), data: TForm | (() => TForm)]
type UseFormArguments<TForm> = UseFormInertiaArguments<TForm> | UseFormPrecognitionArguments<TForm>

const normalizeWayfinderArgsToCallback =
  (
    ...args: [UrlMethodPair | (() => UrlMethodPair)] | [Method | (() => Method), string | (() => string)]
  ): (() => UrlMethodPair) =>
  () => {
    if (args.length === 2) {
      return {
        method: typeof args[0] === 'function' ? args[0]() : args[0],
        url: typeof args[1] === 'function' ? args[1]() : args[1],
      }
    }

    return typeof args[0] === 'function' ? args[0]() : args[0]
  }

const parseUseFormArgs = <TForm extends FormDataType<TForm>>(
  ...args: UseFormArguments<TForm>
): {
  rememberKey: string | null
  data: TForm | (() => TForm)
  precognitionEndpoint: (() => UrlMethodPair) | null
} => {
  // Pattern 1: [data: TForm | (() => TForm)]
  if (args.length === 1) {
    return {
      rememberKey: null,
      data: args[0] as TForm | (() => TForm),
      precognitionEndpoint: null,
    }
  }

  // Pattern 2 & 3: Two arguments - need to distinguish by first arg type
  if (args.length === 2) {
    if (typeof args[0] === 'string') {
      // Pattern 2: [rememberKey: string, data: TForm | (() => TForm)]
      return {
        rememberKey: args[0],
        data: args[1] as TForm | (() => TForm),
        precognitionEndpoint: null,
      }
    } else {
      // Pattern 3: [urlMethodPair: UrlMethodPair | (() => UrlMethodPair), data: TForm | (() => TForm)]
      return {
        rememberKey: null,
        data: args[1] as TForm | (() => TForm),
        precognitionEndpoint: normalizeWayfinderArgsToCallback(args[0]),
      }
    }
  }

  // Pattern 4: [method: Method | (() => Method), url: string | (() => string), data: TForm | (() => TForm)]
  return {
    rememberKey: null,
    data: args[2] as TForm | (() => TForm),
    precognitionEndpoint: normalizeWayfinderArgsToCallback(args[0], args[1]),
  }
}

export default function useForm<TForm extends FormDataType<TForm>>(
  method: Method | (() => Method),
  url: string | (() => string),
  data: TForm | (() => TForm),
): InertiaPrecognitiveForm<TForm>
export default function useForm<TForm extends FormDataType<TForm>>(
  urlMethodPair: UrlMethodPair | (() => UrlMethodPair),
  data: TForm | (() => TForm),
): InertiaPrecognitiveForm<TForm>
export default function useForm<TForm extends FormDataType<TForm>>(
  rememberKey: string,
  data: TForm | (() => TForm),
): InertiaForm<TForm>
export default function useForm<TForm extends FormDataType<TForm>>(data: TForm | (() => TForm)): InertiaForm<TForm>
export default function useForm<TForm extends FormDataType<TForm>>(
  ...args: UseFormArguments<TForm>
): InertiaForm<TForm> | InertiaPrecognitiveForm<TForm> {
  let { rememberKey, data, precognitionEndpoint } = parseUseFormArgs<TForm>(...args)

  const restored = rememberKey
    ? (router.restore(rememberKey) as { data: TForm; errors: Record<FormDataKeys<TForm>, string> })
    : null
  let defaults = typeof data === 'function' ? cloneDeep(data()) : cloneDeep(data)
  let cancelToken: CancelToken | null = null
  let recentlySuccessfulTimeoutId: ReturnType<typeof setTimeout>
  let transform: TransformCallback<TForm> = (data) => data

  let validator: Validator | null = null

  const parseSubmitArgs = (args: SubmitArgs): { method: Method; url: string; options: FormOptions } => {
    if (args.length === 3 || (args.length === 2 && typeof args[0] === 'string')) {
      // All arguments passed, or method + url
      return { method: args[0], url: args[1], options: args[2] ?? {} }
    }

    if (isUrlMethodPair(args[0])) {
      // Wayfinder + optional options
      return { ...args[0], options: (args[1] ?? {}) as FormOptions }
    }

    // No arguments, or only options passed, use precognition endpoint...
    return { ...precognitionEndpoint!(), options: (args[0] ?? {}) as FormOptions }
  }

  // Track if defaults was called manually during onSuccess to avoid
  // overriding user's custom defaults with automatic behavior.
  let defaultsCalledInOnSuccess = false

  const form = reactive({
    ...(restored ? restored.data : cloneDeep(defaults)),
    isDirty: false,
    errors: (restored ? restored.errors : {}) as FormDataErrors<TForm>,
    hasErrors: false,
    processing: false,
    progress: null as Progress | null,
    wasSuccessful: false,
    recentlySuccessful: false,
    withPrecognition(...args: WithPrecognitionArgs): InertiaPrecognitiveForm<TForm> {
      precognitionEndpoint = normalizeWayfinderArgsToCallback(...args)

      // Type assertion helper for accessing precognition state
      // We're dynamically adding precognition properties to 'this', so we assert the type
      const formWithPrecognition = this as any as InertiaPrecognitiveForm<TForm>

      // Track whether to use simple validation errors (single string per field vs array)
      let simpleValidationErrors = true

      // Create validator - precognitionEndpoint is guaranteed to exist at this point
      const endpointCallback = precognitionEndpoint!

      validator = createValidator((client) => {
        const { method, url } = endpointCallback()
        const transformedData = transform(this.data()) as Record<string, unknown>

        return client[method](url, transformedData)
      }, defaults)

      // Store validator reference for type safety - after assignment, it's guaranteed to exist
      const validatorRef = validator

      // Set up validator event handlers to sync state with form
      validator
        .on('validatingChanged', () => {
          formWithPrecognition.validating = validatorRef.validating()
        })
        .on('validatedChanged', () => {
          formWithPrecognition.__valid = validatorRef.valid()
        })
        .on('touchedChanged', () => {
          formWithPrecognition.__touched = validatorRef.touched()
        })
        .on('errorsChanged', () => {
          const validatorErrors = validatorRef.errors()
          const validationErrors = simpleValidationErrors
            ? toSimpleValidationErrors(validatorErrors)
            : validatorErrors

          // Clear existing errors and set new validation errors
          this.errors = {} as FormDataErrors<TForm>
          this.setError(validationErrors as FormDataErrors<TForm>)
          // Update valid state after errors change
          formWithPrecognition.__valid = validatorRef.valid()
        })

      // Initialize precognition state
      formWithPrecognition.__touched = []
      formWithPrecognition.__valid = []
      formWithPrecognition.validating = false
      formWithPrecognition.validator = () => validatorRef

      // Bind precognition methods - all return 'this' for method chaining
      formWithPrecognition.setValidationTimeout = (duration: number) => {
        validatorRef.setTimeout(duration)
        return formWithPrecognition
      }

      formWithPrecognition.validateFiles = () => {
        validatorRef.validateFiles()
        return formWithPrecognition
      }

      formWithPrecognition.withFullErrors = () => {
        simpleValidationErrors = false
        return formWithPrecognition
      }

      formWithPrecognition.withoutFileValidation = () => {
        // @ts-expect-error - Not released yet...
        validatorRef.withoutFileValidation()
        return formWithPrecognition
      }

      formWithPrecognition.valid = (field: string) => formWithPrecognition.__valid.includes(field)
      formWithPrecognition.invalid = (field: string) => field in this.errors
      formWithPrecognition.validate = (
        field?: string | NamedInputEvent | ValidationConfig,
        config?: ValidationConfig,
      ) => {
        // Handle config object passed as first argument
        if (typeof field === 'object' && !('target' in field)) {
          config = field
          field = undefined
        }

        if (field === undefined) {
          validatorRef.validate(config)
        } else {
          const fieldName = resolveName(field)
          const transformedData = transform(this.data()) as Record<string, unknown>
          validatorRef.validate(fieldName, get(transformedData, fieldName), config)
        }

        return formWithPrecognition
      }

      formWithPrecognition.touch = (...fields: string[]) => {
        validatorRef.touch(fields)
        return formWithPrecognition
      }

      formWithPrecognition.touched = (field?: string): boolean => {
        if (typeof field === 'string') {
          return formWithPrecognition.__touched.includes(field)
        }
        return formWithPrecognition.__touched.length > 0
      }

      return formWithPrecognition
    },
    data() {
      return (Object.keys(defaults) as Array<FormDataKeys<TForm>>).reduce((carry, key) => {
        return set(carry, key, get(this, key))
      }, {} as Partial<TForm>) as TForm
    },
    transform(callback: TransformCallback<TForm>) {
      transform = callback

      return this
    },
    defaults(fieldOrFields?: FormDataKeys<TForm> | Partial<TForm>, maybeValue?: unknown) {
      if (typeof data === 'function') {
        throw new Error('You cannot call `defaults()` when using a function to define your form data.')
      }

      defaultsCalledInOnSuccess = true

      if (typeof fieldOrFields === 'undefined') {
        defaults = cloneDeep(this.data())
        this.isDirty = false
      } else {
        defaults =
          typeof fieldOrFields === 'string'
            ? set(cloneDeep(defaults), fieldOrFields, maybeValue)
            : Object.assign({}, cloneDeep(defaults), fieldOrFields)
      }

      return this
    },
    reset(...fields: string[]) {
      const resolvedData = typeof data === 'function' ? cloneDeep(data()) : cloneDeep(defaults)
      const clonedData = cloneDeep(resolvedData)
      if (fields.length === 0) {
        defaults = clonedData
        Object.assign(this, resolvedData)
      } else {
        ;(fields as Array<FormDataKeys<TForm>>)
          .filter((key) => has(clonedData, key))
          .forEach((key) => {
            set(defaults, key, get(clonedData, key))
            set(this, key, get(resolvedData, key))
          })
      }

      validator?.reset(...fields)

      return this
    },
    setError(fieldOrFields: FormDataKeys<TForm> | FormDataErrors<TForm>, maybeValue?: ErrorValue) {
      const errors = typeof fieldOrFields === 'string' ? { [fieldOrFields]: maybeValue } : fieldOrFields

      Object.assign(this.errors, errors)

      this.hasErrors = Object.keys(this.errors).length > 0

      validator?.setErrors(errors as Errors)

      return this
    },
    clearErrors(...fields: string[]) {
      this.errors = Object.keys(this.errors).reduce(
        (carry, field) => ({
          ...carry,
          ...(fields.length > 0 && !fields.includes(field) ? { [field]: (this.errors as Errors)[field] } : {}),
        }),
        {} as FormDataErrors<TForm>,
      )

      this.hasErrors = Object.keys(this.errors).length > 0

      if (validator) {
        if (fields.length === 0) {
          validator.setErrors({})
        } else {
          fields.forEach(validator.forgetError)
        }
      }

      return this
    },
    resetAndClearErrors(...fields: string[]) {
      this.reset(...fields)
      this.clearErrors(...fields)
      return this
    },
    submit(...args: SubmitArgs) {
      const { method, url, options } = parseSubmitArgs(args)

      defaultsCalledInOnSuccess = false

      const _options: VisitOptions = {
        ...options,
        onCancelToken: (token) => {
          cancelToken = token

          if (options.onCancelToken) {
            return options.onCancelToken(token)
          }
        },
        onBefore: (visit) => {
          this.wasSuccessful = false
          this.recentlySuccessful = false
          clearTimeout(recentlySuccessfulTimeoutId)

          if (options.onBefore) {
            return options.onBefore(visit)
          }
        },
        onStart: (visit) => {
          this.processing = true

          if (options.onStart) {
            return options.onStart(visit)
          }
        },
        onProgress: (event) => {
          this.progress = event ?? null

          if (options.onProgress) {
            return options.onProgress(event)
          }
        },
        onSuccess: async (page) => {
          this.processing = false
          this.progress = null
          this.clearErrors()
          this.wasSuccessful = true
          this.recentlySuccessful = true
          recentlySuccessfulTimeoutId = setTimeout(
            () => (this.recentlySuccessful = false),
            config.get('form.recentlySuccessfulDuration'),
          )

          const onSuccess = options.onSuccess ? await options.onSuccess(page) : null

          if (!defaultsCalledInOnSuccess) {
            defaults = cloneDeep(this.data())
            this.isDirty = false
          }

          return onSuccess
        },
        onError: (errors) => {
          this.processing = false
          this.progress = null
          this.clearErrors().setError(errors as FormDataErrors<TForm>)

          if (options.onError) {
            return options.onError(errors)
          }
        },
        onCancel: () => {
          this.processing = false
          this.progress = null

          if (options.onCancel) {
            return options.onCancel()
          }
        },
        onFinish: (visit) => {
          this.processing = false
          this.progress = null
          cancelToken = null

          if (options.onFinish) {
            return options.onFinish(visit)
          }
        },
      }

      const transformedData = transform(this.data()) as RequestPayload

      if (method === 'delete') {
        router.delete(url, { ..._options, data: transformedData })
      } else {
        router[method](url, transformedData, _options)
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
      if (cancelToken) {
        cancelToken.cancel()
      }
    },
    __rememberable: rememberKey === null,
    __remember() {
      return { data: this.data(), errors: this.errors }
    },
    __restore(restored: { data: TForm; errors: FormDataErrors<TForm> }) {
      Object.assign(this, restored.data)
      this.setError(restored.errors)
    },
  })

  watch(
    form as any as InertiaForm<TForm> & RememberInternalState<TForm>,
    (newValue) => {
      const formValue = newValue
      formValue.isDirty = !isEqual(formValue.data(), defaults)
      if (rememberKey) {
        router.remember(cloneDeep(formValue.__remember()), rememberKey)
      }
    },
    { immediate: true, deep: true },
  )

  // Vue's reactive() wrapper matches our interface at runtime
  const typedForm = form as any as InertiaForm<TForm>

  return precognitionEndpoint ? typedForm.withPrecognition(precognitionEndpoint) : typedForm
}
