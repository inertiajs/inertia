import { FormDataConvertible, RequestPayload } from './types'

export const isFile = (value: unknown): boolean =>
  (typeof File !== 'undefined' && value instanceof File) ||
  value instanceof Blob ||
  (typeof FileList !== 'undefined' && value instanceof FileList && value.length > 0)

export function hasFiles(data: RequestPayload | FormDataConvertible): boolean {
  return (
    isFile(data) ||
    (data instanceof FormData && Array.from(data.values()).some((value) => hasFiles(value))) ||
    (typeof data === 'object' && data !== null && Object.values(data).some((value) => hasFiles(value)))
  )
}
