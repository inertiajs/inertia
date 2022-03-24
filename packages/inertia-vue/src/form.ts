import { reactive, watch } from '@vue/composition-api'
import { Inertia, VisitParams, InertiaForm, RequestPayload, Errors, ErrorBag } from '@inertiajs/inertia'
import isEqual from 'lodash.isequal'
import cloneDeep from 'lodash.clonedeep'

type RestoredData = {
  data: Record<string, any>,
  errors: Errors & ErrorBag,
}

export function useForm<Fields>(rememberKey: string, data: Fields): InertiaForm<Fields>
export function useForm<Fields>(data: Fields): InertiaForm<Fields>
export function useForm<Fields extends Record<string, any>>(...args: (string | Fields)[]) {
  const rememberKey = typeof args[0] === 'string' ? args[0] : null
  const data = ((typeof args[0] === 'string' ? args[1] : args[0]) || {}) as Fields
  const restored = rememberKey
    ? Inertia.restore(rememberKey) as RestoredData
    : undefined

  let defaults = cloneDeep(data)
  let cancelToken: { cancel: VoidFunction } | null = null
  let recentlySuccessfulTimeoutId: ReturnType<typeof setTimeout>
  let transform = (data: Fields): RequestPayload => data

  const form = reactive<InertiaForm<Fields>>({
    ...restored ? restored.data : data,
    isDirty: false,
    errors: restored ? restored.errors : {},
    hasErrors: false,
    processing: false,
    progress: undefined,
    wasSuccessful: false,
    recentlySuccessful: false,
    data() {
      return Object
        .keys(data)
        .reduce((carry, key) => {
          (carry as Record<string, any>)[key] = this[key]
          return carry
        }, {} as Fields)
    },
    transform(callback) {
      transform = callback

      return this
    },
    defaults(key, value) {
      if (typeof key === 'undefined') {
        defaults = this.data()
      } else {
        defaults = Object.assign(
          {},
          cloneDeep(defaults),
          value ? ({ [key]: value }) : key,
        )
      }

      return this
    },
    reset(...fields) {
      const clonedDefaults = cloneDeep(defaults)
      if (fields.length === 0) {
        Object.assign(this, clonedDefaults)
      } else {
        Object.assign(
          this,
          Object
            .keys(clonedDefaults)
            .filter(key => fields.includes(key))
            .reduce((carry, key) => {
              (carry as Record<string, any>)[key] = clonedDefaults[key]
              return carry
            }, {}),
        )
      }

      return this
    },
    setError(key, value) {
      Object.assign(this.errors, (value ? { [key as string]: value } : key))

      this.hasErrors = Object.keys(this.errors).length > 0

      return this
    },
    clearErrors(...fields) {
      this.errors = Object
        .keys(this.errors)
        .reduce((carry, field) => ({
          ...carry,
          ...(fields.length > 0 && !fields.includes(field) ? { [field] : this.errors[field] } : {}),
        }), {})

      this.hasErrors = Object.keys(this.errors).length > 0

      return this
    },
    submit(method, url, options = {}) {
      const data = transform(this.data())
      const _options = {
        ...options,
        onCancelToken: (token) => {
          cancelToken = token

          if (options.onCancelToken) {
            return options.onCancelToken(token)
          }
        },
        onBefore: visit => {
          this.wasSuccessful = false
          this.recentlySuccessful = false
          clearTimeout(recentlySuccessfulTimeoutId)

          if (options.onBefore) {
            return options.onBefore(visit)
          }
        },
        onStart: visit => {
          this.processing = true

          if (options.onStart) {
            return options.onStart(visit)
          }
        },
        onProgress: event => {
          this.progress = event

          if (options.onProgress) {
            return options.onProgress(event)
          }
        },
        onSuccess: async page => {
          this.processing = false
          this.progress = undefined
          this.clearErrors()
          this.wasSuccessful = true
          this.recentlySuccessful = true
          recentlySuccessfulTimeoutId = setTimeout(() => this.recentlySuccessful = false, 2000)

          const onSuccess = options.onSuccess ? await options.onSuccess(page) : null
          defaults = cloneDeep(this.data())
          this.isDirty = false
          return onSuccess
        },
        onError: errors => {
          this.processing = false
          this.progress = undefined
          this.clearErrors().setError(errors)

          if (options.onError) {
            return options.onError(errors)
          }
        },
        onCancel: () => {
          this.processing = false
          this.progress = undefined

          if (options.onCancel) {
            return options.onCancel()
          }
        },
        onFinish: visit => {
          this.processing = false
          this.progress = undefined
          cancelToken = null

          if (options.onFinish) {
            return options.onFinish(visit)
          }
        },
      } as VisitParams

      if (method === 'delete') {
        Inertia.delete(url, { ..._options, data  })
      } else {
        Inertia[method](url, data, _options)
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
    __restore(restored: RestoredData) {
      Object.assign(this, restored.data)
      this.setError(restored.errors)
    },
  }) as InertiaForm<Fields>

  watch(form, (newValue: InertiaForm<Fields>) => {
    form.isDirty = !isEqual(form.data(), defaults)
    if (rememberKey) {
      Inertia.remember(cloneDeep(newValue.__remember()), rememberKey)
    }
  }, { immediate: true, deep: true })

  return form
}
