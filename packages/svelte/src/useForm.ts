import type {
  ActiveVisit,
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
  VisitOptions,
} from '@inertiajs/core'
import { router } from '@inertiajs/core'
import type { AxiosProgressEvent } from 'axios'
import { cloneDeep, isEqual } from 'es-toolkit'
import { get, has, set } from 'es-toolkit/compat'
import { writable, type Writable } from 'svelte/store'

type InertiaFormStore<TForm extends object> = Writable<InertiaForm<TForm>> & InertiaForm<TForm>

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
  submit: (...args: [Method, string, FormOptions?] | [{ url: string; method: Method }, FormOptions?]) => void
  get(url: string, options?: FormOptions): void
  post(url: string, options?: FormOptions): void
  put(url: string, options?: FormOptions): void
  patch(url: string, options?: FormOptions): void
  delete(url: string, options?: FormOptions): void
  cancel(): void
}

export type InertiaForm<TForm extends object> = InertiaFormProps<TForm> & TForm

export default function useForm<TForm extends FormDataType<TForm>>(data: TForm | (() => TForm)): InertiaFormStore<TForm>
export default function useForm<TForm extends FormDataType<TForm>>(
  rememberKey: string,
  data: TForm | (() => TForm),
): InertiaFormStore<TForm>
export default function useForm<TForm extends FormDataType<TForm>>(
  rememberKeyOrData: string | TForm | (() => TForm),
  maybeData?: TForm | (() => TForm),
): InertiaFormStore<TForm> {
  const rememberKey = typeof rememberKeyOrData === 'string' ? rememberKeyOrData : null
  const inputData = (typeof rememberKeyOrData === 'string' ? maybeData : rememberKeyOrData) ?? {}
  const data: TForm = typeof inputData === 'function' ? inputData() : (inputData as TForm)
  const restored = rememberKey
    ? (router.restore(rememberKey) as { data: TForm; errors: Record<FormDataKeys<TForm>, string> } | null)
    : null
  let defaults = cloneDeep(data)
  let cancelToken: { cancel: () => void } | null = null
  let recentlySuccessfulTimeoutId: ReturnType<typeof setTimeout> | null = null
  let transform = (data: TForm) => data as object

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
    transform(callback) {
      transform = callback
      return this
    },
    defaults(fieldOrFields?: FormDataKeys<TForm> | Partial<TForm>, maybeValue?: unknown) {
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
    reset(...fields) {
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
        ...((typeof fieldOrFields === 'string' ? { [fieldOrFields]: maybeValue } : fieldOrFields) as Errors),
      })

      return this
    },
    clearErrors(...fields) {
      this.setStore(
        'errors',
        Object.keys(this.errors).reduce(
          (carry, field) => ({
            ...carry,
            ...(fields.length > 0 && !fields.includes(field) ? { [field]: this.errors[field] } : {}),
          }),
          {},
        ) as Errors,
      )
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
      const data = transform(this.data()) as RequestPayload

      const _options: Omit<VisitOptions, 'method'> = {
        ...options,
        onCancelToken: (token: { cancel: () => void }) => {
          cancelToken = token

          if (options.onCancelToken) {
            return options.onCancelToken(token)
          }
        },
        onBefore: (visit: PendingVisit) => {
          this.setStore('wasSuccessful', false)
          this.setStore('recentlySuccessful', false)
          if (recentlySuccessfulTimeoutId) {
            clearTimeout(recentlySuccessfulTimeoutId)
          }

          if (options.onBefore) {
            return options.onBefore(visit)
          }
        },
        onStart: (visit: PendingVisit) => {
          this.setStore('processing', true)

          if (options.onStart) {
            return options.onStart(visit)
          }
        },
        onProgress: (event?: AxiosProgressEvent) => {
          this.setStore('progress', event as any)

          if (options.onProgress) {
            return options.onProgress(event)
          }
        },
        onSuccess: async (page: Page) => {
          this.clearErrors()
          this.setStore('wasSuccessful', true)
          this.setStore('recentlySuccessful', true)
          recentlySuccessfulTimeoutId = setTimeout(() => this.setStore('recentlySuccessful', false), 2000)

          const onSuccess = options.onSuccess ? await options.onSuccess(page) : null
          this.defaults(cloneDeep(this.data()))
          return onSuccess
        },
        onError: (errors: Errors) => {
          this.clearErrors().setError(errors)

          if (options.onError) {
            return options.onError(errors)
          }
        },
        onCancel: () => {
          if (options.onCancel) {
            return options.onCancel()
          }
        },
        onFinish: (visit: ActiveVisit) => {
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
      cancelToken?.cancel()
    },
  } as InertiaForm<TForm>)

  store.subscribe((form) => {
    if (form.isDirty === isEqual(form.data(), defaults)) {
      form.setStore('isDirty', !form.isDirty)
    }

    const hasErrors = Object.keys(form.errors).length > 0
    if (form.hasErrors !== hasErrors) {
      form.setStore('hasErrors', !form.hasErrors)
    }

    if (rememberKey) {
      router.remember({ data: form.data(), errors: form.errors }, rememberKey)
    }
  })

  return store
}
