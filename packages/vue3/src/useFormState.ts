import {
  Errors,
  ErrorValue,
  FormDataErrors,
  FormDataKeys,
  FormDataValues,
  Progress,
  router,
  UrlMethodPair,
  UseFormTransformCallback,
  UseFormUtils,
  UseFormWithPrecognitionArguments,
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

type PrecognitionValidationConfig<TKeys> = ValidationConfig & {
  only?: TKeys[] | Iterable<TKeys> | ArrayLike<TKeys>
}

export interface FormStateProps<TForm extends object> {
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
  withPrecognition(...args: UseFormWithPrecognitionArguments): this & FormStateValidationProps<TForm>
}

export interface FormStateValidationProps<TForm extends object> {
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

export type FormState<TForm extends object> = TForm & FormStateProps<TForm>
export type FormStateWithPrecognition<TForm extends object> = FormState<TForm> &
  FormStateValidationProps<TForm> &
  InternalPrecognitionState

export interface UseFormStateOptions<TForm extends object> {
  data: TForm | (() => TForm)
  rememberKey?: string | null
  precognitionEndpoint?: (() => UrlMethodPair) | null
}

export interface UseFormStateReturn<TForm extends object> {
  form: FormState<TForm>
  getDefaults: () => TForm
  setDefaults: (newDefaults: TForm) => void
  getTransform: () => UseFormTransformCallback<TForm>
  getValidatorRef: () => Validator | null
  getPrecognitionEndpoint: () => (() => UrlMethodPair) | null
  getRecentlySuccessfulTimeoutId: () => ReturnType<typeof setTimeout> | undefined
  setRecentlySuccessfulTimeoutId: (id: ReturnType<typeof setTimeout>) => void
  clearRecentlySuccessfulTimeout: () => void
  markAsSuccessful: () => void
  wasDefaultsCalledInOnSuccess: () => boolean
  resetDefaultsCalledInOnSuccess: () => void
}

export default function useFormState<TForm extends object>(
  options: UseFormStateOptions<TForm>,
): UseFormStateReturn<TForm> {
  const { data: dataOption, rememberKey } = options
  let { precognitionEndpoint } = options

  const isDataFunction = typeof dataOption === 'function'
  const resolveData = () => (isDataFunction ? (dataOption as () => TForm)() : dataOption)

  const restored = rememberKey
    ? (router.restore(rememberKey) as { data: TForm; errors: Record<FormDataKeys<TForm>, ErrorValue> } | null)
    : null

  const initialData = restored?.data ?? cloneDeep(resolveData())
  let defaults = cloneDeep(initialData)
  let transform: UseFormTransformCallback<TForm> = (data) => data
  let validatorRef: Validator | null = null
  let recentlySuccessfulTimeoutId: ReturnType<typeof setTimeout> | undefined
  let defaultsCalledInOnSuccess = false

  const form = reactive<FormState<TForm>>({
    ...cloneDeep(defaults),
    isDirty: false,
    errors: {} as FormDataErrors<TForm>,
    hasErrors: false,
    processing: false,
    progress: null as Progress | null,
    wasSuccessful: false,
    recentlySuccessful: false,

    withPrecognition(...args: UseFormWithPrecognitionArguments): FormStateWithPrecognition<TForm> {
      precognitionEndpoint = UseFormUtils.createWayfinderCallback(...args)

      const formWithPrecognition = this as any as FormStateWithPrecognition<TForm>

      let withAllErrors = false
      const validator = createValidator(
        (client) => {
          const { method, url } = precognitionEndpoint!()
          const transformedData = cloneDeep(transform(this.data())) as Record<string, unknown>

          return client[method](url, transformedData)
        },
        cloneDeep(defaults) as Record<string, unknown>,
      )

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
      if (isDataFunction) {
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

      validatorRef?.defaults(defaults as Record<string, unknown>)

      return this
    },

    reset(...fields: FormDataKeys<TForm>[]) {
      const resolvedData = isDataFunction ? cloneDeep(resolveData()) : defaults
      const clonedData = cloneDeep(resolvedData)

      if (fields.length === 0) {
        if (isDataFunction) {
          defaults = clonedData
        }
        Object.assign(this, clonedData)
      } else {
        ;(fields as Array<FormDataKeys<TForm>>)
          .filter((key) => has(clonedData, key))
          .forEach((key) => {
            if (isDataFunction) {
              set(defaults, key, get(clonedData, key))
            }
            set(this, key, get(clonedData, key))
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
  })

  const typedForm = form as any as FormState<TForm>

  // Set restored errors if any
  if (restored?.errors) {
    typedForm.setError(restored.errors as FormDataErrors<TForm>)
  }

  watch(
    typedForm,
    () => {
      typedForm.isDirty = !isEqual(typedForm.data(), defaults)
    },
    { immediate: true, deep: true },
  )

  if (precognitionEndpoint) {
    typedForm.withPrecognition(precognitionEndpoint)
  }

  return {
    form: typedForm,
    getDefaults: () => defaults,
    setDefaults: (newDefaults: TForm) => {
      defaults = newDefaults
    },
    getTransform: () => transform,
    getValidatorRef: () => validatorRef,
    getPrecognitionEndpoint: () => precognitionEndpoint ?? null,
    getRecentlySuccessfulTimeoutId: () => recentlySuccessfulTimeoutId,
    setRecentlySuccessfulTimeoutId: (id: ReturnType<typeof setTimeout>) => {
      recentlySuccessfulTimeoutId = id
    },
    clearRecentlySuccessfulTimeout: () => {
      clearTimeout(recentlySuccessfulTimeoutId)
    },
    markAsSuccessful: () => {
      typedForm.clearErrors()
      typedForm.wasSuccessful = true
      typedForm.recentlySuccessful = true

      recentlySuccessfulTimeoutId = setTimeout(
        () => (typedForm.recentlySuccessful = false),
        config.get('form.recentlySuccessfulDuration'),
      )
    },
    wasDefaultsCalledInOnSuccess: () => defaultsCalledInOnSuccess,
    resetDefaultsCalledInOnSuccess: () => {
      defaultsCalledInOnSuccess = false
    },
  }
}
