import { reactive, toRaw, unref, watch } from 'vue'
import cloneDeep from 'lodash.clonedeep'
import { Inertia } from '@inertiajs/inertia'

export default function useForm(data = {}, { key = 'form', remember = true } = {}) {
  const defaults = cloneDeep(data)
  const restored = Inertia.restore(key)
  let recentlySuccessfulTimeoutId = null
  let transform = data => data

  let form = reactive({
    __rememberable: false,
    ...restored ? restored.data : data,
    errors: restored ? restored.errors : {},
    hasErrors: false,
    processing: false,
    progress: null,
    wasSuccessful: false,
    recentlySuccessful: false,
    data() {
      return Object
        .keys(data)
        .reduce((carry, key) => {
          carry[key] = this[key]
          return carry
        }, {})
    },
    transform(callback) {
      transform = callback

      return this
    },
    reset(...fields) {
      let clonedDefaults = cloneDeep(defaults)
      if (fields.length === 0) {
        Object.assign(this, clonedDefaults)
      } else {
        Object.assign(
          this,
          Object
            .keys(clonedDefaults)
            .filter(key => fields.includes(key))
            .reduce((carry, key) => {
              carry[key] = clonedDefaults[key]
              return carry
            }, {}),
        )
      }

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
        onBeforeRender: page => {
          this.errors = page.resolvedErrors
          this.hasErrors = Object.keys(this.errors).length > 0
          this.wasSuccessful = !this.hasErrors
          this.recentlySuccessful = !this.hasErrors

          if (options.onBeforeRender) {
            return options.onBeforeRender(page)
          }
        },
        onSuccess: page => {
          recentlySuccessfulTimeoutId = setTimeout(() => this.recentlySuccessful = false, 2000)

          if (options.onSuccess) {
            return options.onSuccess(page)
          }
        },
        onFinish: () => {
          this.processing = false
          this.progress = null

          if (options.onFinish) {
            return options.onFinish()
          }
        },
      }

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
  })

  if (remember) {
    watch(form, (value) => {
      const raw = toRaw(unref(value))
      Inertia.remember({ data: raw.data(), errors: raw.errors }, key)
    }, { immediate: true, deep: true })
  }

  return form
}
