import { FormDataConvertible, RequestPayload } from './types'

export function isFile(value: unknown): boolean {
  return (
    (typeof File !== 'undefined' && value instanceof File) ||
    value instanceof Blob ||
    (typeof FileList !== 'undefined' && value instanceof FileList && value.length > 0)
  )
}

export function hasFiles(data: RequestPayload | FormDataConvertible): boolean {
  return (
    isFile(data) ||
    (data instanceof FormData && Array.from(data.values()).some((value) => hasFiles(value))) ||
    (typeof data === 'object' && data !== null && Object.values(data).some((value) => hasFiles(value)))
  )
}

export function forgetFiles(data: Record<string, unknown>): Record<string, unknown> {
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
      newData[name] = forgetFiles(newData[name] as Record<string, unknown>)

      return
    }
  })

  return newData
}
