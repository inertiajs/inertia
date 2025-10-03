import { default as axios } from 'axios'
import { get, isEqual } from 'lodash-es'
import debounce from './debounce'
import { forgetFiles, hasFiles } from './files'
import { ErrorBag, Errors, Method, RequestData } from './types'

interface UsePrecognitionOptions {
  onStart: () => void
  onFinish: () => void
}

interface PrecognitionValidateOptions {
  url: string
  method: Method
  data: RequestData
  only: string[]
  errorBag?: string
  onPrecognitionSuccess: () => void
  onValidationError: (errors: Errors & ErrorBag) => void
}

interface PrecognitionValidator {
  setOldData: (data: RequestData) => void
  validateFiles: (value: boolean) => void
  validate: (options: PrecognitionValidateOptions) => void
  setTimeout: (value: number) => void
}

export default function usePrecognition(precognitionOptions: UsePrecognitionOptions): PrecognitionValidator {
  let oldData: RequestData = {}
  let validatingData: RequestData = {}

  let validateFiles: boolean = false
  let debounceTimeoutDuration = 1500

  const setDebounceTimeout = (value: number) => {
    if (value !== debounceTimeoutDuration) {
      debounceTimeoutDuration = value
      validate = createValidateFunction()
    }
  }

  const createValidateFunction = () =>
    debounce(
      (options: PrecognitionValidateOptions) => {
        const data = validateFiles ? options.data : (forgetFiles(options.data) as RequestData)
        const changed = options.only.filter((field) => !isEqual(get(data, field), get(oldData, field)))

        if (options.only.length > 0 && changed.length === 0) {
          return
        }

        validatingData = { ...data }

        precognitionOptions.onStart()

        axios({
          method: options.method,
          url: options.url,
          data: validatingData,
          headers: {
            'Content-Type': hasFiles(data) ? 'multipart/form-data' : 'application/json',
            Precognition: true,
            ...(options.only.length ? { 'Precognition-Validate-Only': options.only.join(',') } : {}),
          },
        })
          .then((response) => {
            if (response.status === 204 && response.headers['precognition-success'] === 'true') {
              options.onPrecognitionSuccess()
            }
          })
          .catch((error) => {
            if (error.response?.status === 422) {
              return options.onValidationError(error.response.data?.errors || {})
            }

            throw error
          })
          .finally(() => {
            oldData = { ...validatingData }
            precognitionOptions.onFinish()
          })
      },
      debounceTimeoutDuration,
      { leading: true, trailing: true },
    )

  let validate = createValidateFunction()

  return {
    setOldData(data: RequestData) {
      oldData = { ...data }
    },

    validateFiles(value: boolean) {
      validateFiles = value
    },

    validate,
    setTimeout: setDebounceTimeout,
  }
}
