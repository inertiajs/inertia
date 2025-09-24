import type {
  ErrorValue,
  FormDataErrors,
  FormDataKeys,
  FormDataType,
  FormDataValues,
  Method,
  Progress,
  UrlMethodPair,
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
  setStore(data: TForm): void
  setStore<T extends FormDataKeys<TForm>>(key: T, value: FormDataValues<TForm, T>): void
  setStore(key: keyof InertiaFormProps<TForm>, value: any): void
  data(): TForm
  transform(callback: (data: TForm) => object): this
  defaults(): this
  defaults(fields: Partial<TForm>): this
  defaults<T extends FormDataKeys<TForm>>(field: T, value: FormDataValues<TForm, T>): this
  reset<K extends FormDataKeys<TForm>>(...fields: K[]): this
  clearErrors<K extends FormDataKeys<TForm>>(...fields: K[]): this
  resetAndClearErrors<K extends FormDataKeys<TForm>>(...fields: K[]): this
  setError<K extends FormDataKeys<TForm>>(field: K, value: ErrorValue): this
  setError(errors: FormDataErrors<TForm>): this
  submit: (...args: [Method, string, FormOptions?] | [UrlMethodPair, FormOptions?]) => void
  get(url: string, options?: FormOptions): void
  post(url: string, options?: FormOptions): void
  put(url: string, options?: FormOptions): void
  patch(url: string, options?: FormOptions): void
  delete(url: string, options?: FormOptions): void
  cancel(): void
}

export type InertiaFormRunes<TForm extends object> = InertiaFormProps<TForm> & TForm

export default function useForm<TForm extends FormDataType<TForm>>(data: TForm | (() => TForm)): InertiaFormRunes<TForm>
export default function useForm<TForm extends FormDataType<TForm>>(
  rememberKey: string,
  data: TForm | (() => TForm),
): InertiaFormRunes<TForm>
export default function useForm<TForm extends FormDataType<TForm>>(
  rememberKeyOrData: string | TForm | (() => TForm),
  maybeData?: TForm | (() => TForm),
): InertiaFormRunes<TForm> {
  const rememberKey = typeof rememberKeyOrData === 'string' ? rememberKeyOrData : null
  const inputData = (typeof rememberKeyOrData === 'string' ? maybeData : rememberKeyOrData) ?? {}
  const initialData: TForm = typeof inputData === 'function' ? inputData() : (inputData as TForm)
  const restored = rememberKey
    ? (router.restore(rememberKey) as { data: TForm; errors: Record<FormDataKeys<TForm>, string> } | null)
    : null

  // Separate reactive variables for better Svelte 5 runes compatibility - based on successful memory approach
  let defaults = $state(cloneDeep(initialData))
  let formData = $state({...(restored ? restored.data : initialData)})
  let errors = $state((restored ? restored.errors : {}) as FormDataErrors<TForm>)
  let isDirty = $state(false)
  let hasErrors = $state(false)
  let progress = $state(null as Progress | null)
  let wasSuccessful = $state(false)
  let recentlySuccessful = $state(false)
  let processing = $state(false)
  
  let cancelToken: { cancel: () => void } | null = null
  let recentlySuccessfulTimeoutId: ReturnType<typeof setTimeout> | null = null
  let transform = (data: TForm) => data as object
  // Track if defaults was called manually during onSuccess to avoid
  // overriding user's custom defaults with automatic behavior.
  let defaultsCalledInOnSuccess = false

  // Create the form object with reactive properties using runes
  const form = {} as any
  
  // Add reactive getters for state properties
  Object.defineProperty(form, 'isDirty', { get: () => isDirty })
  Object.defineProperty(form, 'errors', { get: () => errors })
  Object.defineProperty(form, 'hasErrors', { get: () => hasErrors })
  Object.defineProperty(form, 'progress', { get: () => progress })
  Object.defineProperty(form, 'wasSuccessful', { get: () => wasSuccessful })
  Object.defineProperty(form, 'recentlySuccessful', { get: () => recentlySuccessful })
  Object.defineProperty(form, 'processing', { get: () => processing })
  
  // Add reactive getters/setters for form data properties
  Object.keys(initialData).forEach(key => {
    Object.defineProperty(form, key, {
      get: () => formData[key as keyof TForm],
      set: (value) => { formData[key as keyof TForm] = value },
      enumerable: true,
      configurable: true
    })
  })

  // Add methods to form object
  Object.assign(form, {
    
    // setStore method to update reactive variables
    setStore(keyOrData: any, maybeValue?: any) {
      if (typeof keyOrData === 'string') {
        // Update specific reactive variables
        switch (keyOrData) {
          case 'isDirty':
            isDirty = maybeValue
            break
          case 'errors':
            errors = maybeValue
            break
          case 'hasErrors':
            hasErrors = maybeValue
            break
          case 'progress':
            progress = maybeValue
            break
          case 'wasSuccessful':
            wasSuccessful = maybeValue
            break
          case 'recentlySuccessful':
            recentlySuccessful = maybeValue
            break
          case 'processing':
            processing = maybeValue
            break
          default:
            // Update form data
            set(formData, keyOrData, maybeValue)
            break
        }
      } else {
        // Update form data with object
        Object.assign(formData, keyOrData)
      }
    },
    
    data() {
      return Object.keys(initialData).reduce((carry, key) => {
        return set(carry, key, get(formData, key))
      }, {} as TForm)
    },
    
    transform(callback: (data: TForm) => object) {
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
    
    reset(...fields: FormDataKeys<TForm>[]) {
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

      return this
    },
    
    setError(fieldOrFields: FormDataKeys<TForm> | FormDataErrors<TForm>, maybeValue?: ErrorValue) {
      this.setStore('errors', {
        ...this.errors,
        ...((typeof fieldOrFields === 'string' ? { [fieldOrFields]: maybeValue } : fieldOrFields) as FormDataErrors<TForm>),
      })

      return this
    },
    
    clearErrors(...fields: FormDataKeys<TForm>[]) {
      this.setStore(
        'errors',
        Object.keys(this.errors).reduce(
          (carry, field) => ({
            ...carry,
            ...(fields.length > 0 && !fields.includes(field) ? { [field]: this.errors[field] } : {}),
          }),
          {},
        ) as FormDataErrors<TForm>,
      )
      return this
    },
    
    resetAndClearErrors(...fields: FormDataKeys<TForm>[]) {
      this.reset(...fields)
      this.clearErrors(...fields)
      return this
    },
    
    submit(...args: any[]) {
      const objectPassed = args[0] !== null && typeof args[0] === 'object'

      const method = objectPassed ? args[0].method : args[0]
      const url = objectPassed ? args[0].url : args[1]
      const options = (objectPassed ? args[1] : args[2]) ?? {}

      defaultsCalledInOnSuccess = false

      const data = transform(Object.keys(initialData).reduce((carry, key) => {
        return set(carry, key, get(formData, key))
      }, {} as TForm)) as any

      const _options = {
        ...options,
        onCancelToken: (token: { cancel: () => void }) => {
          cancelToken = token

          if (options.onCancelToken) {
            return options.onCancelToken(token)
          }
        },
        onBefore: (visit: any) => {
          this.setStore('wasSuccessful', false)
          this.setStore('recentlySuccessful', false)
          if (recentlySuccessfulTimeoutId) {
            clearTimeout(recentlySuccessfulTimeoutId)
          }

          if (options.onBefore) {
            return options.onBefore(visit)
          }
        },
        onStart: (visit: any) => {
          this.setStore('processing', true)

          if (options.onStart) {
            return options.onStart(visit)
          }
        },
        onProgress: (event?: any) => {
          this.setStore('progress', event as any)

          if (options.onProgress) {
            return options.onProgress(event)
          }
        },
        onSuccess: async (page: any) => {
          this.setStore('processing', false)
          this.setStore('progress', null)
          this.clearErrors()
          this.setStore('wasSuccessful', true)
          this.setStore('recentlySuccessful', true)
          recentlySuccessfulTimeoutId = setTimeout(() => this.setStore('recentlySuccessful', false), 2000)

          const onSuccess = options.onSuccess ? await options.onSuccess(page) : null

          if (!defaultsCalledInOnSuccess) {
            this.defaults(cloneDeep(this.data()))
          }

          return onSuccess
        },
        onError: (errors: any) => {
          this.setStore('processing', false)
          this.setStore('progress', null)
          this.clearErrors().setError(errors)

          if (options.onError) {
            return options.onError(errors)
          }
        },
        onCancel: () => {
          this.setStore('processing', false)
          this.setStore('progress', null)

          if (options.onCancel) {
            return options.onCancel()
          }
        },
        onFinish: (visit: any) => {
          this.setStore('processing', false)
          this.setStore('progress', null)
          cancelToken = null

          if (options.onFinish) {
            return options.onFinish(visit)
          }
        },
      }

      if (method === 'delete') {
        router.delete(url, { ..._options, data })
      } else if (method === 'get') {
        router.get(url, data, _options)
      } else if (method === 'post') {
        router.post(url, data, _options)
      } else if (method === 'put') {
        router.put(url, data, _options)
      } else if (method === 'patch') {
        router.patch(url, data, _options)
      }
    },
    
    get(url: string, options?: FormOptions) {
      this.submit('get', url, options)
    },
    
    post(url: string, options?: FormOptions) {
      this.submit('post', url, options)
    },
    
    put(url: string, options?: FormOptions) {
      this.submit('put', url, options)
    },
    
    patch(url: string, options?: FormOptions) {
      this.submit('patch', url, options)
    },
    
    delete(url: string, options?: FormOptions) {
      this.submit('delete', url, options)
    },
    
    cancel() {
      cancelToken?.cancel()
    }
  })

  // Update isDirty and hasErrors reactively using $effect
  $effect(() => {
    isDirty = !isEqual(formData, defaults)
  })
  
  $effect(() => {
    hasErrors = Object.keys(errors).length > 0
  })

  // Handle remember functionality
  $effect(() => {
    if (rememberKey) {
      const currentData = Object.keys(initialData).reduce((carry, key) => {
        return set(carry, key, get(formData, key))
      }, {} as TForm)
      router.remember({ data: currentData, errors }, rememberKey)
    }
  })

  return form as InertiaFormRunes<TForm>
}
