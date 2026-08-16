import { DestroyRef, computed, effect, inject, signal, type Signal, type WritableSignal } from '@angular/core'
import {
  router,
  type ErrorValue,
  type FormDataErrors,
  type FormDataKeys,
  type FormDataValues,
  type Progress,
  type UrlMethodPair,
  type UseFormTransformCallback,
  UseFormUtils,
  type UseFormWithPrecognitionArguments,
} from '@inertiajs/core'
import { cloneDeep, isEqual } from 'es-toolkit'
import { get, has, merge, set, unset } from 'es-toolkit/compat'
import {
  createValidator,
  resolveName,
  toSimpleValidationErrors,
  type NamedInputEvent,
  type ValidationConfig,
  type Validator,
} from 'laravel-precognition'
import { config } from './config'

export type SetDataByObject<TForm> = (data: Partial<TForm>) => void
export type SetDataByMethod<TForm> = (data: (previousData: TForm) => TForm) => void
export type SetDataByKeyValuePair<TForm> = <K extends FormDataKeys<TForm>>(
  key: K,
  value: FormDataValues<TForm, K>,
) => void
export type SetDataAction<TForm extends object> = SetDataByObject<TForm> &
  SetDataByMethod<TForm> &
  SetDataByKeyValuePair<TForm>

type PrecognitionValidationConfig<TKeys> = ValidationConfig & {
  only?: TKeys[] | Iterable<TKeys> | ArrayLike<TKeys>
}

export interface FormState<TForm extends object> {
  data: WritableSignal<TForm>
  isDirty: Signal<boolean>
  errors: Signal<FormDataErrors<TForm>>
  hasErrors: Signal<boolean>
  processing: Signal<boolean>
  progress: Signal<Progress | null>
  wasSuccessful: Signal<boolean>
  recentlySuccessful: Signal<boolean>
  setData: SetDataAction<TForm>
  transform(callback: UseFormTransformCallback<TForm>): this
  setDefaults: {
    (): void
    <K extends FormDataKeys<TForm>>(field: K, value: FormDataValues<TForm, K>): void
    (fields: Partial<TForm>): void
  }
  reset<K extends FormDataKeys<TForm>>(...fields: K[]): void
  clearErrors<K extends FormDataKeys<TForm>>(...fields: K[]): void
  resetAndClearErrors<K extends FormDataKeys<TForm>>(...fields: K[]): void
  setError: {
    <K extends FormDataKeys<TForm>>(field: K, value: ErrorValue): void
    (errors: FormDataErrors<TForm>): void
  }
  withPrecognition(...args: UseFormWithPrecognitionArguments): PrecognitiveFormState<TForm>
}

export interface FormValidationState<TForm extends object> {
  validating: Signal<boolean>
  invalid<K extends FormDataKeys<TForm>>(field: K): boolean
  setValidationTimeout(duration: number): this
  touch<K extends FormDataKeys<TForm>>(field: K | NamedInputEvent | Array<K>, ...fields: K[]): this
  touched<K extends FormDataKeys<TForm>>(field?: K): boolean
  valid<K extends FormDataKeys<TForm>>(field: K): boolean
  validate<K extends FormDataKeys<TForm>>(
    field?: K | NamedInputEvent | PrecognitionValidationConfig<K>,
    validationConfig?: PrecognitionValidationConfig<K>,
  ): this
  validateFiles(): this
  validator(): Validator
  withAllErrors(): this
  withoutFileValidation(): this
  setErrors(errors: FormDataErrors<TForm>): this
  forgetError<K extends FormDataKeys<TForm> | NamedInputEvent>(field: K): this
}

export type PrecognitiveFormState<TForm extends object> = FormState<TForm> & FormValidationState<TForm>

export interface FormStateController<TForm extends object> {
  form: FormState<TForm>
  getTransform: () => UseFormTransformCallback<TForm>
  getPrecognitionEndpoint: () => (() => UrlMethodPair) | null
  markAsSuccessful: () => void
  defaultsWereSet: () => boolean
  resetDefaultsFlag: () => void
  setRememberExclusions: (keys: FormDataKeys<TForm>[]) => void
  resetBeforeSubmit: () => void
  finishProcessing: () => void
  setProcessing: (value: boolean) => void
  setProgress: (value: Progress | null) => void
  replaceDefaults: (value: TForm) => void
  allErrorsEnabled: () => boolean
  enableAllErrors: () => void
}

export function createFormState<TForm extends object>(options: {
  data: TForm | (() => TForm)
  rememberKey?: string | null
  precognitionEndpoint?: (() => UrlMethodPair) | null
}): FormStateController<TForm> {
  const destroyRef = inject(DestroyRef)
  const isDataFunction = typeof options.data === 'function'
  const resolveData = (): TForm => (isDataFunction ? (options.data as () => TForm)() : (options.data as TForm))
  const remembered =
    options.rememberKey && typeof window !== 'undefined'
      ? (router.restore(options.rememberKey) as { data?: TForm; errors?: FormDataErrors<TForm> } | undefined)
      : undefined
  const resolvedData = cloneDeep(resolveData())
  const initialData = remembered?.data ? (merge(resolvedData, cloneDeep(remembered.data)) as TForm) : resolvedData
  const data = signal<TForm>(initialData)
  const defaults = signal(cloneDeep(initialData))
  const errors = signal<FormDataErrors<TForm>>(remembered?.errors ?? ({} as FormDataErrors<TForm>))
  const processing = signal(false)
  const progress = signal<Progress | null>(null)
  const wasSuccessful = signal(false)
  const recentlySuccessful = signal(false)
  const validating = signal(false)
  const touchedFields = signal<string[]>([])
  const validFields = signal<string[]>([])
  const isDirty = computed(() => !isEqual(data(), defaults()))
  const hasErrors = computed(() => Object.keys(errors()).length > 0)
  let transform: UseFormTransformCallback<TForm> = (value) => value
  let precognitionEndpoint = options.precognitionEndpoint ?? null
  let validator: Validator | null = null
  let recentlySuccessfulTimeout: ReturnType<typeof setTimeout> | undefined
  let defaultsCalled = false
  let rememberExclusions: FormDataKeys<TForm>[] = []
  let useAllErrors: boolean | null = null
  const allErrorsEnabled = () => useAllErrors ?? config.get('form.withAllErrors')

  const setData = ((
    keyOrData: FormDataKeys<TForm> | Partial<TForm> | ((previous: TForm) => TForm),
    value?: unknown,
  ) => {
    if (typeof keyOrData === 'string') {
      data.set(set(cloneDeep(data()), keyOrData, value))
    } else if (typeof keyOrData === 'function') {
      data.update((current) => (keyOrData as (previous: TForm) => TForm)(current))
    } else {
      data.set(cloneDeep(keyOrData as TForm))
    }
  }) as SetDataAction<TForm>

  const setDefaults = ((fieldOrFields?: FormDataKeys<TForm> | Partial<TForm>, value?: unknown) => {
    if (isDataFunction) {
      throw new Error('You cannot call `setDefaults()` when using a function to define form data.')
    }

    defaultsCalled = true
    if (fieldOrFields === undefined) {
      defaults.set(cloneDeep(data()))
    } else if (typeof fieldOrFields === 'string') {
      defaults.update((current) => set(cloneDeep(current), fieldOrFields, value))
    } else {
      defaults.update((current) => ({ ...cloneDeep(current), ...cloneDeep(fieldOrFields) }) as TForm)
    }
    validator?.defaults(defaults() as Record<string, unknown>)
  }) as FormState<TForm>['setDefaults']

  const reset = (...fields: FormDataKeys<TForm>[]) => {
    const resetData = cloneDeep(isDataFunction ? resolveData() : defaults())
    if (fields.length === 0) {
      if (isDataFunction) defaults.set(cloneDeep(resetData))
      data.set(resetData)
    } else {
      data.update((current) => {
        const next = cloneDeep(current)
        fields.filter((field) => has(resetData, field)).forEach((field) => set(next, field, get(resetData, field)))
        return next
      })
      if (isDataFunction) {
        defaults.update((current) => {
          const next = cloneDeep(current)
          fields.filter((field) => has(resetData, field)).forEach((field) => set(next, field, get(resetData, field)))
          return next
        })
      }
    }
    validator?.reset(...fields)
  }

  const setError = ((fieldOrErrors: FormDataKeys<TForm> | FormDataErrors<TForm>, value?: ErrorValue) => {
    const next = {
      ...errors(),
      ...(typeof fieldOrErrors === 'string' ? { [fieldOrErrors]: value } : fieldOrErrors),
    } as FormDataErrors<TForm>
    errors.set(next)
    validator?.setErrors(next)
  }) as FormState<TForm>['setError']

  const clearErrors = (...fields: FormDataKeys<TForm>[]) => {
    if (fields.length === 0) {
      errors.set({} as FormDataErrors<TForm>)
      validator?.setErrors({})
      return
    }

    const next = { ...errors() } as Record<string, ErrorValue>
    fields.forEach((field) => {
      delete next[field]
      validator?.forgetError(field)
    })
    errors.set(next as FormDataErrors<TForm>)
  }

  const form: FormState<TForm> = {
    data,
    isDirty,
    errors: errors.asReadonly(),
    hasErrors,
    processing: processing.asReadonly(),
    progress: progress.asReadonly(),
    wasSuccessful: wasSuccessful.asReadonly(),
    recentlySuccessful: recentlySuccessful.asReadonly(),
    setData,
    transform(callback) {
      transform = callback
      return this
    },
    setDefaults,
    reset,
    clearErrors,
    resetAndClearErrors(...fields) {
      reset(...fields)
      clearErrors(...fields)
    },
    setError,
    withPrecognition(...args) {
      precognitionEndpoint = UseFormUtils.createWayfinderCallback(...args)
      if (!validator) {
        validator = createValidator(
          (client) => {
            const endpoint = precognitionEndpoint!()
            return client[endpoint.method](endpoint.url, cloneDeep(transform(data())) as Record<string, unknown>)
          },
          cloneDeep(defaults()) as Record<string, unknown>,
        )
          .on('validatingChanged', () => validating.set(validator!.validating()))
          .on('validatedChanged', () => validFields.set(validator!.valid()))
          .on('touchedChanged', () => touchedFields.set(validator!.touched()))
          .on('errorsChanged', () => {
            const nextErrors = allErrorsEnabled() ? validator!.errors() : toSimpleValidationErrors(validator!.errors())
            errors.set(nextErrors as FormDataErrors<TForm>)
            validFields.set(validator!.valid())
          })
      }

      const precognitive = form as PrecognitiveFormState<TForm>
      Object.assign(precognitive, {
        validating: validating.asReadonly(),
        validator: () => validator!,
        withAllErrors() {
          useAllErrors = true
          return precognitive
        },
        valid: (field: string) => validFields().includes(field),
        invalid: (field: string) => field in errors(),
        setValidationTimeout(duration: number) {
          validator!.setTimeout(duration)
          return precognitive
        },
        validateFiles() {
          validator!.validateFiles()
          return precognitive
        },
        withoutFileValidation() {
          validator!.withoutFileValidation()
          return precognitive
        },
        touch(
          field: FormDataKeys<TForm> | NamedInputEvent | Array<FormDataKeys<TForm>>,
          ...fields: FormDataKeys<TForm>[]
        ) {
          validator!.touch(Array.isArray(field) ? field : typeof field === 'string' ? [field, ...fields] : field)
          return precognitive
        },
        touched: (field?: string) => (field ? touchedFields().includes(field) : touchedFields().length > 0),
        validate(field?: string | NamedInputEvent | ValidationConfig, validationConfig?: ValidationConfig) {
          if (field && typeof field === 'object' && !('target' in field)) {
            validator!.validate(field)
          } else if (field === undefined) {
            validator!.validate(validationConfig)
          } else {
            const name = resolveName(field)
            validator!.validate(name, get(transform(data()), name), validationConfig)
          }
          return precognitive
        },
        setErrors(nextErrors: FormDataErrors<TForm>) {
          setError(nextErrors)
          return precognitive
        },
        forgetError(field: FormDataKeys<TForm> | NamedInputEvent) {
          clearErrors(resolveName(field) as FormDataKeys<TForm>)
          return precognitive
        },
      } satisfies Partial<PrecognitiveFormState<TForm>>)
      return precognitive
    },
  }

  if (options.rememberKey && typeof window !== 'undefined') {
    effect(() => {
      const current = cloneDeep(data())
      const filtered = { ...current } as Record<string, unknown>
      rememberExclusions.forEach((key) => unset(filtered, key))
      const next = { data: filtered, errors: cloneDeep(errors()) }

      // Skip the write when nothing changed, including this effect's initial run. Every
      // `router.remember()` rewrites `history.state`, and the React/Vue adapters guard the
      // same way.
      if (isEqual(router.restore(options.rememberKey!), next)) {
        return
      }

      router.remember(next, options.rememberKey!)
    })
  }

  if (precognitionEndpoint) {
    form.withPrecognition(precognitionEndpoint)
  }

  destroyRef.onDestroy(() => clearTimeout(recentlySuccessfulTimeout))

  return {
    form,
    getTransform: () => transform,
    getPrecognitionEndpoint: () => precognitionEndpoint,
    markAsSuccessful: () => {
      clearErrors()
      wasSuccessful.set(true)
      recentlySuccessful.set(true)
      clearTimeout(recentlySuccessfulTimeout)
      recentlySuccessfulTimeout = setTimeout(
        () => recentlySuccessful.set(false),
        config.get('form.recentlySuccessfulDuration'),
      )
    },
    defaultsWereSet: () => defaultsCalled,
    resetDefaultsFlag: () => {
      defaultsCalled = false
    },
    setRememberExclusions: (keys) => {
      rememberExclusions = keys
    },
    resetBeforeSubmit: () => {
      wasSuccessful.set(false)
      recentlySuccessful.set(false)
      clearTimeout(recentlySuccessfulTimeout)
    },
    finishProcessing: () => {
      processing.set(false)
      progress.set(null)
    },
    setProcessing: (value) => processing.set(value),
    setProgress: (value) => progress.set(value),
    replaceDefaults: (value) => defaults.set(cloneDeep(value)),
    allErrorsEnabled,
    enableAllErrors: () => {
      useAllErrors = true
    },
  }
}
