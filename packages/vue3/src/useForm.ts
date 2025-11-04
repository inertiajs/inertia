import {
  CancelToken,
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
  withPrecognition(
    method: Method | UrlMethodPair | (() => Method),
    url?: string | (() => string),
  ): InertiaPrecognitiveForm<TForm>
}

export interface InertiaFormValidationProps {
  validator: () => Validator
  validating: boolean
  valid(field: string): boolean
  invalid(field: string): boolean
  touched(field?: string): boolean
  setValidationTimeout(duration: number): this
  validateFiles(): this
  withoutFileValidation(): this
  validate(field?: string | NamedInputEvent | ValidationConfig, config?: ValidationConfig): this
  touch(...fields: string[]): this
  withFullErrors(): this
}

export type InertiaForm<TForm extends object> = TForm & InertiaFormProps<TForm>
export type InertiaPrecognitiveForm<TForm extends object> = InertiaForm<TForm> & InertiaFormValidationProps

export default function useForm<TForm extends FormDataType<TForm>>(data: TForm | (() => TForm)): InertiaForm<TForm>
export default function useForm<TForm extends FormDataType<TForm>>(
  rememberKey: string,
  data: TForm | (() => TForm),
): InertiaForm<TForm>
export default function useForm<TForm extends FormDataType<TForm>>(
  rememberKeyOrData: string | TForm | (() => TForm),
  maybeData?: TForm | (() => TForm),
): InertiaForm<TForm> {
  const rememberKey = typeof rememberKeyOrData === 'string' ? rememberKeyOrData : null
  const data = (typeof rememberKeyOrData === 'string' ? maybeData : rememberKeyOrData) ?? {}
  const restored = rememberKey
    ? (router.restore(rememberKey) as { data: TForm; errors: Record<FormDataKeys<TForm>, string> })
    : null
  let defaults = typeof data === 'function' ? cloneDeep(data()) : cloneDeep(data)
  let cancelToken: CancelToken | null = null
  let recentlySuccessfulTimeoutId: ReturnType<typeof setTimeout>
  let transform: TransformCallback<TForm> = (data) => data

  let precognitionUrl: string | (() => string) | null = null
  let precognitionMethod: Method | (() => Method) | null = null
  let validator: Validator | null = null

  const parseSubmitArgs = (args: SubmitArgs): [Method, string, FormOptions] => {
    let method: Method = typeof precognitionMethod === 'function' ? precognitionMethod() : precognitionMethod!
    let url: string = typeof precognitionUrl === 'function' ? precognitionUrl() : precognitionUrl!
    let options: FormOptions = {}

    if (args.length === 0) {
      // No arguments passed, use precognition values
      return [method, url, options]
    }

    if (args.length === 3) {
      // All arguments passed
      return [args[0], args[1], args[2] ?? {}]
    }

    if (isUrlMethodPair(args[0])) {
      // Wayfinder + optional options
      return [args[0].method, args[0].url, (args[1] ?? {}) as FormOptions]
    }

    if (typeof args[0] === 'object') {
      // Only options passed, use precognition values
      return [method, url, args[0]]
    }

    // Method + URL
    return [args[0] as Method, args[1] as string, {}]
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
    progress: null,
    wasSuccessful: false,
    recentlySuccessful: false,
    withPrecognition(method: Method | UrlMethodPair | (() => Method), url?: string | (() => string)) {
      if (isUrlMethodPair(method)) {
        precognitionMethod = method.method
        precognitionUrl = method.url
      } else {
        precognitionMethod = method
        precognitionUrl = url!
      }

      let simpleValidationErrors = true

      validator = createValidator((client) => {
        const method = typeof precognitionMethod === 'function' ? precognitionMethod() : precognitionMethod!
        const url = typeof precognitionUrl === 'function' ? precognitionUrl() : precognitionUrl!

        const transformedData = transform(this.data()) as Record<string, unknown>

        return client[method](url, transformedData)
      }, defaults)
        .on('validatingChanged', () => {
          this.validating = validator!.validating()
        })
        .on('validatedChanged', () => {
          this.__valid = validator!.valid()
        })
        .on('touchedChanged', () => {
          this.__touched = validator!.touched()
        })
        .on('errorsChanged', () => {
          this.errors = {}

          this.setError(simpleValidationErrors ? toSimpleValidationErrors(validator!.errors()) : validator!.errors())

          this.__valid = validator!.valid()
        })

      Object.assign(this, {
        __touched: [],
        __valid: [],
        validator: () => validator!,
        validating: false,
        setValidationTimeout: (duration: number) => {
          validator!.setTimeout(duration)

          return this
        },
        validateFiles: () => {
          validator!.validateFiles()

          return this
        },
        withFullErrors: () => {
          simpleValidationErrors = false

          return this
        },
        withoutFileValidation: () => {
          // @ts-expect-error - Not released yet...
          validator!.withoutFileValidation()

          return this
        },
        valid: (field: string) => this.__valid.includes(field),
        invalid: (field: string) => this.errors[field] !== undefined,
        validate: (field?: string | NamedInputEvent | ValidationConfig, config?: ValidationConfig) => {
          if (typeof field === 'object' && !('target' in field)) {
            config = field
            field = undefined
          }

          if (typeof field === 'undefined') {
            validator!.validate(config)
          } else {
            field = resolveName(field)

            const transformedData = transform(this.data()) as Record<string, unknown>

            validator!.validate(field, get(transformedData, field), config)
          }

          return this
        },
        touch: (...fields: string[]) => {
          validator!.touch(fields)

          return this
        },
        touched: (field?: string): boolean => {
          if (typeof field === 'string') {
            return this.__touched.includes(field)
          }

          return this.__touched.length > 0
        },
      })

      return this
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

      // @ts-expect-error - validator may be null
      validator?.setErrors(errors)

      return this
    },
    clearErrors(...fields: string[]) {
      this.errors = Object.keys(this.errors).reduce(
        (carry, field) => ({
          ...carry,
          ...(fields.length > 0 && !fields.includes(field) ? { [field]: this.errors[field] } : {}),
        }),
        {},
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
      const [method, url, options] = parseSubmitArgs(args)

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
          this.progress = event

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
          this.clearErrors().setError(errors)

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
    form,
    (newValue) => {
      form.isDirty = !isEqual(form.data(), defaults)
      if (rememberKey) {
        router.remember(cloneDeep(newValue.__remember()), rememberKey)
      }
    },
    { immediate: true, deep: true },
  )

  return form
}
