import { default as axios } from 'axios'
import { get, isEqual } from 'lodash-es'
import debounce from './debounce'
import { hasFiles, isFile } from './files'
import { ErrorBag, Errors, Method } from './types'

type ValidatableData = Record<string, any>

export function forgetFiles(data: ValidatableData): ValidatableData {
  const newData = { ...data }

  Object.keys(newData).forEach((name) => {
    const value = newData[name]

    if (value === null) {
      return
    }

    if (isFile(value)) {
      delete newData[name]

      return
    }

    if (Array.isArray(value)) {
      newData[name] = Object.values(forgetFiles({ ...value }))

      return
    }

    if (typeof value === 'object') {
      newData[name] = forgetFiles(newData[name] as ValidatableData)

      return
    }
  })

  return newData
}

interface UsePrecognitionOptions {
  onStart: () => void
  onFinish: () => void
}

interface PrecognitionValidateOptions {
  url: string
  method: Method
  data: ValidatableData
  only: string[]
  errorBag?: string
  onPrecognitionSuccess: () => void
  onValidationError: (errors: Errors & ErrorBag) => void
}

interface PrecognitionValidator {
  setOldData: (data: ValidatableData) => void
  validateFiles: (value: boolean) => void
  validate: (options: PrecognitionValidateOptions) => void
  setTimeout: (value: number) => void
}

export default function usePrecognition(precognitionOptions: UsePrecognitionOptions): PrecognitionValidator {
  let oldData: ValidatableData = {}
  let validatingData: ValidatableData = {}

  let validateFiles: boolean = false
  let debounceTimeoutDuration = 3000

  const setDebounceTimeout = (value: number) => {
    debounceTimeoutDuration = value
    validate = createValidateFunction()
  }

  const createValidateFunction = () =>
    debounce(
      (options: PrecognitionValidateOptions) => {
        const data = validateFiles ? options.data : forgetFiles(options.data)
        const changed = options.only.filter((field) => !isEqual(get(data, field), get(oldData, field)))

        if (options.only.length > 0 && changed.length === 0) {
          return
        }

        oldData = validatingData = { ...data }

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
            precognitionOptions.onFinish()
          })
      },
      debounceTimeoutDuration,
      { leading: true, trailing: true },
    )

  let validate = createValidateFunction()

  return {
    setOldData(data: ValidatableData) {
      oldData = { ...data }
    },

    validateFiles(value: boolean) {
      validateFiles = value
    },

    validate,
    setTimeout: setDebounceTimeout,
  }
}
