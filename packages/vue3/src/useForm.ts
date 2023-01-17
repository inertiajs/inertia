import { HttpMethod, Progress, router, VisitOptions } from '@inertiajs/core'
import cloneDeep from 'lodash.clonedeep'
import isEqual from 'lodash.isequal'
import { reactive, watch } from 'vue'

interface InertiaFormProps<TForm extends Record<string, unknown>> {
  isDirty: boolean
  errors: Partial<Record<keyof TForm, string>>
  hasErrors: boolean
  processing: boolean
  progress: Progress | null
  wasSuccessful: boolean
  recentlySuccessful: boolean
  data(): TForm
  transform(callback: (data: TForm) => object): this
  defaults(): this
  defaults(field: keyof TForm, value: string): this
  defaults(fields: Record<keyof TForm, string>): this
  reset(...fields: (keyof TForm)[]): this
  clearErrors(...fields: (keyof TForm)[]): this
  setError(field: keyof TForm, value: string): this
  setError(errors: Record<keyof TForm, string>): this
  submit(method: HttpMethod, url: string, options?: Partial<VisitOptions>): void
  get(url: string, options?: Partial<VisitOptions>): void
  post(url: string, options?: Partial<VisitOptions>): void
  put(url: string, options?: Partial<VisitOptions>): void
  patch(url: string, options?: Partial<VisitOptions>): void
  delete(url: string, options?: Partial<VisitOptions>): void
  cancel(): void
}

type InertiaForm<TForm extends Record<string, unknown>> = TForm & InertiaFormProps<TForm>

export default function useForm<TForm extends Record<string, unknown>>(data: TForm): InertiaForm<TForm>
export default function useForm<TForm extends Record<string, unknown>>(
  rememberKey: string,
  data: TForm,
): InertiaForm<TForm>
export default function useForm<TForm extends Record<string, unknown>>(
  rememberKeyOrData: string | TForm,
  maybeData?: TForm,
): InertiaForm<TForm> {
  const rememberKey = typeof rememberKeyOrData === 'string' ? rememberKeyOrData : null
  const data = typeof rememberKeyOrData === 'object' ? rememberKeyOrData : maybeData
  const restored = rememberKey
    ? (router.restore(rememberKey) as { data: TForm; errors: Record<keyof TForm, string> })
    : null
  let defaults = cloneDeep(data)
  let cancelToken = null
  let recentlySuccessfulTimeoutId = null
  let transform = (data) => data

  let form = reactive({
    ...(restored ? restored.data : data),
    isDirty: false,
    errors: restored ? restored.errors : {},
    hasErrors: false,
    processing: false,
    progress: null,
    wasSuccessful: false,
    recentlySuccessful: false,
    data() {
      return (Object.keys(data) as Array<keyof TForm>).reduce((carry, key) => {
        // @ts-expect-error
        carry[key] = this[key]
        return carry
      }, {} as Partial<TForm>) as TForm
    },
    transform(callback) {
      transform = callback

      return this
    },
    defaults(fieldOrFields?: keyof TForm | Record<keyof TForm, string>, maybeValue?: string) {
      if (typeof fieldOrFields === 'undefined') {
        defaults = this.data()
      } else {
        defaults = Object.assign(
          {},
          cloneDeep(defaults),
          typeof fieldOrFields === 'string' ? { [fieldOrFields]: maybeValue } : fieldOrFields,
        )
      }

      return this
    },
    reset(...fields) {
      let clonedDefaults = cloneDeep(defaults)
      if (fields.length === 0) {
        Object.assign(this, clonedDefaults)
      } else {
        Object.assign(
          this,
          Object.keys(clonedDefaults)
            .filter((key) => fields.includes(key))
            .reduce((carry, key) => {
              carry[key] = clonedDefaults[key]
              return carry
            }, {}),
        )
      }

      return this
    },
    setError(fieldOrFields: keyof TForm | Record<keyof TForm, string>, maybeValue?: string) {
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
    submit(method, url, options: VisitOptions = {}) {
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
    __rememberable: rememberKey === null,
    __remember() {
      return { data: this.data(), errors: this.errors }
    },
    __restore(restored) {
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
