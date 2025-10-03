import { default as axios, AxiosRequestConfig } from 'axios'
import { get, isEqual } from 'lodash-es'
import debounce from './debounce'
import { forgetFiles, hasFiles } from './files'
import { objectToFormData } from './formData'
import { Errors, Method, RequestData } from './types'

interface UsePrecognitionOptions {
  onStart: () => void
  onFinish: () => void
}

interface PrecognitionValidateOptions {
  url: string
  method: Method
  data: RequestData
  only: string[]
  errorBag?: string | null
  onPrecognitionSuccess: () => void
  onValidationError: (errors: Errors) => void
  onFinish?: () => void
}

interface PrecognitionValidator {
  setOldData: (data: RequestData) => void
  validateFiles: (value: boolean) => void
  validate: (options: PrecognitionValidateOptions) => void
  setTimeout: (value: number) => void
}

export default function usePrecognition(precognitionOptions: UsePrecognitionOptions): PrecognitionValidator {
  let debounceTimeoutDuration = 1500
  let validateFiles: boolean = false

  let oldData: RequestData = {}

  const setTimeout = (value: number) => {
    if (value !== debounceTimeoutDuration) {
      debounceTimeoutDuration = value
      validate = createValidateFunction()
    }
  }

  const createValidateFunction = () =>
    debounce(
      (options: PrecognitionValidateOptions) => {
        const changed = options.only.filter((field) => !isEqual(get(options.data, field), get(oldData, field)))
        const data = validateFiles ? options.data : (forgetFiles(options.data) as RequestData)

        if (options.only.length > 0 && changed.length === 0) {
          return
        }

        precognitionOptions.onStart()

        const submitOptions: AxiosRequestConfig = {
          method: options.method,
          url: options.url,
          data: hasFiles(data) ? objectToFormData(data) : { ...data },
          headers: {
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
              return options.onValidationError(scopedErrors)
            }

            throw error
          })
          .finally(() => {
            oldData = { ...data }
            options.onFinish?.()
            precognitionOptions.onFinish()
          })
      },
      debounceTimeoutDuration,
      { leading: true, trailing: true },
    )

  let validate = createValidateFunction()

  return {
    setOldData: (data) => {
      oldData = { ...data }
    },
    validateFiles: (value) => {
      validateFiles = value
    },
    setTimeout,
    validate,
  }
}
