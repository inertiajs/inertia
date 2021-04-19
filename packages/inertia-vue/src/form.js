import Vue from 'vue'
import cloneDeep from 'lodash.clonedeep'
import { Inertia } from '@inertiajs/inertia'

export default function(...args) {
  const rememberKey = typeof args[0] === 'string' ? args[0] : null
  const data = (typeof args[0] === 'string' ? args[1] : args[0]) || {}
  const defaults = cloneDeep(data)
  const restored = rememberKey ? Inertia.restore(rememberKey) : null
  let cancelToken = null
  let recentlySuccessfulTimeoutId = null
  let transform = data => data

  const form = Vue.observable({
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
        onCancelToken: (token) => {
          cancelToken = token

          if (options.cancelToken) {
            return options.cancelToken(token)
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
        onSuccess: page => {
          this.processing = false
          this.progress = null
          this.clearErrors()
          this.wasSuccessful = true
          this.recentlySuccessful = true
          recentlySuccessfulTimeoutId = setTimeout(() => this.recentlySuccessful = false, 2000)

          if (options.onSuccess) {
            return options.onSuccess(page)
          }
        },
        onError: errors => {
          this.processing = false
          this.progress = null
          this.errors = errors
          this.hasErrors = true

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
        onFinish: () => {
          cancelToken = null

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
      Object.assign(this.errors, restored.errors)
      this.hasErrors = Object.keys(this.errors).length > 0
    },
  })

  if (rememberKey) {
    new Vue({
      created() {
        this.$watch(() => form, newValue => {
          Inertia.remember(newValue.__remember(), rememberKey)
        }, { immediate: true, deep: true })
      },
    })
  }

  return form
}
