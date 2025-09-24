import type {
  ErrorValue,
  FormDataErrors,
  FormDataKeys,
  FormDataType,
  FormDataValues,
  Method,
  Progress,
  VisitOptions,
} from '@inertiajs/core'
import { router } from '@inertiajs/core'
import { cloneDeep, get, has, isEqual, set } from 'lodash-es'

type FormOptions = Omit<VisitOptions, 'data'>

export type InertiaFormRunes<TForm extends object> = TForm & {
  isDirty: boolean
  errors: FormDataErrors<TForm>
  hasErrors: boolean
  progress: Progress | null
  wasSuccessful: boolean
  recentlySuccessful: boolean
  processing: boolean
  data(): TForm
  transform(callback: (data: TForm) => object): InertiaFormRunes<TForm>
  defaults(): InertiaFormRunes<TForm>
  defaults(fields: Partial<TForm>): InertiaFormRunes<TForm>
  defaults<T extends FormDataKeys<TForm>>(
    field: T,
    value: FormDataValues<TForm, T>,
  ): InertiaFormRunes<TForm>
  reset<K extends FormDataKeys<TForm>>(...fields: K[]): InertiaFormRunes<TForm>
  clearErrors<K extends FormDataKeys<TForm>>(...fields: K[]): InertiaFormRunes<TForm>
  setError<K extends FormDataKeys<TForm>>(field: K, value: ErrorValue): InertiaFormRunes<TForm>
  setError(errors: FormDataErrors<TForm>): InertiaFormRunes<TForm>
  submit: (method: Method, url: string, options?: FormOptions) => void
  get(url: string, options?: FormOptions): void
  post(url: string, options?: FormOptions): void
  put(url: string, options?: FormOptions): void
  patch(url: string, options?: FormOptions): void
  delete(url: string, options?: FormOptions): void
  cancel(): void
}

export default function useForm<TForm extends FormDataType<TForm>>(
  ...args: [string, TForm | (() => TForm)] | [TForm | (() => TForm)]
): InertiaFormRunes<TForm> {
  const rememberKey = typeof args[0] === 'string' ? args[0] : null
  const dataOrFunction = (typeof args[0] === 'string' ? args[1] : args[0]) as TForm | (() => TForm)
  const initialData = typeof dataOrFunction === 'function' ? dataOrFunction() : dataOrFunction
  const restored = rememberKey ? (router.restore(rememberKey) as { data: TForm; errors: FormDataErrors<TForm> } | null) : null

  let form = $state({
    ...(restored ? restored.data : initialData),
    processing: false,
    progress: null as Progress | null,
    wasSuccessful: false,
    recentlySuccessful: false,
  })
  let defaults = $state(cloneDeep(initialData))
  let errors = $state((restored ? restored.errors : {}) as FormDataErrors<TForm>)
  let transform = (data: TForm) => data as object

  const isDirty = $derived(!isEqual(form, defaults))
  const hasErrors = $derived(Object.keys(errors).length > 0)

  let cancelToken: any = null
  let recentlySuccessfulTimeoutId: any = null
  let defaultsCalledInOnSuccess = false

  const formProxy: InertiaFormRunes<TForm> = new Proxy(form as TForm, {
    get(target, key) {
      if (key === 'isDirty') return isDirty
      if (key === 'hasErrors') return hasErrors
      if (key === 'errors') return errors

      const methods = {
        transform: (callback) => {
          transform = callback
          return formProxy
        },
        defaults: (fieldOrFields, maybeValue) => {
          defaultsCalledInOnSuccess = true
          if (typeof fieldOrFields === 'undefined') {
            defaults = cloneDeep(formProxy.data())
          } else {
            const newDefaults = cloneDeep(defaults)
            if (typeof fieldOrFields === 'string') {
              set(newDefaults, fieldOrFields, maybeValue)
            } else {
              Object.assign(newDefaults, fieldOrFields)
            }
            defaults = newDefaults
          }
          return formProxy
        },
        reset: (...fields) => {
          if (fields.length === 0) {
            const newForm = cloneDeep(defaults)
            Object.keys(form).forEach(key => delete form[key])
            Object.assign(form, newForm)
          } else {
            fields.forEach((field) => set(form, field, get(defaults, field)))
          }
          return formProxy
        },
        setError: (fieldOrFields, maybeValue) => {
          const newErrors = { ...errors }
          if (typeof fieldOrFields === 'string') {
            set(newErrors, fieldOrFields, maybeValue)
          } else {
            Object.assign(newErrors, fieldOrFields)
          }
          errors = newErrors
          return formProxy
        },
        clearErrors: (...fields) => {
          if (fields.length === 0) {
            errors = {}
          } else {
            const newErrors = { ...errors }
            fields.forEach((field) => delete newErrors[field as string])
            errors = newErrors
          }
          return formProxy
        },
        submit: (method, url, options = {}) => {
          defaultsCalledInOnSuccess = false
          const data = transform(formProxy.data())
          const requestOptions = {
            ...options,
            onCancelToken: (token) => {
              cancelToken = token
              if (options.onCancelToken) options.onCancelToken(token)
            },
            onBefore: (visit) => {
              form.wasSuccessful = false
              form.recentlySuccessful = false
              if (recentlySuccessfulTimeoutId) clearTimeout(recentlySuccessfulTimeoutId)
              return options.onBefore?.(visit)
            },
            onStart: (visit) => {
              form.processing = true
              return options.onStart?.(visit)
            },
            onProgress: (event) => {
              form.progress = event
              return options.onProgress?.(event)
            },
            onSuccess: async (page) => {
              form.processing = false
              form.progress = null
              formProxy.clearErrors()
              form.wasSuccessful = true
              form.recentlySuccessful = true
              recentlySuccessfulTimeoutId = setTimeout(() => (form.recentlySuccessful = false), 2000)
              const onSuccess = options.onSuccess ? await options.onSuccess(page) : null
              if (!defaultsCalledInOnSuccess) formProxy.defaults()
              return onSuccess
            },
            onError: (errs) => {
              form.processing = false
              form.progress = null
              formProxy.clearErrors().setError(errs)
              return options.onError?.(errs)
            },
            onCancel: () => {
              form.processing = false
              form.progress = null
              return options.onCancel?.()
            },
            onFinish: (visit) => {
              form.processing = false
              form.progress = null
              cancelToken = null
              return options.onFinish?.(visit)
            },
          }

          if (method === 'delete') {
            router.delete(url, { ...requestOptions, data: data as any })
          } else {
            router[method](url, data as any, requestOptions)
          }
        },
        get: (url, options) => formProxy.submit('get', url, options),
        post: (url, options) => formProxy.submit('post', url, options),
        put: (url, options) => formProxy.submit('put', url, options),
        patch: (url, options) => formProxy.submit('patch', url, options),
        delete: (url, options) => formProxy.submit('delete', url, options),
        cancel: () => cancelToken?.cancel(),
        data: () =>
          Object.keys(initialData).reduce((carry, key) => {
            return set(carry, key, get(form, key))
          }, {} as TForm),
      }

      if (key in methods) return methods[key]
      return target[key]
    },
    set(target, key, value) {
      target[key] = value
      return true
    },
  })

  $effect(() => {
    if (rememberKey) {
      router.remember({ data: formProxy.data(), errors }, rememberKey)
    }
  })

  return formProxy
}