import { Inertia } from '@inertiajs/inertia'
import { useCallback, useRef, useState } from 'react'
import useRemember from './useRemember'

export default function useForm(defaults, key) {
  let transform = (data) => data

  const recentlySuccessfulTimeoutId = useRef(null)
  const [data, setData] = useRemember(defaults, `${key}-data`)
  const [errors, setErrors] = useRemember({}, `${key}-errors`)
  const [hasErrors, setHasErrors] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(null)
  const [wasSuccessful, setWasSuccessful] = useState(false)
  const [recentlySuccessful, setRecentlySuccessful] = useState(false)

  const submit = useCallback(
    (method, url, options = {}) => {
      const _options = {
        ...options,
        onBefore: (visit) => {
          setWasSuccessful(false)
          setRecentlySuccessful(false)
          clearTimeout(recentlySuccessfulTimeoutId.current)

          if (options.onBefore) {
            return options.onBefore(visit)
          }
        },
        onStart: (visit) => {
          setProcessing(true)

          if (options.onStart) {
            return options.onStart(visit)
          }
        },
        onProgress: (event) => {
          setProgress(event)

          if (options.onProgress) {
            return options.onProgress(event)
          }
        },
        onSuccess: (page) => {
          setErrors({})
          setHasErrors(false)
          setWasSuccessful(true)
          setRecentlySuccessful(true)
          recentlySuccessfulTimeoutId.current = setTimeout(() => setRecentlySuccessful(false), 2000)

          if (options.onSuccess) {
            return options.onSuccess(page)
          }
        },
        onError: (errors) => {
          setErrors(errors)
          setHasErrors(true)

          if (options.onError) {
            return options.onError(errors)
          }
        },
        onFinish: () => {
          setProcessing(false)
          setProgress(null)

          if (options.onFinish) {
            return options.onFinish()
          }
        },
      }

      if (method === 'delete') {
        Inertia.delete(url, { ..._options, data: transform(data) })
      } else {
        Inertia[method](url, transform(data), _options)
      }
    },
    [data, setErrors],
  )

  return {
    data,
    setData(key, value) {
      if (typeof key === 'string') {
        setData({ ...data, [key]: value })
      } else if (typeof key === 'function') {
        setData(data => key(data))
      } else {
        setData(key)
      }
    },
    errors,
    hasErrors,
    processing,
    progress,
    wasSuccessful,
    recentlySuccessful,
    transform(callback) {
      transform = callback
    },
    reset(...fields) {
      if (fields.length === 0) {
        setData(defaults)
      } else {
        setData(
          Object.keys(defaults)
            .filter((key) => fields.includes(key))
            .reduce((carry, key) => {
              carry[key] = defaults[key]
              return carry
            }, {}),
        )
      }
    },
    clearErrors(...fields) {
      setErrors(
        Object.keys(errors).reduce(
          (carry, field) => ({
            ...carry,
            ...(fields.length > 0 && !fields.includes(field) ? { [field]: errors[field] } : {}),
          }),
          {},
        ),
      )
      setHasErrors(Object.keys(errors).length > 0)
    },
    submit,
    get(url, options) {
      submit('get', url, options)
    },
    post(url, options) {
      submit('post', url, options)
    },
    put(url, options) {
      submit('put', url, options)
    },
    patch(url, options) {
      submit('patch', url, options)
    },
    delete(url, options) {
      submit('delete', url, options)
    },
  }
}
