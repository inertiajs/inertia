import type {
  Errors,
  ErrorValue,
  FormDataErrors,
  FormDataKeys,
  FormDataValues,
  Progress,
  UrlMethodPair,
  UseFormTransformCallback,
  UseFormWithPrecognitionArguments,
} from '@inertiajs/core'
import { router, UseFormUtils } from '@inertiajs/core'
import type { NamedInputEvent, ValidationConfig, Validator } from 'laravel-precognition'
import { createValidator, resolveName, toSimpleValidationErrors } from 'laravel-precognition'
import { cloneDeep, get, has, isEqual, set } from 'lodash-es'

type TransformCallback<TForm> = (data: TForm) => object

type PrecognitionValidationConfig<TKeys> = ValidationConfig & {
  only?: TKeys[] | Iterable<TKeys> | ArrayLike<TKeys>
}

export interface FormStateProps<TForm extends object> {
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
  withPrecognition: (...args: UseFormWithPrecognitionArguments) => FormStateWithPrecognition<TForm>
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

export interface InternalPrecognitionState {
  __touched: string[]
  __valid: string[]
}

export type FormState<TForm extends object> = FormStateProps<TForm> & TForm
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
  getTransform: () => TransformCallback<TForm>
  getValidatorRef: () => Validator | null
  getPrecognitionEndpoint: () => (() => UrlMethodPair) | null
  setFormState: <K extends string>(key: K, value: any) => void
  getRecentlySuccessfulTimeoutId: () => ReturnType<typeof setTimeout> | null
  setRecentlySuccessfulTimeoutId: (id: ReturnType<typeof setTimeout> | null) => void
  wasDefaultsCalledInOnSuccess: () => boolean
  resetDefaultsCalledInOnSuccess: () => void
}

export default function useFormState<TForm extends object>(
  options: UseFormStateOptions<TForm>,
): UseFormStateReturn<TForm> {
  const { data: dataOption, rememberKey, precognitionEndpoint: initialPrecognitionEndpoint } = options

  const isDataFunction = typeof dataOption === 'function'
  const resolveData = () => (isDataFunction ? (dataOption as () => TForm)() : dataOption)

  const restored = rememberKey
    ? (router.restore(rememberKey) as { data: TForm; errors: Record<FormDataKeys<TForm>, ErrorValue> } | null)
    : null

  const initialData = restored?.data ?? cloneDeep(resolveData())
  let defaults = cloneDeep(initialData)
  let transform: TransformCallback<TForm> = (data) => data as object
  let validatorRef: Validator | null = null
  let precognitionEndpoint = initialPrecognitionEndpoint ?? null
  let recentlySuccessfulTimeoutId: ReturnType<typeof setTimeout> | null = null
  let defaultsCalledInOnSuccess = false

  let setFormStateInternal: <K extends string>(key: K, value: any) => void

  const tap = <T>(value: T, callback: (value: T) => unknown): T => {
    callback(value)
    return value
  }

  const withPrecognition = (...args: UseFormWithPrecognitionArguments): FormStateWithPrecognition<TForm> => {
    precognitionEndpoint = UseFormUtils.createWayfinderCallback(...args)

    const formWithPrecognition = () => form as any as FormStateWithPrecognition<TForm>

    let withAllErrors = false

    if (!validatorRef) {
      const validator = createValidator(
        (client) => {
          const { method, url } = precognitionEndpoint!()
          const f = formWithPrecognition()
          const transformedData = cloneDeep(transform(f.data())) as Record<string, unknown>
          return client[method](url, transformedData)
        },
        cloneDeep(defaults) as Record<string, unknown>,
      )

      validatorRef = validator

      validator
        .on('validatingChanged', () => {
          setFormStateInternal('validating', validator.validating())
        })
        .on('validatedChanged', () => {
          setFormStateInternal('__valid', validator.valid())
        })
        .on('touchedChanged', () => {
          setFormStateInternal('__touched', validator.touched())
        })
        .on('errorsChanged', () => {
          const validationErrors = withAllErrors ? validator.errors() : toSimpleValidationErrors(validator.errors())

          setFormStateInternal('errors', {} as FormDataErrors<TForm>)
          formWithPrecognition().setError(validationErrors as FormDataErrors<TForm>)
          setFormStateInternal('__valid', validator.valid())
        })
    }

    Object.assign(form, {
      ...form,
      __touched: [],
      __valid: [],
      validating: false,
      validator: () => validatorRef!,
      validate: (field?: string | NamedInputEvent | ValidationConfig, config?: ValidationConfig) => {
        const f = formWithPrecognition()

        if (typeof field === 'object' && !('target' in field)) {
          config = field
          field = undefined
        }

        if (field === undefined) {
          validatorRef!.validate(config)
        } else {
          field = resolveName(field)
          const transformedData = transform(f.data()) as Record<string, unknown>
          validatorRef!.validate(field, get(transformedData, field), config)
        }

        return f
      },
      touch: (
        field: FormDataKeys<TForm> | NamedInputEvent | Array<FormDataKeys<TForm>>,
        ...fields: FormDataKeys<TForm>[]
      ) => {
        const f = formWithPrecognition()
        if (Array.isArray(field)) {
          validatorRef?.touch(field)
        } else if (typeof field === 'string') {
          validatorRef?.touch([field, ...fields])
        } else {
          validatorRef?.touch(field)
        }

        return f
      },
      validateFiles: () => tap(formWithPrecognition(), () => validatorRef?.validateFiles()),
      setValidationTimeout: (duration: number) => tap(formWithPrecognition(), () => validatorRef!.setTimeout(duration)),
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
          const f = formWithPrecognition()
          f.setError(errors)
        }),
      forgetError: (field: FormDataKeys<TForm> | NamedInputEvent) =>
        tap(formWithPrecognition(), () => {
          const f = formWithPrecognition()
          f.clearErrors(resolveName(field as string | NamedInputEvent) as FormDataKeys<TForm>)
        }),
    })

    return form as any as FormStateWithPrecognition<TForm>
  }

  let form = $state({
    ...initialData,
    isDirty: false,
    errors: (restored?.errors ?? {}) as FormDataErrors<TForm>,
    hasErrors: false,
    progress: null,
    wasSuccessful: false,
    recentlySuccessful: false,
    processing: false,
    setStore(keyOrData: keyof FormStateProps<TForm> | FormDataKeys<TForm> | TForm, maybeValue = undefined) {
      if (typeof keyOrData === 'string') {
        set(form, keyOrData, maybeValue)
      } else {
        Object.assign(form, keyOrData)
      }
    },
    data() {
      return Object.keys(defaults).reduce((carry, key) => {
        return set(carry, key, get(this, key))
      }, {} as TForm)
    },
    transform(callback: TransformCallback<TForm>) {
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
            : Object.assign(cloneDeep(defaults), fieldOrFields)
      }

      validatorRef?.defaults(defaults as Record<string, unknown>)

      return this
    },
    reset(...fields: Array<FormDataKeys<TForm>>) {
      const resolvedData = isDataFunction ? cloneDeep(resolveData()) : defaults
      const clonedData = cloneDeep(resolvedData)

      if (fields.length === 0) {
        if (isDataFunction) {
          defaults = clonedData
        }
        this.setStore(clonedData)
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

      setFormStateInternal('errors', {
        ...this.errors,
        ...errors,
      })

      validatorRef?.setErrors(errors as Errors)

      return this
    },
    clearErrors(...fields: string[]) {
      setFormStateInternal(
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
    withPrecognition,
  } as any)

  setFormStateInternal = <K extends string>(key: K, value: any) => {
    form[key] = value
  }

  $effect(() => {
    if (form.isDirty === isEqual(form.data(), defaults)) {
      setFormStateInternal('isDirty', !form.isDirty)
    }

    const hasErrors = Object.keys(form.errors).length > 0

    if (form.hasErrors !== hasErrors) {
      setFormStateInternal('hasErrors', !form.hasErrors)
    }
  })

  if (precognitionEndpoint) {
    form.withPrecognition(precognitionEndpoint)
  }

  return {
    form: form as FormState<TForm>,
    getDefaults: () => defaults,
    setDefaults: (newDefaults: TForm) => {
      defaults = newDefaults
    },
    getTransform: () => transform,
    getValidatorRef: () => validatorRef,
    getPrecognitionEndpoint: () => precognitionEndpoint,
    setFormState: setFormStateInternal,
    getRecentlySuccessfulTimeoutId: () => recentlySuccessfulTimeoutId,
    setRecentlySuccessfulTimeoutId: (id: ReturnType<typeof setTimeout> | null) => {
      recentlySuccessfulTimeoutId = id
    },
    wasDefaultsCalledInOnSuccess: () => defaultsCalledInOnSuccess,
    resetDefaultsCalledInOnSuccess: () => {
      defaultsCalledInOnSuccess = false
    },
  }
}
