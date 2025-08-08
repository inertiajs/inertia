import { FormDataConvertible, FormDataKeys, Method, Progress, router, VisitOptions } from '@inertiajs/core'
import { cloneDeep, isEqual } from 'es-toolkit'
import { get, has, set } from 'es-toolkit/compat'
import { reactive, watch } from 'vue'

type FormDataType = Record<string, FormDataConvertible>
type FormOptions = Omit<VisitOptions, 'data'>

export interface AutoSaveOptions {
  url?: string
  method?: Method
  debounce?: number
  skipInertiaFields?: boolean
  onSave?: () => void
  onSaveSuccess?: (page: any) => void
  onSaveError?: (errors: any) => void
}

export interface InertiaFormProps<TForm extends FormDataType> {
  isDirty: boolean
  errors: Partial<Record<FormDataKeys<TForm>, string>>
  hasErrors: boolean
  processing: boolean
  progress: Progress | null
  wasSuccessful: boolean
  recentlySuccessful: boolean
  autosave: boolean
  autosaveOptions: AutoSaveOptions | null
  data(): TForm
  transform(callback: (data: TForm) => object): this
  defaults(): this
  defaults(field: FormDataKeys<TForm>, value: FormDataConvertible): this
  defaults(fields: Partial<TForm>): this
  reset(...fields: FormDataKeys<TForm>[]): this
  clearErrors(...fields: FormDataKeys<TForm>[]): this
  resetAndClearErrors(...fields: FormDataKeys<TForm>[]): this
  setError(field: FormDataKeys<TForm>, value: string): this
  setError(errors: Record<FormDataKeys<TForm>, string>): this
  submit: (...args: [Method, string, FormOptions?] | [{ url: string; method: Method }, FormOptions?]) => void
  get(url: string, options?: FormOptions): void
  post(url: string, options?: FormOptions): void
  put(url: string, options?: FormOptions): void
  patch(url: string, options?: FormOptions): void
  delete(url: string, options?: FormOptions): void
  cancel(): void
  enableAutoSave(options: AutoSaveOptions): void
  disableAutoSave(): void
}

export type InertiaForm<TForm extends FormDataType> = TForm & InertiaFormProps<TForm>

export default function useForm<TForm extends FormDataType>(data: TForm | (() => TForm)): InertiaForm<TForm>
export default function useForm<TForm extends FormDataType>(
  rememberKey: string,
  data: TForm | (() => TForm),
): InertiaForm<TForm>
export default function useForm<TForm extends FormDataType>(
  rememberKeyOrData: string | TForm | (() => TForm),
  maybeData?: TForm | (() => TForm),
): InertiaForm<TForm> {
  const rememberKey = typeof rememberKeyOrData === 'string' ? rememberKeyOrData : null
  const data = (typeof rememberKeyOrData === 'string' ? maybeData : rememberKeyOrData) ?? ({} as TForm)
  
  const restored = rememberKey
    ? (router.restore(rememberKey) as { data: TForm; errors: Record<FormDataKeys<TForm>, string> })
    : null
  let defaults = typeof data === 'function' ? cloneDeep(data()) : cloneDeep(data)
  let cancelToken = null
  let recentlySuccessfulTimeoutId = null
  let transform = (data) => data
  let autoSaveTimer: ReturnType<typeof setTimeout> | null = null
  let useAutoSaveFormHook: any = null
  
  const loadAutoSaveHook = async () => {
    if (useAutoSaveFormHook === null) {
      try {
        const module = await import('@provydon/vue-auto-save')
        useAutoSaveFormHook = module.useAutoSaveForm
      } catch (error) {
        useAutoSaveFormHook = false
      }
    }
    return useAutoSaveFormHook
  }

  const form = reactive({
    ...(restored ? restored.data : cloneDeep(defaults)),
    isDirty: false,
    errors: restored ? restored.errors : {},
    hasErrors: false,
    processing: false,
    progress: null,
    wasSuccessful: false,
    recentlySuccessful: false,
    autosave: false,
    autosaveOptions: null,
    data() {
      return (Object.keys(defaults) as Array<FormDataKeys<TForm>>).reduce((carry, key) => {
        return set(carry, key, get(this, key))
      }, {} as Partial<TForm>) as TForm
    },
    transform(callback) {
      transform = callback

      return this
    },
    defaults(fieldOrFields?: FormDataKeys<TForm> | Partial<TForm>, maybeValue?: FormDataConvertible) {
      if (typeof data === 'function') {
        throw new Error('You cannot call `defaults()` when using a function to define your form data.')
      }

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
    reset(...fields) {
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

      return this
    },
    setError(fieldOrFields: FormDataKeys<TForm> | Record<FormDataKeys<TForm>, string>, maybeValue?: string) {
      Object.assign(this.errors, typeof fieldOrFields === 'string' ? { [fieldOrFields]: maybeValue } : fieldOrFields)

      this.hasErrors = Object.keys(this.errors).length > 0

      return this
    },
    clearErrors(...fields) {
      this.errors = Object.keys(this.errors).reduce(
        (carry, field) => ({
          ...carry,
          ...(fields.length > 0 && !fields.includes(field) ? { [field]: this.errors[field] } : {}),
        }),
        {},
      )

      this.hasErrors = Object.keys(this.errors).length > 0

      return this
    },
    resetAndClearErrors(...fields) {
      this.reset(...fields)
      this.clearErrors(...fields)
      return this
    },
    submit(...args) {
      const objectPassed = typeof args[0] === 'object'

      const method = objectPassed ? args[0].method : args[0]
      const url = objectPassed ? args[0].url : args[1]
      const options = (objectPassed ? args[1] : args[2]) ?? {}

      const data = transform(this.data())
      const _options = {
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
          recentlySuccessfulTimeoutId = setTimeout(() => (this.recentlySuccessful = false), 2000)

          const onSuccess = options.onSuccess ? await options.onSuccess(page) : null
          defaults = cloneDeep(this.data())
          this.isDirty = false
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

      if (method === 'delete') {
        router.delete(url, { ..._options, data })
      } else {
        router[method](url, data, _options)
      }
    },
    get(url, options) {
      this.submit('get', url, options)
    },
    post(url, options) {
      this.submit('post', url, options)
    },
    put(url, options) {
      this.submit('put', url, options)
    },
    patch(url, options) {
      this.submit('patch', url, options)
    },
    delete(url, options) {
      this.submit('delete', url, options)
    },
    cancel() {
      if (cancelToken) {
        cancelToken.cancel()
      }
    },
    enableAutoSave(options: AutoSaveOptions) {
      this.autosave = true
      this.autosaveOptions = options
      
      loadAutoSaveHook().then((hook) => {
        if (hook) {
          const autoSaveOptions = {
            onSave: options.onSave || (() => {
              if (options.url) {
                const method = options.method || 'post'
                this[method](options.url, {
                  preserveState: true,
                  onSuccess: options.onSaveSuccess,
                  onError: options.onSaveError,
                })
              }
            }),
            debounce: options.debounce || 2000,
            skipInertiaFields: true,
            ...options
          }
          hook(this, autoSaveOptions)
        }
      })
    },
    disableAutoSave() {
      this.autosave = false
      this.autosaveOptions = null
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer)
        autoSaveTimer = null
      }
    },
    __rememberable: rememberKey === null,
    __remember() {
      return { data: this.data(), errors: this.errors }
    },
    __restore(restored) {
      Object.assign(this, restored.data)
      this.setError(restored.errors)
    },
  })

  const triggerAutoSave = () => {
    if (!form.autosave || !form.autosaveOptions || form.processing) {
      return
    }

    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
    }

    const debounce = form.autosaveOptions.debounce || 2000
    autoSaveTimer = setTimeout(() => {
      if (form.autosaveOptions?.onSave) {
        form.autosaveOptions.onSave()
      } else if (form.autosaveOptions?.url) {
        const method = form.autosaveOptions.method || 'post'
        const options = {
          preserveState: true,
          onSuccess: form.autosaveOptions.onSaveSuccess,
          onError: form.autosaveOptions.onSaveError,
        }
        form[method](form.autosaveOptions.url, options)
      }
    }, debounce)
  }

  watch(
    form,
    (newValue) => {
      form.isDirty = !isEqual(form.data(), defaults)
      if (rememberKey) {
        router.remember(cloneDeep(newValue.__remember()), rememberKey)
      }
      if (form.autosave && form.isDirty) {
        triggerAutoSave()
      }
    },
    { immediate: true, deep: true },
  )

  return form
}
