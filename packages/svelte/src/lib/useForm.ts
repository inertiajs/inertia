import type {
  ActiveVisit,
  Errors,
  Method,
  Page,
  PendingVisit,
  Progress,
  RequestPayload,
  VisitOptions,
} from '@inertiajs/core'
import { router } from '@inertiajs/core'
import type { AxiosProgressEvent } from 'axios'
import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'
import { writable, type Writable } from 'svelte/store'

interface InertiaFormProps<TForm extends Record<string, unknown>> {
  isDirty: boolean
  errors: Partial<Record<keyof TForm, string>>
  hasErrors: boolean
  progress: Progress | null
  wasSuccessful: boolean
  recentlySuccessful: boolean
  processing: boolean
  setStore(data: InertiaFormProps<TForm>): void
  setStore(key: keyof InertiaFormProps<TForm>, value?: any): void
  data(): TForm
  transform(callback: (data: TForm) => object): this
  defaults(): this
  defaults(fields: Record<keyof TForm, string>): this
  defaults(field?: keyof TForm, value?: string): this
  reset(...fields: (keyof TForm)[]): this
  clearErrors(...fields: (keyof TForm)[]): this
  setError(field: keyof TForm, value: string): this
  setError(errors: Errors): this
  submit(method: Method, url: string, options?: Partial<VisitOptions>): void
  get(url: string, options?: Partial<VisitOptions>): void
  post(url: string, options?: Partial<VisitOptions>): void
  put(url: string, options?: Partial<VisitOptions>): void
  patch(url: string, options?: Partial<VisitOptions>): void
  delete(url: string, options?: Partial<VisitOptions>): void
  cancel(): void
}

export type InertiaForm<TForm extends Record<string, unknown>> = TForm & InertiaFormProps<TForm>

export default function useForm<TForm extends Record<string, unknown>>(
  data: TForm | (() => TForm),
): Writable<InertiaForm<TForm>>
export default function useForm<TForm extends Record<string, unknown>>(
  rememberKey: string,
  data: TForm | (() => TForm),
): Writable<InertiaForm<TForm>>
export default function useForm<TForm extends Record<string, unknown>>(
  rememberKeyOrData: string | TForm | (() => TForm),
  maybeData?: TForm | (() => TForm),
): Writable<InertiaForm<TForm>> {
  const rememberKey = typeof rememberKeyOrData === 'string' ? rememberKeyOrData : null
  const data = typeof rememberKeyOrData === 'string' ? maybeData : rememberKeyOrData
  const restored = rememberKey
    ? (router.restore(rememberKey) as { data: TForm; errors: Record<keyof TForm, string> })
    : null
  let defaults = typeof data === 'function' ? cloneDeep(data()) : cloneDeep(data)
  let cancelToken: { cancel: () => void } | null = null
  let recentlySuccessfulTimeoutId: ReturnType<typeof setTimeout> | null = null
  let transform = (data: TForm) => data as object

  const store = writable<InertiaFormProps<TForm>>({
    ...(restored ? restored.data : data),
    isDirty: false,
    errors: restored ? restored.errors : {},
    hasErrors: false,
    progress: null,
    wasSuccessful: false,
    recentlySuccessful: false,
    processing: false,
    setStore(keyOrData: keyof InertiaFormProps<TForm> | InertiaFormProps<TForm>, maybeData?: InertiaFormProps<TForm>) {
      store.update((store) => {
        return Object.assign(store, typeof keyOrData === 'string' ? { [keyOrData]: maybeData } : keyOrData)
      })
    },
    data() {
      return Object.keys((typeof data === 'function' ? data() : data) as Record<string, unknown>).reduce(
        (carry, key) => {
          // @ts-ignore
          carry[key] = this[key]
          return carry
        },
        {} as Record<string, unknown>,
      ) as TForm
    },
    transform(callback) {
      transform = callback

      return this
    },
    defaults(fieldOrFields?: keyof TForm | Record<keyof TForm, string>, maybeValue?: string) {
      if (typeof fieldOrFields === 'undefined') {
        // @ts-ignore
        defaults = Object.assign(defaults, cloneDeep(this.data()))

        return this
      }

      // @ts-ignore
      defaults = Object.assign(
        // @ts-ignore
        cloneDeep(defaults),
        cloneDeep(typeof fieldOrFields === 'string' ? { [fieldOrFields]: maybeValue } : fieldOrFields),
      )

      return this
    },
    reset(...fields) {
      // @ts-ignore
      const resolvedData = typeof data === 'object' ? cloneDeep(defaults) : cloneDeep(data())
      const clonedData = cloneDeep(resolvedData)
      if (fields.length === 0) {
        // @ts-ignore
        this.setStore(clonedData)
      } else {
        this.setStore(
          // @ts-ignore
          Object.keys(clonedData)
            .filter((key) => fields.includes(key))
            .reduce((carry, key) => {
              // @ts-ignore
              carry[key] = clonedData[key]
              return carry
            }, {} as InertiaFormProps<TForm>),
        )
      }

      return this
    },
    setError(fieldOrFields: keyof TForm | Errors, maybeValue?: string) {
      this.setStore('errors', {
        ...this.errors,
        ...((typeof fieldOrFields === 'string' ? { [fieldOrFields]: maybeValue } : fieldOrFields) as any),
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
        ),
      )

      return this
    },
    submit(method, url, options = {}) {
      const data = transform(this.data()) as RequestPayload
      const _options = {
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
        onProgress: (event: AxiosProgressEvent) => {
          this.setStore('progress', event)

          if (options.onProgress) {
            return options.onProgress(event)
          }
        },
        onSuccess: async (page: Page) => {
          this.setStore('processing', false)
          this.setStore('progress', null)
          this.clearErrors()
          this.setStore('wasSuccessful', true)
          this.setStore('recentlySuccessful', true)
          recentlySuccessfulTimeoutId = setTimeout(() => this.setStore('recentlySuccessful', false), 2000)

          if (options.onSuccess) {
            return options.onSuccess(page)
          }
        },
        onError: (errors: Errors) => {
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
        // @ts-ignore
        router.delete(url, { ..._options, data })
      } else {
        // @ts-ignore
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
  })

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

  return store as Writable<InertiaForm<TForm>>
}
