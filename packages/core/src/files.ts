import { FormDataConvertible, RequestPayload } from './types'

export function hasFiles(data: RequestPayload | FormDataConvertible): boolean {
  return (
    data instanceof File ||
    data instanceof Blob ||
    (data instanceof FileList && data.length > 0) ||
    (data instanceof FormData && Array.from(data.values()).some((value) => hasFiles(value))) ||
    (typeof data === 'object' && data !== null && Object.values(data).some((value) => hasFiles(value)))
  )
}
