import Vue from 'vue'
import { Inertia } from '@inertiajs/inertia'

export default data => {
  const form = {
    data: { ... data },
    defaults: { ... data },
    errors: {},
    processing: false,
    submit(method, url, options) {
      url = url || Inertia.page.url
      options = options || {}

      Inertia[method](url, form.data, {
        ... options,
        onStart: visit => {
          form.processing = true

          if (options.onStart) {
            return options.onStart(visit)
          }
        },
        onFinish: () => {
          form.processing = false

          if (options.onFinish) {
            return options.onFinish()
          }
        },
        onError: errors => {
          Vue.set(form, 'errors', errors)

          if (options.onError) {
            return options.onError(errors)
          }
        },
        onSuccess: page => {
          Vue.set(form, 'errors', {})

          if (options.onSuccess) {
            return options.onSuccess(page)
          }
        },
      })
    },
    post(url, options) {
      form.submit('post', url, options)
    },
    put(url, options) {
      form.submit('put', url, options)
    },
    patch(url, options) {
      form.submit('patch', url, options)
    },
    delete(url, options) {
      form.submit('delete', url, options)
    },
    reset(fields) {
      const args = Array.isArray(fields)
        ? fields
        : Object.values(arguments)

      if (args.length === 0) {
        form.data = { ... form.defaults }
      } else {
        Object.assign(form.data, Object.keys(form.defaults)
          .filter(key => args.includes(key))
          .reduce((carry, key) => {
            carry[key] = form.defaults[key]
            return carry
          }, {}))
      }

      return this
    },
    hasErrors() {
      return Object.keys(form.errors).length > 0
    },
  }

  return new Proxy(form, {
    has(obj, prop) {
      return Object.keys(form.data).includes(prop) || Object.keys(form).includes(prop)
    },
    get(obj, prop) {
      return form.data[prop] || form[prop]
    },
    set(obj, prop, value){
      if (Object.keys(form).includes(prop)) {
        throw new Error(`Field name [${prop}] cannot be used within an Inertia Form, as it is reserved keyword.`)
      }

      form.data[prop] = value

      return true
    },
  })
}
