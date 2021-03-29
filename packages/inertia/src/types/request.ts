export type Errors = Record<string, Record<string, string>|Array<string>|string>

export type FormDataConvertible = Date|File|Blob|boolean|string|number|null|undefined

export { Method as HttpMethod } from 'axios'

export type RequestPayload = Record<string, FormDataConvertible>|FormData;

