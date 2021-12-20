import isEqual from 'lodash.isequal'
import useRemember from './useRemember'
import { Inertia } from '@inertiajs/inertia'
import { useCallback, useEffect, useRef, useState } from 'react'

export default function useForm(rememberKeyOrInitialData, initialData) {
  
  const isMounted = useRef(null)
  const useRememberKey = typeof rememberKey === 'string' ? rememberKeyOrInitialData : null
  const defaults = useRememberKey === null ? rememberKeyOrInitialData:  initialData
  const cancelToken = useRef(null)
  const recentlySuccessfulTimeoutId = useRef(null)
  const [data, setData] = useRememberKey ? useRemember(defaults, `${useRememberKey}:data`) : useState(defaults)
  const [errors, setErrors] = useRememberKey ? useRemember({}, `${useRememberKey}:errors`) : useState({})
  const [hasErrors, setHasErrors] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(null)
  const [wasSuccessful, setWasSuccessful] = useState(false)
  const [recentlySuccessful, setRecentlySuccessful] = useState(false)
  let transform = (data) => data

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  const submit = useCallback(
    (method, url, options = {}) => {
      const _options = {
        ...options,
        onCancelToken: (token) => {
          cancelToken.current = token

          if (options.onCancelToken) {
            return options.onCancelToken(token)
          }
        },
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
          if (isMounted.current) {
            setProcessing(false)
            setProgress(null)
            setErrors({})
            setHasErrors(false)
            setWasSuccessful(true)
            setRecentlySuccessful(true)
            recentlySuccessfulTimeoutId.current = setTimeout(() => {
              if (isMounted.current) {
                setRecentlySuccessful(false)
              }
            }, 2000)
          }

          if (options.onSuccess) {
            return options.onSuccess(page)
          }
        },
        onError: (errors) => {
          if (isMounted.current) {
            setProcessing(false)
            setProgress(null)
            setErrors(errors)
            setHasErrors(true)
          }

          if (options.onError) {
            return options.onError(errors)
          }
        },
        onCancel: () => {
          if (isMounted.current) {
            setProcessing(false)
            setProgress(null)
          }

          if (options.onCancel) {
            return options.onCancel()
          }
        },
        onFinish: () => {
          if (isMounted.current) {
            setProcessing(false)
            setProgress(null)
          }

          cancelToken.current = null

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
    isDirty: !isEqual(data, defaults),
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
            }, { ...data }),
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
    cancel() {
      if (cancelToken.current) {
        cancelToken.current.cancel()
      }
    },
  }
}
