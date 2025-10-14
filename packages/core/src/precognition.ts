import { default as axios, AxiosRequestConfig } from 'axios'
import { get, isEqual } from 'lodash-es'
import debounce from './debounce'
import { forgetFiles, hasFiles } from './files'
import { objectToFormData } from './formData'
import { Errors, FormComponentValidateOptions, RequestData, Visit } from './types'

interface UsePrecognitionOptions {
  timeout: number
  onStart: () => void
  onFinish: () => void
}

type PrecognitionValidateOptions = Pick<Visit<RequestData>, 'method' | 'data' | 'only' | 'errorBag' | 'headers'> &
  Pick<FormComponentValidateOptions, 'onBeforeValidation' | 'onException' | 'onFinish'> & {
    url: string
    onPrecognitionSuccess: () => void
    onValidationError: (errors: Errors) => void
    simpleValidationErrors?: boolean
  }

interface PrecognitionValidator {
  setOldData: (data: RequestData) => void
  validateFiles: (value: boolean) => void
  validate: (options: PrecognitionValidateOptions) => void
  setTimeout: (value: number) => void
  cancelAll: () => void
}

export default function usePrecognition(precognitionOptions: UsePrecognitionOptions): PrecognitionValidator {
  let debounceTimeoutDuration = precognitionOptions.timeout
  let validateFiles: boolean = false

  let oldData: RequestData = {}
  let oldTouched: string[] = []
  const abortControllers: Record<string, AbortController> = {}

  const cancelAll = () => {
    Object.entries(abortControllers).forEach(([key, controller]) => {
      controller.abort()
      delete abortControllers[key]
    })
  }

  const setTimeout = (value: number) => {
    if (value !== debounceTimeoutDuration) {
      cancelAll()
      debounceTimeoutDuration = value
      validateFunction = createValidateFunction()
    }
  }

  const createFingerprint = (options: PrecognitionValidateOptions) => `${options.method}:${options.url}`

  const toSimpleValidationErrors = (errors: Errors): Errors => {
    return Object.keys(errors).reduce(
      (carry, key) => ({
        ...carry,
        [key]: Array.isArray(errors[key]) ? errors[key][0] : errors[key],
      }),
      {},
    )
  }

  const createValidateFunction = () =>
    debounce(
      (options: PrecognitionValidateOptions) => {
        const changed = options.only.filter((field) => !isEqual(get(options.data, field), get(oldData, field)))
        const data = validateFiles ? options.data : (forgetFiles(options.data) as RequestData)

        if (options.only.length > 0 && changed.length === 0) {
          return
        }

        const beforeValidatonResult = options.onBeforeValidation?.(
          { data: options.data, touched: options.only },
          { data: oldData, touched: oldTouched },
        )

        if (beforeValidatonResult === false) {
          return
        }

        const fingerprint = createFingerprint(options)

        if (abortControllers[fingerprint]) {
          abortControllers[fingerprint].abort()
          delete abortControllers[fingerprint]
        }

        abortControllers[fingerprint] = new AbortController()

        precognitionOptions.onStart()

        const submitOptions: AxiosRequestConfig = {
          method: options.method,
          url: options.url,
          data: hasFiles(data) ? objectToFormData(data) : { ...data },
          signal: abortControllers[fingerprint].signal,
          headers: {
            ...(options.headers || {}),
            'X-Requested-With': 'XMLHttpRequest',
            Precognition: true,
            ...(options.only.length ? { 'Precognition-Validate-Only': options.only.join(',') } : {}),
          },
        }

        axios(submitOptions)
          .then((response) => {
            if (response.status === 204 && response.headers['precognition-success'] === 'true') {
              options.onPrecognitionSuccess()
            }
          })
          .catch((error) => {
            if (error.response?.status === 422) {
              const errors = error.response.data?.errors || {}
              const scopedErrors = (options.errorBag ? errors[options.errorBag] || {} : errors) as Errors
              const formattedErrors =
                options.simpleValidationErrors === false ? scopedErrors : toSimpleValidationErrors(scopedErrors)
              return options.onValidationError(formattedErrors)
            }

            if (options.onException) {
              options.onException(error)
              return
            }

            throw error
          })
          .finally(() => {
            oldData = { ...data }
            oldTouched = [...options.only]
            delete abortControllers[fingerprint]
            options.onFinish?.()
            precognitionOptions.onFinish()
          })
      },
      debounceTimeoutDuration,
      { leading: true, trailing: true },
    )

  let validateFunction = createValidateFunction()

  return {
    setOldData: (data) => {
      oldData = { ...data }
    },
    validateFiles: (value) => {
      validateFiles = value
    },
    setTimeout,
    validate: (options: PrecognitionValidateOptions) => validateFunction(options),
    cancelAll,
  }
}
