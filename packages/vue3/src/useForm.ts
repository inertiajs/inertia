import {
  CancelToken,
  Errors,
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

interface InternalRememberState<TForm extends object> {
  __rememberable: boolean
  __remember: () => { data: TForm; errors: FormDataErrors<TForm> }
  __restore: (restored: { data: TForm; errors: FormDataErrors<TForm> }) => void
}

export type InertiaForm<TForm extends object> = TForm & InertiaFormProps<TForm>
export type InertiaPrecognitiveForm<TForm extends object> = InertiaForm<TForm> &
  InertiaFormValidationProps<TForm> &
  InternalPrecognitionState

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
  let { rememberKey, data, precognitionEndpoint } = UseFormUtils.parseUseFormArguments<TForm>(...args)

  const restored = rememberKey
    ? (router.restore(rememberKey) as { data: TForm; errors: Record<FormDataKeys<TForm>, ErrorValue> })
    : null
  let defaults = typeof data === 'function' ? cloneDeep(data()) : cloneDeep(data)
  let cancelToken: CancelToken | null = null
  let recentlySuccessfulTimeoutId: ReturnType<typeof setTimeout>
  let transform: UseFormTransformCallback<TForm> = (data) => data

  let validatorRef: Validator | null = null

  // Track if defaults was called manually during onSuccess to avoid
  // overriding user's custom defaults with automatic behavior.
  let defaultsCalledInOnSuccess = false

  const form = reactive<InertiaForm<TForm>>({
    ...(restored ? restored.data : cloneDeep(defaults)),
    isDirty: false,
    errors: (restored ? restored.errors : {}) as FormDataErrors<TForm>,
    hasErrors: false,
    processing: false,
    progress: null as Progress | null,
    wasSuccessful: false,
    recentlySuccessful: false,
    withPrecognition(...args: UseFormWithPrecognitionArguments): InertiaPrecognitiveForm<TForm> {
      precognitionEndpoint = UseFormUtils.createWayfinderCallback(...args)

      // Type assertion helper for accessing precognition state
      // We're dynamically adding precognition properties to 'this', so we assert the type
      const formWithPrecognition = this as any as InertiaPrecognitiveForm<TForm>

      let withAllErrors = false
      const validator = createValidator((client) => {
        const { method, url } = precognitionEndpoint!()
        const transformedData = cloneDeep(transform(this.data())) as Record<string, unknown>

        return client[method](url, transformedData)
      }, cloneDeep(defaults))

      validatorRef = validator

      validator
        .on('validatingChanged', () => {
          formWithPrecognition.validating = validator.validating()
        })
        .on('validatedChanged', () => {
          formWithPrecognition.__valid = validator.valid()
        })
        .on('touchedChanged', () => {
          formWithPrecognition.__touched = validator.touched()
        })
        .on('errorsChanged', () => {
          const validationErrors = withAllErrors ? validator.errors() : toSimpleValidationErrors(validator.errors())

          this.errors = {} as FormDataErrors<TForm>

          this.setError(validationErrors as FormDataErrors<TForm>)

          formWithPrecognition.__valid = validator.valid()
        })

      const tap = <T>(value: T, callback: (value: T) => unknown): T => {
        callback(value)
        return value
      }

      Object.assign(formWithPrecognition, {
        __touched: [],
        __valid: [],
        validating: false,
        validator: () => validator,
        withAllErrors: () => tap(formWithPrecognition, () => (withAllErrors = true)),
        valid: (field: string) => formWithPrecognition.__valid.includes(field),
        invalid: (field: string) => field in this.errors,
        setValidationTimeout: (duration: number) => tap(formWithPrecognition, () => validator.setTimeout(duration)),
        validateFiles: () => tap(formWithPrecognition, () => validator.validateFiles()),
        withoutFileValidation: () => tap(formWithPrecognition, () => validator.withoutFileValidation()),
        touch: (
          field: FormDataKeys<TForm> | NamedInputEvent | Array<FormDataKeys<TForm>>,
          ...fields: FormDataKeys<TForm>[]
        ) => {
          if (Array.isArray(field)) {
            validator.touch(field)
          } else if (typeof field === 'string') {
            validator.touch([field, ...fields])
          } else {
            validator.touch(field)
          }

          return formWithPrecognition
        },
        touched: (field?: string): boolean =>
          typeof field === 'string'
            ? formWithPrecognition.__touched.includes(field)
            : formWithPrecognition.__touched.length > 0,
        validate: (field?: string | NamedInputEvent | ValidationConfig, config?: ValidationConfig) => {
          // Handle config object passed as first argument
          if (typeof field === 'object' && !('target' in field)) {
            config = field
            field = undefined
          }

          if (field === undefined) {
            validator.validate(config)
          } else {
            const fieldName = resolveName(field)
            const transformedData = transform(this.data()) as Record<string, unknown>
            validator.validate(fieldName, get(transformedData, fieldName), config)
          }

          return formWithPrecognition
        },
        setErrors: (errors: FormDataErrors<TForm>) => tap(formWithPrecognition, () => this.setError(errors)),
        forgetError: (field: FormDataKeys<TForm> | NamedInputEvent) =>
          tap(formWithPrecognition, () =>
            this.clearErrors(resolveName(field as string | NamedInputEvent) as FormDataKeys<TForm>),
          ),
      })

      return formWithPrecognition
    },
    data() {
      return (Object.keys(defaults) as Array<FormDataKeys<TForm>>).reduce((carry, key) => {
        return set(carry, key, get(this, key))
      }, {} as Partial<TForm>) as TForm
    },
    transform(callback: UseFormTransformCallback<TForm>) {
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

      validatorRef?.defaults(defaults)

      return this
    },
    reset(...fields: FormDataKeys<TForm>[]) {
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

      validatorRef?.reset(...fields)

      return this
    },
    setError(fieldOrFields: FormDataKeys<TForm> | FormDataErrors<TForm>, maybeValue?: ErrorValue) {
      const errors = typeof fieldOrFields === 'string' ? { [fieldOrFields]: maybeValue } : fieldOrFields

      Object.assign(this.errors, errors)

      this.hasErrors = Object.keys(this.errors).length > 0

      validatorRef?.setErrors(errors as Errors)

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

      if (validatorRef) {
        if (fields.length === 0) {
          validatorRef.setErrors({})
        } else {
          fields.forEach(validatorRef.forgetError)
        }
      }

      return this
    },
    resetAndClearErrors(...fields: FormDataKeys<TForm>[]) {
      this.reset(...fields)
      this.clearErrors(...fields)
      return this
    },
    submit(...args: UseFormSubmitArguments) {
      const { method, url, options } = UseFormUtils.parseSubmitArguments(args, precognitionEndpoint)

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

  const typedForm = form as any as InertiaForm<TForm>

  watch(
    typedForm as typeof typedForm & InternalRememberState<TForm>,
    (newValue) => {
      typedForm.isDirty = !isEqual(typedForm.data(), defaults)
      if (rememberKey) {
        router.remember(cloneDeep(newValue.__remember()), rememberKey)
      }
    },
    { immediate: true, deep: true },
  )

  return precognitionEndpoint ? typedForm.withPrecognition(precognitionEndpoint) : typedForm
}
