import type {
  ActiveVisit,
  CancelToken,
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
  UrlMethodPair,
  VisitOptions,
} from '@inertiajs/core'
import { router } from '@inertiajs/core'
import type { AxiosProgressEvent } from 'axios'
import { cloneDeep, get, has, isEqual, set } from 'lodash-es'
import { config } from '.'

type InertiaFormStore<TForm extends object> = InertiaForm<TForm>

type FormOptions = Omit<VisitOptions, 'data'>
type SubmitArgs = [Method, string, FormOptions?] | [UrlMethodPair, FormOptions?]
type TransformCallback<TForm> = (data: TForm) => object

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
  transform(callback: TransformCallback<TForm>): this
  defaults(): this
  defaults(fields: Partial<TForm>): this
  defaults<T extends FormDataKeys<TForm>>(field: T, value: FormDataValues<TForm, T>): this
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
  let cancelToken: CancelToken | null = null
  let recentlySuccessfulTimeoutId: ReturnType<typeof setTimeout> | null = null
  let transform = (data: TForm) => data as object
  // Track if defaults was called manually during onSuccess to avoid
  // overriding user's custom defaults with automatic behavior.
  let defaultsCalledInOnSuccess = false

  let form = $state({
    ...(restored ? restored.data : data),
    isDirty: false,
    errors: (restored ? restored.errors : {}) as FormDataErrors<TForm>,
    hasErrors: false,
    progress: null,
    wasSuccessful: false,
    recentlySuccessful: false,
    processing: false,
    setStore(keyOrData: keyof InertiaFormProps<TForm> | FormDataKeys<TForm> | TForm, maybeValue = undefined) {
      if (typeof keyOrData === 'string') {
        set(form, keyOrData, maybeValue)
      } else {
        Object.assign(form, keyOrData)
      }
    },
    data() {
      return Object.keys(data).reduce((carry, key) => {
        return set(carry, key, get(this, key))
      }, {} as TForm)
    },
    transform(callback: TransformCallback<TForm>) {
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
    reset(...fields: Array<FormDataKeys<TForm>>) {
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
      form.errors = {
        ...this.errors,
        ...((typeof fieldOrFields === 'string' ? { [fieldOrFields]: maybeValue } : fieldOrFields) as Errors),
      } as FormDataErrors<TForm>

      return this
    },
    clearErrors(...fields: string[]) {
      form.errors = Object.keys(this.errors).reduce(
        (carry, field) => ({
          ...carry,
          ...(fields.length > 0 && !fields.includes(field) ? { [field]: (this.errors as Errors)[field] } : {}),
        }),
        {},
      ) as FormDataErrors<TForm>
      return this
    },
    resetAndClearErrors(...fields: Array<FormDataKeys<TForm>>) {
      this.reset(...fields)
      this.clearErrors(...fields)
      return this
    },
    submit(...args: SubmitArgs) {
      const objectPassed = args[0] !== null && typeof args[0] === 'object'

      const method = objectPassed ? args[0].method : args[0]
      const url = objectPassed ? args[0].url : args[1]
      const options = (objectPassed ? args[1] : args[2]) ?? {}

      defaultsCalledInOnSuccess = false

      const transformedData = transform(this.data()) as RequestPayload

      const _options: Omit<VisitOptions, 'method'> = {
        ...options,
        onCancelToken: (token: CancelToken) => {
          cancelToken = token

          if (options.onCancelToken) {
            return options.onCancelToken(token)
          }
        },
        onBefore: (visit: PendingVisit) => {
          form.wasSuccessful = false
          form.recentlySuccessful = false
          if (recentlySuccessfulTimeoutId) {
            clearTimeout(recentlySuccessfulTimeoutId)
          }

          if (options.onBefore) {
            return options.onBefore(visit)
          }
        },
        onStart: (visit: PendingVisit) => {
          form.processing = true

          if (options.onStart) {
            return options.onStart(visit)
          }
        },
        onProgress: (event?: AxiosProgressEvent) => {
          form.progress = event || null

          if (options.onProgress) {
            return options.onProgress(event)
          }
        },
        onSuccess: async (page: Page) => {
          form.processing = false
          form.progress = null
          this.clearErrors()
          form.wasSuccessful = true
          form.recentlySuccessful = true
          recentlySuccessfulTimeoutId = setTimeout(
            () => (form.recentlySuccessful = false),
            config.get('form.recentlySuccessfulDuration'),
          )

          const onSuccess = options.onSuccess ? await options.onSuccess(page) : null

          if (!defaultsCalledInOnSuccess) {
            this.defaults(cloneDeep(this.data()))
          }

          return onSuccess
        },
        onError: (errors: Errors) => {
          form.processing = false
          form.progress = null
          this.clearErrors().setError(errors as FormDataErrors<TForm>)

          if (options.onError) {
            return options.onError(errors)
          }
        },
        onCancel: () => {
          form.processing = false
          form.progress = null

          if (options.onCancel) {
            return options.onCancel()
          }
        },
        onFinish: (visit: ActiveVisit) => {
          form.processing = false
          form.progress = null
          cancelToken = null

          if (options.onFinish) {
            return options.onFinish(visit)
          }
        },
      }

      if (method === 'delete') {
        router.delete(url, { ..._options, data: transformedData })
      } else {
        router[method](url, transformedData, _options)
      }
    },
    get(url: string, options?: VisitOptions) {
      this.submit('get', url, options)
    },
    post(url: string, options?: VisitOptions) {
      this.submit('post', url, options)
    },
    put(url: string, options?: VisitOptions) {
      this.submit('put', url, options)
    },
    patch(url: string, options?: VisitOptions) {
      this.submit('patch', url, options)
    },
    delete(url: string, options?: VisitOptions) {
      this.submit('delete', url, options)
    },
    cancel() {
      cancelToken?.cancel()
    },
  } as InertiaForm<TForm>)

  $effect(() => {
    if (form.isDirty === isEqual(form.data(), defaults)) {
      form.isDirty = !form.isDirty
    }

    const hasErrors = Object.keys(form.errors).length > 0
    if (form.hasErrors !== hasErrors) {
      form.hasErrors = !form.hasErrors
    }

    if (rememberKey) {
      router.remember({ data: form.data(), errors: $state.snapshot(form.errors) }, rememberKey)
    }
  })

  return form as InertiaFormStore<TForm>
}