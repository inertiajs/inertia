import Vue from 'vue'
import { Inertia } from '@inertiajs/inertia'

export default function(data) {
  const defaults = JSON.parse(JSON.stringify(data))

  return {
    ...defaults,
    errors: {},
    hasErrors: false,
    processing: false,
    progress: null,
    data() {
      return Object
        .keys(data)
        .reduce((carry, key) => {
          carry[key] = this[key]
          return carry
        }, {})
    },
    reset(fields) {
      fields = Array.isArray(fields) ? fields : Object.values(arguments)

      if (fields.length === 0) {
        Object.assign(this, defaults)
      } else {
        Object.assign(
          this,
          Object
            .keys(defaults)
            .filter(key => fields.includes(key))
            .reduce((carry, key) => {
              carry[key] = defaults[key]
              return carry
            }, {}),
        )
      }

      return this.clearErrors()
    },
    clearErrors() {
      Vue.set(this, 'errors', {})
      this.hasErrors = false

      return this
    },
    serialize() {
      return {
        errors: this.errors,
        ...this.data(),
      }
    },
    unserialize(data) {
      Object.assign(this, data)
      this.hasErrors = Object.keys(this.errors).length > 0
    },
    submit(method, url, options = {}) {
      Inertia[method](url, this.data(), {
        ...options,
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
        onSuccess: page => {
          this.clearErrors()

          if (options.onSuccess) {
            return options.onSuccess(page)
          }
        },
        onError: errors => {
          Vue.set(this, 'errors', errors)
          this.hasErrors = true

          if (options.onError) {
            return options.onError(errors)
          }
        },
        onFinish: () => {
          this.processing = false
          this.progress = null

          if (options.onFinish) {
            return options.onFinish()
          }
        },
      })
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
  }
}
