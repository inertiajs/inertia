import type {
  Errors,
  ErrorValue,
  FormDataErrors,
  FormDataKeys,
  FormDataType,
  Method,
  Progress,
  VisitOptions,
} from '@inertiajs/core'
import { router } from '@inertiajs/core'
import { cloneDeep, get, has, isEqual, set } from 'lodash-es'

type FormOptions = Omit<VisitOptions, 'data'>

export interface InertiaFormProps<TForm extends object> {
  isDirty: boolean
  errors: FormDataErrors<TForm>
  hasErrors: boolean
  progress: Progress | null
  wasSuccessful: boolean
  recentlySuccessful: boolean
  processing: boolean
  data(): TForm
  transform(callback: (data: TForm) => object): InertiaFormRunes<TForm>
  defaults(field?: FormDataKeys<TForm>, value?: unknown): InertiaFormRunes<TForm>
  defaults(fields?: Partial<TForm>): InertiaFormRunes<TForm>
  defaults(): InertiaFormRunes<TForm>
  reset(...fields: FormDataKeys<TForm>[]): InertiaFormRunes<TForm>
  setError(field: FormDataKeys<TForm>, value: ErrorValue): InertiaFormRunes<TForm>
  setError(errors: FormDataErrors<TForm>): InertiaFormRunes<TForm>
  clearErrors(...fields: FormDataKeys<TForm>[]): InertiaFormRunes<TForm>
  submit(method: Method, url: string, options?: FormOptions): void
  get(url: string, options?: FormOptions): void
  post(url: string, options?: FormOptions): void
  put(url: string, options?: FormOptions): void
  patch(url: string, options?: FormOptions): void
  delete(url: string, options?: FormOptions): void
  cancel(): void
}

export type InertiaFormRunes<TForm extends object> = InertiaFormProps<TForm> & TForm

export default function useForm<TForm extends FormDataType<TForm>>(
  data: TForm | (() => TForm)
): InertiaFormRunes<TForm>
export default function useForm<TForm extends FormDataType<TForm>>(
  rememberKey: string,
  data: TForm | (() => TForm)
): InertiaFormRunes<TForm>
export default function useForm<TForm extends FormDataType<TForm>>(
  rememberKeyOrData: string | TForm | (() => TForm),
  maybeData?: TForm | (() => TForm)
): InertiaFormRunes<TForm> {
  const rememberKey = typeof rememberKeyOrData === 'string' ? rememberKeyOrData : null
  const inputData = (typeof rememberKeyOrData === 'string' ? maybeData : rememberKeyOrData) ?? {}
  const initialData: TForm = typeof inputData === 'function' ? inputData() : (inputData as TForm)
  
  const restored = rememberKey
    ? (router.restore(rememberKey) as { data: TForm; errors: Record<FormDataKeys<TForm>, string> } | null)
    : null

  let defaults = $state(cloneDeep(initialData))
  let cancelToken: { cancel: () => void } | null = null
  let recentlySuccessfulTimeoutId: ReturnType<typeof setTimeout> | null = null
  let transform = (data: TForm) => data as object
  let defaultsCalledInOnSuccess = false

  // Create reactive state using $state runes
  let formData = $state<TForm>(restored ? restored.data : initialData)
  let isDirty = $state(false)
  let errors = $state<FormDataErrors<TForm>>((restored ? restored.errors : {}) as FormDataErrors<TForm>)
  let hasErrors = $state(false)
  let progress = $state<Progress | null>(null)
  let wasSuccessful = $state(false)
  let recentlySuccessful = $state(false)
  let processing = $state(false)

  // Derived state for hasErrors
  $effect(() => {
    hasErrors = Object.keys(errors).length > 0
  })

  // Derived state for isDirty
  $effect(() => {
    isDirty = !isEqual(getData(), defaults)
  })

  function getData(): TForm {
    return Object.keys(initialData).reduce((carry, key) => {
      return set(carry, key, get(formData, key))
    }, {} as TForm)
  }

  function setFormData(keyOrData: keyof TForm | TForm, maybeValue?: unknown) {
    if (typeof keyOrData === 'string') {
      set(formData, keyOrData, maybeValue)
    } else {
      // For runes, we need to update each property individually to trigger reactivity
      Object.keys(keyOrData).forEach(key => {
        set(formData, key, get(keyOrData, key))
      })
    }
  }

  // Create reactive getters for all form data properties
  const formDataGetters = Object.keys(initialData).reduce((carry, key) => {
    return {
      ...carry,
      get [key]() { return get(formData, key) }
    }
  }, {} as TForm)

  const form: InertiaFormRunes<TForm> = {
    ...formDataGetters,
    get isDirty() { return isDirty },
    get errors() { return errors },
    get hasErrors() { return hasErrors },
    get progress() { return progress },
    get wasSuccessful() { return wasSuccessful },
    get recentlySuccessful() { return recentlySuccessful },
    get processing() { return processing },

    data() {
      return getData()
    },

    transform(callback) {
      transform = callback
      return form
    },

    defaults(fieldOrFields?: FormDataKeys<TForm> | Partial<TForm>, maybeValue?: unknown) {
      defaultsCalledInOnSuccess = true

      if (typeof fieldOrFields === 'undefined') {
        defaults = cloneDeep(getData())
      } else if (typeof fieldOrFields === 'string') {
        // Update single field
        const newDefaults = cloneDeep(defaults)
        set(newDefaults, fieldOrFields, maybeValue)
        defaults = newDefaults
      } else {
        // Update multiple fields
        const newDefaults = cloneDeep(defaults)
        Object.keys(fieldOrFields).forEach(key => {
          set(newDefaults, key, get(fieldOrFields, key))
        })
        defaults = newDefaults
      }

      return form
    },

    reset(...fields: FormDataKeys<TForm>[]) {
      if (fields.length === 0) {
        // Reset all fields
        const clonedData = cloneDeep(defaults)
        setFormData(clonedData)
      } else {
        // Reset specific fields
        fields.forEach(field => {
          if (has(defaults, field)) {
            const defaultValue = get(defaults, field)
            setFormData(field as keyof TForm, defaultValue)
          }
        })
      }

      return form
    },

    setError(fieldOrFields: FormDataKeys<TForm> | FormDataErrors<TForm>, maybeValue?: ErrorValue) {
      errors = {
        ...errors,
        ...((typeof fieldOrFields === 'string' ? { [fieldOrFields]: maybeValue } : fieldOrFields) as FormDataErrors<TForm>),
      }

      return form
    },

    clearErrors(...fields: FormDataKeys<TForm>[]) {
      errors = Object.keys(errors).reduce(
        (carry, field) => ({
          ...carry,
          ...(fields.length > 0 && !fields.includes(field as FormDataKeys<TForm>) ? { [field]: errors[field as keyof FormDataErrors<TForm>] } : {}),
        }),
        {} as FormDataErrors<TForm>
      )

      return form
    },

    submit(method: Method, url: string, options: FormOptions = {}) {
      const data = transform(getData())
      const _options = {
        ...options,
        onCancelToken: (token: { cancel: () => void }) => {
          cancelToken = token

          if (options.onCancelToken) {
            return options.onCancelToken(token)
          }
        },
        onBefore: (visit) => {
          wasSuccessful = false
          recentlySuccessful = false
          defaultsCalledInOnSuccess = false

          if (recentlySuccessfulTimeoutId) {
            clearTimeout(recentlySuccessfulTimeoutId)
          }

          if (options.onBefore) {
            return options.onBefore(visit)
          }
        },
        onStart: (visit) => {
          processing = true

          if (options.onStart) {
            return options.onStart(visit)
          }
        },
        onProgress: (event) => {
          progress = event

          if (options.onProgress) {
            return options.onProgress(event)
          }
        },
        onSuccess: async (page) => {
          processing = false
          progress = null
          errors = {} as FormDataErrors<TForm>
          wasSuccessful = true
          recentlySuccessful = true

          recentlySuccessfulTimeoutId = setTimeout(() => {
            recentlySuccessful = false
          }, 2000)

          const result = options.onSuccess ? await options.onSuccess(page) : null

          if (!defaultsCalledInOnSuccess) {
            form.defaults()
          }

          return result
        },
        onError: async (errorResponse) => {
          processing = false
          progress = null
          errors = errorResponse as FormDataErrors<TForm>

          if (options.onError) {
            return await options.onError(errorResponse)
          }
        },
        onCancel: () => {
          processing = false
          progress = null

          if (options.onCancel) {
            return options.onCancel()
          }
        },
        onFinish: (visit) => {
          processing = false
          progress = null
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

    get(url: string, options: FormOptions = {}) {
      form.submit('get', url, options)
    },

    post(url: string, options: FormOptions = {}) {
      form.submit('post', url, options)
    },

    put(url: string, options: FormOptions = {}) {
      form.submit('put', url, options)
    },

    patch(url: string, options: FormOptions = {}) {
      form.submit('patch', url, options)
    },

    delete(url: string, options: FormOptions = {}) {
      form.submit('delete', url, options)
    },

    cancel() {
      cancelToken?.cancel()
    },
  } as InertiaFormRunes<TForm>

  // Set up reactive updates for form data properties
  $effect(() => {
    Object.keys(initialData).forEach(key => {
      Object.defineProperty(form, key, {
        get() {
          return get(formData, key)
        },
        set(value) {
          set(formData, key, value)
        },
        enumerable: true,
        configurable: true
      })
    })
  })

  // Set up remember functionality
  $effect(() => {
    if (rememberKey) {
      router.remember({ data: formData, errors }, rememberKey)
    }
  })

  return form
}
